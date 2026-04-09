import Anthropic from '@anthropic-ai/sdk'
import type { AnalysisResult } from '@/types'
import theme from '@/theme'

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

export async function generateHeroCard(data: {
  playerName: string
  totalItems: number
  totalGrams: number
  mealCount: number
  maxInOneMeal: number
  activeWeeks: number
  chainLength: number
  recentMeals: { description: string | null; itemCount: number }[]
  existingTitles?: string[]
  existingTypes?: string[]
}): Promise<{
  heroTitle: string
  heroType: string
  hp: number
  attack: number
  defense: number
  speed: number
  specialMoves: string[]
  weakness: string
  catchphrase: string
  flavorText: string
}> {
  const client = getClient()

  const recentDescriptions = data.recentMeals
    .filter(m => m.description)
    .map(m => `- ${m.itemCount} item(s): ${m.description}`)
    .join('\n')

  const existingTitlesList = data.existingTitles?.length
    ? `\n\nALREADY USED TITLES (DO NOT reuse or closely resemble any of these):\n${data.existingTitles.map(t => `- "${t}"`).join('\n')}`
    : ''

  const existingTypesList = data.existingTypes?.length
    ? `\n\nALREADY USED TYPE COMBINATIONS (MUST pick a DIFFERENT combination):\n${Array.from(new Set(data.existingTypes)).map(t => `- ${t}`).join('\n')}`
    : ''

  const prompt = theme.prompts.heroCardPrompt({
    playerName: data.playerName,
    totalItems: data.totalItems,
    totalWeight: data.totalGrams,
    mealCount: data.mealCount,
    maxInOneMeal: data.maxInOneMeal,
    activeWeeks: data.activeWeeks,
    chainLength: data.chainLength,
    recentDescriptions: recentDescriptions || 'No recent meals',
    existingTitlesList,
    existingTypesList,
  })

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = message.content.find((b) => b.type === 'text')
  if (!block || block.type !== 'text') throw new Error('No response')

  const cleaned = block.text
    .replace(/^```(?:json)?\n?/, '')
    .replace(/\n?```$/, '')
    .trim()

  const parsed = JSON.parse(cleaned)
  // Clamp stats to battle-balanced ranges
  parsed.hp = Math.min(120, Math.max(30, parsed.hp || 80))
  parsed.attack = Math.min(60, Math.max(10, parsed.attack || 30))
  parsed.defense = Math.min(60, Math.max(10, parsed.defense || 30))
  parsed.speed = Math.min(60, Math.max(10, parsed.speed || 30))
  return parsed
}

export async function rewriteDescriptionForCount(
  description: string,
  oldCount: number,
  newCount: number,
): Promise<string> {
  const client = getClient()

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 128,
    messages: [
      {
        role: 'user',
        content: theme.prompts.descriptionRewritePrompt(description, oldCount, newCount),
      },
    ],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') return description
  return textBlock.text.trim()
}

export async function generateWeeklySummary(data: {
  playerName: string
  weekLabel: string
  meals: { description: string | null; itemCount: number; estimatedGrams: number | null; exerciseType?: string | null }[]
  totalItems: number
  totalGrams: number
  chainLength: number
  prevWeekItems: number
  challengeCompleted?: boolean
  challengeDescription?: string
}): Promise<string> {
  const client = getClient()

  const mealList = data.meals
    .map((m, i) => {
      const typeLabel = m.exerciseType ? ` [${m.exerciseType.toUpperCase()}]` : ''
      return `  Workout ${i + 1}${typeLabel}: ${m.itemCount} session(s) — "${m.description ?? 'no description'}"`
    })
    .join('\n')

  // Count exercise types
  const cardioCount = data.meals.filter(m => m.exerciseType === 'cardio').length
  const strengthCount = data.meals.filter(m => m.exerciseType === 'strength').length
  const exerciseBreakdown = cardioCount > 0 || strengthCount > 0
    ? `Exercise breakdown: ${cardioCount} cardio, ${strengthCount} strength.${cardioCount > 0 && strengthCount === 0 ? ' All cardio this week!' : strengthCount > 0 && cardioCount === 0 ? ' Pure strength week!' : ' Nice mix of cardio and strength!'}`
    : undefined

  const chainStatus = data.chainLength > 0
    ? `Active streak: ${data.chainLength} consecutive week(s) with 3+ workouts.`
    : 'Streak: BROKEN (failed to reach 3 workouts this week).'

  const trend = data.prevWeekItems > 0
    ? `Previous week: ${data.prevWeekItems} workouts. Change: ${data.totalItems > data.prevWeekItems ? '+' : ''}${data.totalItems - data.prevWeekItems}.`
    : 'No data from previous week for comparison.'

  const challengeStatus = data.challengeDescription
    ? `Weekly challenge: ${data.challengeDescription}. ${data.challengeCompleted ? 'COMPLETED!' : 'Not yet completed.'}`
    : undefined

  const prompt = theme.prompts.weeklySummaryPrompt({
    playerName: data.playerName,
    weekLabel: data.weekLabel,
    mealList,
    totalItems: data.totalItems,
    totalWeight: data.totalGrams,
    mealCount: data.meals.length,
    chainStatus,
    trend,
    exerciseBreakdown,
    challengeStatus,
  })

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = message.content.find((b) => b.type === 'text')
  if (!block || block.type !== 'text') return 'SUMMARY GENERATION FAILED.'
  return block.text.trim()
}

