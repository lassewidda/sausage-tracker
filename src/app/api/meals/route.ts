import { NextResponse } from 'next/server'
import { insertMeal, getAllMeals, groupByWeek, addPlayerItem, getPlayerGoal, getWeekKey, getChallengeView, getPlayerMealCount, getSlackUserId, evaluateTeamExercise } from '@/lib/db'
import { rewriteDescriptionForCount, generateFirstWorkoutMessage } from '@/lib/claude'
import { rollItemDrop } from '@/lib/itemCatalog'
import { sendSlackChannel, sendSlackDM, sendWorkoutToThread } from '@/lib/slack'
import { checkMilestones } from '@/lib/milestones'
import postgres from 'postgres'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  try {
    const meals = await getAllMeals()
    const weeks = groupByWeek(meals)
    const grandTotal = meals.reduce((sum, m) => sum + m.itemCount, 0)
    return NextResponse.json({ weeks, grandTotal, meals })
  } catch (error) {
    console.error('GET /api/meals error:', error)
    return NextResponse.json({ error: 'Failed to fetch meals', details: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: {
    imageUrl: string
    blobPath: string
    itemCount: number
    aiSuggestedCount?: number
    aiDescription?: string
    weightPerItem?: number
    playerName?: string
    exerciseType?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { imageUrl, blobPath, itemCount, aiSuggestedCount, aiDescription, weightPerItem, playerName, exerciseType } = body

  if (!imageUrl || !blobPath || itemCount === undefined) {
    return NextResponse.json(
      { error: 'imageUrl, blobPath, and itemCount are required' },
      { status: 400 }
    )
  }

  if (typeof itemCount !== 'number' || itemCount < 0 || !Number.isInteger(itemCount)) {
    return NextResponse.json(
      { error: 'itemCount must be a non-negative integer' },
      { status: 400 }
    )
  }

  let finalDescription = aiDescription ?? null
  if (
    finalDescription &&
    aiSuggestedCount !== undefined &&
    aiSuggestedCount !== null &&
    itemCount !== aiSuggestedCount
  ) {
    try {
      finalDescription = await rewriteDescriptionForCount(finalDescription, aiSuggestedCount, itemCount)
    } catch {
      // keep original description if rewrite fails
    }
  }

  const estimatedGrams =
    weightPerItem && weightPerItem > 0 ? weightPerItem * itemCount : null

  try {
    const normalizedName = (playerName ?? 'Anonymous').trim() || 'Anonymous'
    const meal = await insertMeal({
      imageUrl,
      blobPath,
      itemCount,
      aiSuggestedCount: aiSuggestedCount ?? null,
      aiDescription: finalDescription,
      estimatedGrams,
      playerName: normalizedName,
      exerciseType: exerciseType ?? null,
    })

    // Roll for item drop
    let itemDrop = null
    if (normalizedName !== 'Anonymous') {
      const droppedItem = rollItemDrop()
      if (droppedItem) {
        await addPlayerItem(normalizedName.toLowerCase(), droppedItem.itemKey)
        itemDrop = {
          itemKey: droppedItem.itemKey,
          name: droppedItem.name,
          description: droppedItem.description,
          rarity: droppedItem.rarity,
          flavorText: droppedItem.flavorText,
        }
      }
    }

    // Send personalized DM on first-ever workout, or check milestones for subsequent ones
    let isFirstWorkout = false
    if (normalizedName !== 'Anonymous' && exerciseType) {
      try {
        const mealCount = await getPlayerMealCount(normalizedName.toLowerCase())
        isFirstWorkout = mealCount === 1
        if (isFirstWorkout) {
          const slackId = await getSlackUserId(normalizedName.toLowerCase())
          const goal = await getPlayerGoal(normalizedName.toLowerCase())
          if (slackId && goal) {
            generateFirstWorkoutMessage({
              playerName: normalizedName,
              cardioTarget: goal.cardioTarget,
              strengthTarget: goal.strengthTarget,
              exerciseType,
              workoutDescription: finalDescription,
            }).then(msg => sendSlackDM(slackId, msg)).catch(() => {})
          }
        }
      } catch { /* silent */ }
    }

    // Check if this workout just completed the player's weekly goal
    if (normalizedName !== 'Anonymous' && exerciseType && exerciseType !== 'photo') {
      try {
        const goal = await getPlayerGoal(normalizedName.toLowerCase())
        if (goal && (goal.cardioTarget > 0 || goal.strengthTarget > 0)) {
          const weekKey = getWeekKey()
          const sql = postgres(process.env.DATABASE_URL!, { ssl: { rejectUnauthorized: false } })
          const counts = await sql`
            SELECT
              COUNT(*) FILTER (WHERE exercise_type = 'cardio')::int AS cardio,
              COUNT(*) FILTER (WHERE exercise_type = 'strength')::int AS strength
            FROM meals WHERE player_name = ${normalizedName.toLowerCase()} AND week_key = ${weekKey}
          `
          await sql.end()
          const cardio = counts[0].cardio as number
          const strength = counts[0].strength as number
          const goalMet = cardio >= goal.cardioTarget && strength >= goal.strengthTarget
          // Check if they JUST met it (previous count was below)
          const prevCardio = exerciseType === 'cardio' ? cardio - 1 : cardio
          const prevStrength = exerciseType === 'strength' ? strength - 1 : strength
          const wasMet = prevCardio >= goal.cardioTarget && prevStrength >= goal.strengthTarget
          if (goalMet && !wasMet) {
            const parts = []
            if (goal.cardioTarget > 0) parts.push(`${goal.cardioTarget} cardio`)
            if (goal.strengthTarget > 0) parts.push(`${goal.strengthTarget} strength`)
            sendSlackChannel(`✅ ${normalizedName.toUpperCase()} hit their weekly goal! (${parts.join(' + ')})`).catch(() => {})
          }
        }
      } catch { /* silent */ }

      // Weekly challenge completion channel notification — fires only on the
      // workout that flips this player (or their team) from incomplete to
      // complete (photo route handles the photo-side transition).
      try {
        const weekKey = getWeekKey()
        const view = await getChallengeView(weekKey)
        const ch = view.challenge
        if (ch && ch.challengeMode === 'group' && ch.teams) {
          // Team mode: check if this workout flipped the team from incomplete to complete.
          // The only thing a workout can change is the current player's exercise-met state.
          const team = ch.teams.find(t => t.members.includes(normalizedName.toLowerCase()))
          const teamProgress = view.teamProgress?.find(tp => tp.team.name === team?.name)
          if (team && teamProgress?.isComplete) {
            const allBingoDone = ch.bingoItems.every(item => teamProgress.completedBingoItems.includes(item))
            const wasEv = evaluateTeamExercise(
              team.members,
              m => {
                const mp = teamProgress.memberProgress.find(p => p.playerName === m)
                const cur = mp?.exerciseCount ?? 0
                return m === normalizedName.toLowerCase() ? cur - 1 : cur
              },
              m => {
                const mp = teamProgress.memberProgress.find(p => p.playerName === m)
                const types = { ...(mp?.exerciseTypeCounts ?? {}) }
                if (m === normalizedName.toLowerCase()) {
                  types[exerciseType] = (types[exerciseType] ?? 1) - 1
                }
                return types
              },
              ch,
            )
            const wasComplete = allBingoDone && wasEv.met
            if (!wasComplete) {
              const tag = teamProgress.rescueUsed ? ' (rescue path used)' : ''
              sendSlackChannel(`🏆 Team ${team.name} completed the weekly challenge!${tag}`).catch(() => {})
            }
          }
        } else {
          const participant = view.participants.find(p => p.playerName === normalizedName.toLowerCase())
          if (ch && participant?.isComplete) {
            // Compute previous exercise state by subtracting this workout
            const prevTypeCounts = { ...(participant.exerciseTypeCounts ?? {}) }
            prevTypeCounts[exerciseType] = (prevTypeCounts[exerciseType] ?? 1) - 1
            const prevExerciseCount = participant.exerciseCount - 1
            let wasExerciseMet: boolean
            if (ch.exerciseRequirements) {
              wasExerciseMet = Object.entries(ch.exerciseRequirements).every(
                ([type, req]) => (prevTypeCounts[type] ?? 0) >= (req as number)
              )
            } else {
              wasExerciseMet = prevExerciseCount >= ch.exerciseMinimum
            }
            // allBingoDone unchanged by a workout — only photo uploads change it
            const wasComplete = wasExerciseMet && participant.completedBingoItems.length === ch.bingoItems.length
            if (!wasComplete) {
              sendSlackChannel(`🏆 ${normalizedName.toUpperCase()} completed the weekly challenge!`).catch(() => {})
            }
          }
        }
      } catch { /* silent */ }

      // Check for milestone DMs (non-blocking, sends at most one DM) — skip on first workout
      if (!isFirstWorkout) {
        checkMilestones({ playerName: normalizedName, exerciseType, workoutDescription: finalDescription }).catch(() => {})
      }
    }

    // Post workout to daily Slack thread
    if (normalizedName !== 'Anonymous' && exerciseType && exerciseType !== 'photo') {
      try { await sendWorkoutToThread(normalizedName, finalDescription || '', exerciseType, meal.id, meal.createdAt, meal.imageUrl) } catch { /* silent */ }
    }

    return NextResponse.json({ ...meal, itemDrop }, { status: 201 })
  } catch (error) {
    console.error('POST /api/meals error:', error)
    return NextResponse.json({ error: 'Failed to save meal', details: String(error) }, { status: 500 })
  }
}
