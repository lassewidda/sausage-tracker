import { NextResponse } from 'next/server'
import { getLeaderboard, getAllPlayerGoals, getGoalStreaks, getWeekKey, getChallengeView } from '@/lib/db'
import { generateChannelSummary } from '@/lib/claude'
import { sendSlackChannel } from '@/lib/slack'
import postgres from 'postgres'

export const dynamic = 'force-dynamic'

function getDb() {
  return postgres(process.env.DATABASE_URL!, {
    max: 5,
    ssl: { rejectUnauthorized: false },
    idle_timeout: 20,
    connect_timeout: 10,
  })
}

export async function GET(request: Request) {
  // Verify cron secret (Vercel cron auth)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const leaderboard = await getLeaderboard()
    const goals = await getAllPlayerGoals()
    const streaks = await getGoalStreaks()
    const weekKey = getWeekKey()

    // Filter out test accounts
    const testNames = new Set(['test3', 'lars2'])
    const thisWeek = leaderboard.thisWeek.filter(e => !testNames.has(e.playerName))
    const allGoals = goals.filter(g => !testNames.has(g.playerName))

    const totalPlayers = allGoals.length
    const activePlayers = thisWeek.length
    const totalActivities = thisWeek.reduce((sum, e) => sum + e.totalItems, 0)

    // Goal completions this week
    const goalCompletions = thisWeek.filter(e => {
      const goal = allGoals.find(g => g.playerName === e.playerName)
      if (!goal) return false
      return (e.cardioCount ?? 0) >= goal.cardioTarget && (e.strengthCount ?? 0) >= goal.strengthTarget
    }).length

    // Find top streak
    const realStreaks = streaks.filter(s => !testNames.has(s.playerName) && s.totalGoalWeeks > 0)
    const topStreak = realStreaks.length > 0
      ? realStreaks.sort((a, b) => b.totalGoalWeeks - a.totalGoalWeeks)[0]
      : null

    // Build highlights
    const highlights: string[] = []

    // Players with most workouts this week
    const sorted = [...thisWeek].sort((a, b) => b.totalItems - a.totalItems)
    if (sorted.length > 0) {
      highlights.push(`${sorted[0].playerName.toUpperCase()} leads with ${sorted[0].totalItems} workouts this week`)
    }

    // Players who just completed their goal
    for (const entry of thisWeek) {
      const goal = allGoals.find(g => g.playerName === entry.playerName)
      if (!goal) continue
      const met = (entry.cardioCount ?? 0) >= goal.cardioTarget && (entry.strengthCount ?? 0) >= goal.strengthTarget
      if (met) {
        highlights.push(`${entry.playerName.toUpperCase()} has hit their weekly goal!`)
      }
    }

    // Players with high total counts (milestones)
    for (const entry of leaderboard.allTime.filter(e => !testNames.has(e.playerName))) {
      if (entry.totalItems >= 10 && entry.totalItems % 10 < 5) {
        highlights.push(`${entry.playerName.toUpperCase()} has logged ${entry.totalItems}+ workouts total`)
      }
    }

    // Fetch recent workout descriptions to add color to the summary
    let recentWorkouts: string[] = []
    try {
      const sql = getDb()
      const descRows = await sql`
        SELECT DISTINCT ON (player_name) player_name, ai_description, exercise_type
        FROM meals
        WHERE week_key = ${weekKey}
          AND ai_description IS NOT NULL
          AND ai_description != ''
          AND player_name NOT IN ('test3', 'lars2')
        ORDER BY player_name, created_at DESC
      `
      await sql.end()
      recentWorkouts = descRows
        .filter(r => r.ai_description)
        .map(r => `${(r.player_name as string).toUpperCase()}: ${r.ai_description} (${r.exercise_type})`)
        .slice(0, 6)
    } catch { /* silent */ }

    // Fetch weekly challenge if one exists
    let challengeInfo: { bingoItems: string[]; exerciseMinimum: number } | null = null
    try {
      const view = await getChallengeView(weekKey)
      if (view.challenge) {
        challengeInfo = {
          bingoItems: view.challenge.bingoItems,
          exerciseMinimum: view.challenge.exerciseMinimum,
        }
      }
    } catch { /* silent */ }

    // Determine day label
    const dayOfWeek = new Date().getDay()
    const dayLabel = dayOfWeek === 1 ? 'Monday' : dayOfWeek === 3 ? 'Wednesday' : dayOfWeek === 5 ? 'Friday' : 'mid-week'

    // On Fridays, identify players who already completed their goal (early completers)
    const earlyCompleters = dayLabel === 'Friday'
      ? thisWeek
          .filter(e => {
            const goal = allGoals.find(g => g.playerName === e.playerName)
            if (!goal) return false
            return (e.cardioCount ?? 0) >= goal.cardioTarget && (e.strengthCount ?? 0) >= goal.strengthTarget
          })
          .map(e => e.playerName.toUpperCase())
      : []

    const message = await generateChannelSummary({
      dayLabel,
      totalActivities,
      activePlayers,
      totalPlayers,
      playerHighlights: highlights.slice(0, 6),
      goalCompletions,
      topStreak: topStreak ? { player: topStreak.playerName, weeks: topStreak.totalGoalWeeks } : null,
      recentWorkouts,
      earlyCompleters,
      challengeInfo,
      announcements: weekKey === '2026-W17' && dayLabel === 'Monday'
        ? ['The Battle Arena is NOW OPEN! Challenge your colleagues to Pokemon-style card battles using hero cards earned from your workouts. Create a challenge at https://powerup.eliteprospects.com/battle — may the strongest cards win!']
        : [],
    })

    await sendSlackChannel(message)

    return NextResponse.json({ ok: true, message, weekKey })
  } catch (error) {
    console.error('Channel summary cron error:', error)
    return NextResponse.json({ error: 'Failed to generate summary', details: String(error) }, { status: 500 })
  }
}