export async function generateBattleSummary(data: {
  challenger: string
  opponent: string
  winner: string | null
  turns: {
    turnNumber: number
    attacker: string
    attackerCard: string
    defenderCard: string
    moveUsed: string
    damageDealt: number
    typeMultiplier: number
    defenderHpAfter: number
    isKnockout: boolean
    isCritical: boolean
  }[]
}): Promise<string> {
  const client = getClient()

  const turnLog = data.turns.map(t => {
    const multi = t.typeMultiplier > 1 ? ' (SUPER EFFECTIVE!)' : t.typeMultiplier < 1 ? ' (not very effective)' : ''
    const crit = t.isCritical ? ' CRITICAL HIT!' : ''
    const ko = t.isKnockout ? ' — KNOCKOUT!' : ''
    return `Turn ${t.turnNumber}: ${t.attacker}'s ${t.attackerCard} used ${t.moveUsed} on ${t.defenderCard} → ${t.damageDealt} damage${crit}${multi}${ko} (${t.defenderHpAfter} HP left)`
  }).join('\n')

  const prompt = theme.prompts.battleSummaryPrompt({
    challenger: data.challenger,
    opponent: data.opponent,
    winner: data.winner,
    turnLog,
  })

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = message.content.find((b) => b.type === 'text')
  if (!block || block.type !== 'text') return 'THE BATTLE WAS TOO INTENSE TO DESCRIBE.'
  return block.text.trim()
}

export async function analyzeImage(imageUrl: string): Promise<AnalysisResult> {
  const client = getClient()

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    system: theme.prompts.visionSystemPrompt,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'url',
              url: imageUrl,
            },
          },
          {
            type: 'text',
            text: theme.prompts.visionUserPrompt,
          },
        ],
      },
    ],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  // Strip markdown code fences defensively
  const cleaned = textBlock.text
    .replace(/^```(?:json)?\n?/, '')
    .replace(/\n?```$/, '')
    .trim()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed = JSON.parse(cleaned) as any

  const confidence = (['high', 'medium', 'low'].includes(parsed.confidence)
    ? parsed.confidence
    : 'low') as AnalysisResult['confidence']

  // Exercise theme returns exercise_type instead of count/sausage_types
  if (parsed.exercise_type) {
    const validTypes = ['cardio', 'strength']
    const exerciseType = validTypes.includes(parsed.exercise_type) ? parsed.exercise_type : 'cardio'
    return {
      count: 1,
      description: parsed.description || '',
      confidence,
      detectedTypes: [exerciseType],
      weightPerItem: 0,
      exerciseType,
    }
  }

  // Sausage theme: original parsing
  return {
    count: Math.max(0, Math.round(Number(parsed.count) || 0)),
    description: parsed.description || '',
    confidence,
    detectedTypes: Array.isArray(parsed.sausage_types) ? parsed.sausage_types : [],
    weightPerItem: Math.max(0, Math.round(Number(parsed.grams_per_sausage) || 0)),
  }
}

export async function generateFirstWorkoutMessage(data: {
  playerName: string
  cardioTarget: number
  strengthTarget: number
  exerciseType: string
  workoutDescription?: string | null
}): Promise<string> {
  const client = getClient()

  const total = data.cardioTarget + data.strengthTarget
  const goalDescription = []
  if (data.cardioTarget > 0) goalDescription.push(`${data.cardioTarget} cardio`)
  if (data.strengthTarget > 0) goalDescription.push(`${data.strengthTarget} strength`)

  const descContext = data.workoutDescription
    ? `\nThe workout they uploaded was described as: "${data.workoutDescription}"`
    : ''

  const prompt = `You are a fun, motivational fitness coach for a workplace exercise challenge called PowerUp.

${data.playerName.toUpperCase()} just logged their FIRST workout ever in the challenge! It was a ${data.exerciseType} session.${descContext}

Their personal weekly goal is: ${goalDescription.join(' + ')} sessions per week (${total} total).

Write a short, personalized Slack DM (2-3 sentences max). Requirements:
- Congratulate them on their first workout
${data.workoutDescription ? '- Reference what they actually did based on the workout description (e.g. if it was a trail run, a gym session, a Strava screenshot, etc.)' : '- Make a fun comment about their specific goal split (e.g. if heavy on strength, joke about becoming the next Arnold; if all cardio, mention marathon dreams; if balanced, praise the well-rounded approach)'}
- Remind them they can log workouts by screenshotting their training app or taking photos when exercising outdoors
- Keep it casual and encouraging, use 1-2 emojis max
- Do NOT use markdown formatting, just plain text`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = message.content.find((b) => b.type === 'text')
  if (!block || block.type !== 'text') return `💪 Welcome to PowerUp, ${data.playerName}! Your first workout is logged. Keep going!`
  return block.text.trim()
}

export async function generateMilestoneMessage(data: {
  playerName: string
  milestoneType: 'total' | 'weekly_pb' | 'leaderboard' | 'pace' | 'comeback'
  context: string
  workoutDescription?: string | null
}): Promise<string> {
  const client = getClient()

  const descContext = data.workoutDescription
    ? `\nTheir latest workout was: "${data.workoutDescription}"`
    : ''

  const prompt = `You are a fun, motivational fitness coach for a workplace exercise challenge called PowerUp. All participants work at EliteProspects.com (ice hockey database), so feel free to use hockey references when they fit naturally.

${data.playerName.toUpperCase()} just hit a milestone: ${data.context}${descContext}

Write a short Slack DM (1-2 sentences max). Requirements:
- Celebrate this specific milestone
${data.workoutDescription ? '- Weave in a reference to their actual workout (e.g. if it was a trail run, mention it naturally)' : ''}
- Keep it casual, encouraging, and personal — hockey analogies welcome but not forced
- Use 1 emoji max
- Do NOT use markdown formatting, just plain text`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = message.content.find((b) => b.type === 'text')
  if (!block || block.type !== 'text') return `💪 ${data.playerName.toUpperCase()}, ${data.context}`
  return block.text.trim()
}

export async function generateChannelSummary(data: {
  dayLabel: string
  totalActivities: number
  activePlayers: number
  totalPlayers: number
  playerHighlights: string[]
  goalCompletions: number
  topStreak: { player: string; weeks: number } | null
  recentWorkouts?: string[]
}): Promise<string> {
  const client = getClient()

  const highlights = data.playerHighlights.length > 0
    ? `Notable highlights:\n${data.playerHighlights.map(h => `- ${h}`).join('\n')}`
    : 'No specific highlights yet.'

  const workoutColor = data.recentWorkouts && data.recentWorkouts.length > 0
    ? `\nRecent workout snapshots from participants:\n${data.recentWorkouts.map(w => `- ${w}`).join('\n')}`
    : ''

  const prompt = `You are a motivational fitness coach posting a ${data.dayLabel} update to a workplace Slack channel for the PowerUp exercise challenge. All participants work at EliteProspects.com (ice hockey database), so hockey references and analogies are welcome when they fit naturally.

Stats this week:
- ${data.totalActivities} total workouts logged
- ${data.activePlayers} of ${data.totalPlayers} players have logged at least one workout
- ${data.goalCompletions} players have already completed their weekly goal
${data.topStreak ? `- Longest streak: ${data.topStreak.player} with ${data.topStreak.weeks} consecutive goal weeks` : ''}

${highlights}${workoutColor}

Write a short Slack channel post (4-6 lines max). Requirements:
- Start with a relevant emoji
- Be motivational and positive — but do NOT start with a label like "Monday Motivation:", "Mid-week Update:", or the day name. Jump straight into the content about the players and their achievements.
- Highlight standout achievements from the highlights
- If workout descriptions are provided, weave in specific details about what people are doing (e.g. "Emma crushed a 10km trail run" or "Marcus hit the gym for deadlifts") — this makes the post feel alive and personal
- Gently encourage those who haven't logged yet (without shaming)
- If it's Monday: energize for the new week. If Wednesday: mid-week push. If Friday: last chance to hit goals before week ends
- Keep it casual and fun, plain text only (no markdown)`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = message.content.find((b) => b.type === 'text')
  if (!block || block.type !== 'text') return `💪 PowerUp ${data.dayLabel} update: ${data.totalActivities} workouts logged by ${data.activePlayers} players this week!`
  return block.text.trim()
}
