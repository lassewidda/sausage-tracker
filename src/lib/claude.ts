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
- Keep it casual, encouraging, and personal — hockey analogies welcome but not forced. Old-school hockey humor is a plus (70s/80s era, Slap Shot vibes, wooden sticks, mustaches)
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

export async function generateBattleNudge(data: {
  playerName: string
  opponent: string
  daysIdle: number
  tier: 1 | 2 | 3
  status: 'selecting' | 'battling' | 'awaiting_switch'
}): Promise<string> {
  const action = data.status === 'awaiting_switch'
    ? 'pick a replacement card after their last one was knocked out'
    : data.status === 'selecting'
      ? 'choose their 4-card deck'
      : 'take their next turn'

  const toneByTier: Record<1 | 2 | 3, string> = {
    1: 'Light and playful — a friendly poke, not a guilt trip. Hint that the opponent is starting to check the clock.',
    2: 'Firmer. Call out the day count. The opponent has been waiting a while; time to step up.',
    3: 'Final-warning energy — playful but pointed. This is the last DM they will get for this battle. Light roast is fine.',
  }

  const prompt = `You are Puck, a fun trash-talking buddy for the PowerUp workplace exercise app at EliteProspects.com (ice hockey database). Old-school hockey humor (70s/80s, Slap Shot vibes) is welcome but not forced.

${data.playerName.toUpperCase()} owes a move in their PowerUp Battle vs ${data.opponent.toUpperCase()}. They need to ${action}. The battle has been waiting on them for ${data.daysIdle} day${data.daysIdle === 1 ? '' : 's'}.

Tone: ${toneByTier[data.tier]}

Write a single Slack DM. Requirements:
- Max 2 short sentences. No greeting like "Hey" or "Yo" — jump straight in.
- Mention the opponent's name and that the battle is waiting.
- 1 emoji max, optional.
- Do NOT include any URL — it will be appended afterwards.
- Plain text, no markdown.`

  try {
    const client = getClient()
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [{ role: 'user', content: prompt }],
    })
    const block = message.content.find((b) => b.type === 'text')
    if (block && block.type === 'text') return block.text.trim()
  } catch { /* fall through to default */ }

  // Fallback if Haiku is unavailable
  const fallback: Record<1 | 2 | 3, string> = {
    1: `Your battle vs ${data.opponent.toUpperCase()} is sitting on you. Take your turn before they fall asleep at the bench.`,
    2: `${data.daysIdle} days and ${data.opponent.toUpperCase()} is still on the bench waiting. Drop the gloves and take your turn.`,
    3: `Last call — ${data.opponent.toUpperCase()} has been waiting ${data.daysIdle} days. Take your turn or this battle is going to grow moss.`,
  }
  return fallback[data.tier]
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
  earlyCompleters?: string[]
  challengeInfo?: {
    bingoItems: string[]
    exerciseMinimum: number
    completedPlayers?: string[]
    incompletePlayers?: string[]
    isGroupMode?: boolean
    rescueEnabled?: boolean
    completedTeams?: { name: string; members: string[] }[]
    incompleteTeams?: {
      name: string
      members: string[]
      bingoDone: number
      bingoTotal: number
      totalWorkouts?: number
      membersExerciseStatus?: { name: string; workouts: number; exerciseMet: boolean }[]
    }[]
  } | null
  announcements?: string[]
}): Promise<string> {
  const client = getClient()

  const highlights = data.playerHighlights.length > 0
    ? `Notable highlights:\n${data.playerHighlights.map(h => `- ${h}`).join('\n')}`
    : 'No specific highlights yet.'

  const workoutColor = data.recentWorkouts && data.recentWorkouts.length > 0
    ? `\nRecent workout snapshots from participants:\n${data.recentWorkouts.map(w => `- ${w}`).join('\n')}`
    : ''

  const incompleteTeamLines = data.challengeInfo?.isGroupMode && data.challengeInfo.incompleteTeams && data.challengeInfo.incompleteTeams.length > 0
    ? data.challengeInfo.incompleteTeams
        .slice()
        .sort((a, b) => b.bingoDone - a.bingoDone || (b.totalWorkouts ?? 0) - (a.totalWorkouts ?? 0))
        .slice(0, 6)
        .map(t => {
          const memberStatus = t.membersExerciseStatus && t.membersExerciseStatus.length > 0
            ? t.membersExerciseStatus.map(m => `${m.name} ${m.workouts}${m.exerciseMet ? '✓' : '✗'}`).join(' / ')
            : t.members.join(' & ')
          const totalWk = t.totalWorkouts !== undefined ? `, ${t.totalWorkouts} team workouts` : ''
          return `  • ${t.name} (${t.members.join(' & ')}): bingo ${t.bingoDone}/${t.bingoTotal}${totalWk} — per-member: ${memberStatus}`
        })
        .join('\n')
    : ''

  const challengeSection = data.challengeInfo
    ? `\nPUCK'S WEEKLY CHALLENGE (Photo Bingo):
- This week's bingo items to photograph: ${data.challengeInfo.bingoItems.join(', ')}
- Minimum ${data.challengeInfo.exerciseMinimum} workouts required to complete the challenge
- ${data.challengeInfo.isGroupMode ? 'GROUP MODE: this is a PAIR/TEAM challenge — teammates split the bingo card and ALL members must hit the workout minimum for the team to complete' : 'Players must log their workouts AND photograph the bingo items to complete it'}
- Photos MUST be taken OUTSIDE while exercising or moving — indoor photos from home or office do not count
- Challenge page: https://powerup.eliteprospects.com/challenge${
  data.challengeInfo.isGroupMode && data.challengeInfo.completedTeams && data.challengeInfo.completedTeams.length > 0
    ? `\n- TEAMS COMPLETE: ${data.challengeInfo.completedTeams.map(t => `${t.name} (${t.members.join(' & ')})`).join('; ')}`
    : ''}${
  incompleteTeamLines
    ? `\n- TEAMS IN PROGRESS (top by bingo progress, ✓ = met workout target, ✗ = still short):\n${incompleteTeamLines}`
    : ''}${
  !data.challengeInfo.isGroupMode && data.challengeInfo.completedPlayers && data.challengeInfo.completedPlayers.length > 0
    ? `\n- CHALLENGE COMPLETERS: ${data.challengeInfo.completedPlayers.join(', ')}`
    : ''}${
  !data.challengeInfo.isGroupMode && data.challengeInfo.incompletePlayers && data.challengeInfo.incompletePlayers.length > 0
    ? `\n- STILL IN PROGRESS: ${data.challengeInfo.incompletePlayers.join(', ')}`
    : ''}`
    : ''

  const prompt = `You are a motivational fitness coach posting a ${data.dayLabel} update to a workplace Slack channel for the PowerUp exercise challenge. All participants work at EliteProspects.com (ice hockey database), so hockey references and analogies are welcome when they fit naturally — especially old-school hockey humor (70s/80s era, Slap Shot vibes, wooden sticks, mustaches, bench-clearing brawls).

Stats this week:
- ${data.totalActivities} total workouts logged
- ${data.activePlayers} of ${data.totalPlayers} players have logged at least one workout
- ${data.goalCompletions} players have already completed their weekly goal
${data.topStreak ? `- Longest streak: ${data.topStreak.player} with ${data.topStreak.weeks} consecutive goal weeks` : ''}

${highlights}${workoutColor}${challengeSection}

Write a short Slack channel post (${data.challengeInfo && (data.dayLabel === 'Monday' || data.dayLabel === 'Friday' || (data.dayLabel === 'Wednesday' && data.challengeInfo.isGroupMode)) ? '6-10' : '4-6'} lines max). Requirements:
- Start with a relevant emoji
- Be motivational and positive — but do NOT start with a label like "Monday Motivation:", "Mid-week Update:", or the day name. Jump straight into the content about the players and their achievements.
- The primary goal of the challenge is for each person to complete their own personal weekly goal — everyone who does is equally successful regardless of workout count. Celebrate goal completers as a group, not by singling out who logged the most
- If workout descriptions are provided, weave in specific details about what people are doing (e.g. "Emma crushed a 10km trail run" or "Marcus hit the gym for deadlifts") — this makes the post feel alive and personal
- Gently encourage those who haven't logged yet (without shaming)
- The challenge week runs Monday to Sunday. If it's Monday: energize for the new week (7 days ahead)${data.challengeInfo ? '. IMPORTANT: Mention this week\'s Puck\'s Challenge (Photo Bingo) — list the bingo items and remind them to photograph them plus log at least ' + data.challengeInfo.exerciseMinimum + ' workouts to complete it. Stress that the photos must be taken OUTSIDE while exercising or moving — not from inside the house or office. Do NOT say "NEW" — this is a recurring weekly challenge. Link to https://powerup.eliteprospects.com/challenge' : ''}. If Wednesday: mid-week push (5 days left including today). If Friday: weekend push — remind people that Saturday and Sunday still count, 3 days left to hit goals
${data.earlyCompleters && data.earlyCompleters.length > 0 ? `- These players already completed their weekly goal with days to spare: ${data.earlyCompleters.join(', ')}. Give them a shout-out and playfully suggest they could raise the bar — maybe set a tougher weekly goal next week since they're clearly crushing it` : ''}
${data.challengeInfo?.isGroupMode ? `- IMPORTANT — TEAM CHALLENGE FRAMING (applies every day, not just Friday): make the TEAMS the main characters of this post. Mention 1–3 teams by NAME with a one-liner about their current standing — bingo count, total team workouts, or which linemate is carrying the line vs. skating short-handed. Use the per-member ✓/✗ status from TEAMS IN PROGRESS to call out specific dynamics (e.g. "ICE WOLVES are 4/5 on the bingo card but JONAS is still skating short-handed on workouts"). Individual shout-outs are still welcome but the team frame leads. NEVER shame a teammate who's behind — frame it as "the linemate they're back-checking for" or "needs to lace up and join the rush".` : ''}
${data.challengeInfo?.isGroupMode ? `- TEAM SPORT REMINDER (every group-mode day): explicitly say this is a TEAM SPORT, not a solo grind — grinding workouts alone does not get the team across the line. Tell pairs to DM each other today: divide the bingo card, plan photos, nudge a quiet linemate. The win comes from coordinating, not from one player carrying.` : ''}
${data.challengeInfo?.isGroupMode && data.challengeInfo.rescueEnabled ? `- RESCUE PILL is ON this week: if a partner ends the week one workout short of the minimum, a teammate's extra workouts can rescue them (one rescue per donor, every member still needs at least minimum-1 on their own). Mention it briefly on Wed/Fri as a backstop — frame it as "the rescue pill is in the kit, but you still need to lace up".` : ''}
${data.challengeInfo?.isGroupMode && data.dayLabel === 'Monday' ? `- Monday + group mode: drop the puck on the new week by announcing the lineups Slap-Shot style. Name the teams taking the ice, hype the matchups, set the tone — wooden sticks, mustaches, no helmets energy.` : ''}
${data.challengeInfo?.isGroupMode && data.dayLabel === 'Wednesday' ? `- Wednesday + group mode: mid-period check-in. Lead with team standings (1-3 named teams). Rib (lightly) any team trailing on bingo or with a teammate skating short-handed on workouts, and tip the cap to the team in the lead. Two periods left to play. Push pairs to DM each other TODAY if they haven't yet — Wednesday is the day to course-correct.` : ''}
${data.challengeInfo && data.dayLabel === 'Friday' ? (data.challengeInfo.isGroupMode
  ? `- IMPORTANT (Friday + group mode): celebrate any TEAMS that completed by NAME (use the team name as the headline, not just members). For teams still in progress, point at their bingo count and total workouts and call it like the third period — drop the gloves, three days left, no team gets left on the bench. Remind teams with a struggling teammate to back-check for their linemate over the weekend — text them, suggest a workout together, share the load. Link to https://powerup.eliteprospects.com/challenge`
  : `- IMPORTANT: Celebrate the Photo Bingo challenge completers by name if any. Encourage those still in progress — it's not too late, they have until Sunday! Remind them the bingo photos must be taken OUTSIDE while exercising or moving — not from indoors. Link to https://powerup.eliteprospects.com/challenge`) : ''}
${data.dayLabel === 'Friday' ? '- Remind everyone they can battle their friends in the Battle Arena while waiting for next week — challenge a colleague at https://powerup.eliteprospects.com/battle' : ''}
${data.announcements && data.announcements.length > 0 ? data.announcements.map(a => `- ANNOUNCE: ${a}`).join('\n') : ''}
- When including URLs, copy them EXACTLY as provided — never modify or rephrase URLs
- Hockey voice: lean into old-school 70s/80s Slap-Shot vibes — linemates, the bench, back-checking, drop-the-gloves, wooden sticks, bushy mustaches, no-helmets era. Keep it light and inclusive — never shame anyone.
- Keep it casual and fun, plain text only (no markdown)`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: data.challengeInfo && (data.dayLabel === 'Monday' || data.dayLabel === 'Friday' || (data.dayLabel === 'Wednesday' && data.challengeInfo.isGroupMode)) ? 500 : 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = message.content.find((b) => b.type === 'text')
  if (!block || block.type !== 'text') return `💪 PowerUp ${data.dayLabel} update: ${data.totalActivities} workouts logged by ${data.activePlayers} players this week!`
  // Fix any mangled powerup URLs (Haiku sometimes garbles long URLs)
  const correctDomain = 'https://powerup.eliteprospects.com'
  let text = block.text.trim()
    .replace(/https?:\/\/powerup\.[a-z.]+\.com/g, correctDomain)
  // Ensure URLs have a space before any non-URL trailing characters (e.g. em dashes, letters)
  // Known paths: /shop, /challenge, /battle, /battle/*, /player/*
  const urlPaths = ['shop', 'challenge', 'battle', 'highscore', 'feed', 'gallery', 'progress', 'invite']
  for (const path of urlPaths) {
    const pattern = new RegExp(`(${correctDomain.replace(/\//g, '\\/')}\\/${path})([^\\s.,;!?)}\\\]"'\\n/])`, 'g')
    text = text.replace(pattern, '$1 $2')
  }
  // Also handle bare domain with no path
  text = text.replace(new RegExp(`(${correctDomain.replace(/\//g, '\\/')})([^\\s.,;!?)}\\\]"'\\n/])`, 'g'), '$1 $2')
  return text
}

export async function generateWeeklyRecapDM(data: {
  playerName: string
  cardio: number
  strength: number
  total: number
  cardioTarget: number
  strengthTarget: number
  goalMet: boolean
  streakWeeks: number
  rank: number
  totalPlayers: number
  recentDescriptions: string[]
}): Promise<string> {
  const client = getClient()

  const goalParts = []
  if (data.cardioTarget > 0) goalParts.push(`${data.cardio}/${data.cardioTarget} cardio`)
  if (data.strengthTarget > 0) goalParts.push(`${data.strength}/${data.strengthTarget} strength`)

  const workoutList = data.recentDescriptions.length > 0
    ? `\nWorkouts logged this week:\n${data.recentDescriptions.map(d => `- ${d}`).join('\n')}`
    : ''

  const prompt = `You are Puck, a fun fitness coach for the PowerUp workplace exercise challenge at EliteProspects.com (ice hockey database). Old-school hockey humor is welcome.

Write a personal weekly recap DM for ${data.playerName.toUpperCase()}. Here are their stats:

This week: ${data.total} workouts (${goalParts.join(', ')})
Goal status: ${data.goalMet ? 'GOAL MET!' : 'Goal not met this week'}
Goal streak: ${data.streakWeeks > 0 ? `${data.streakWeeks} consecutive weeks` : 'No active streak'}
Leaderboard rank: #${data.rank} of ${data.totalPlayers}${workoutList}

Write 3-4 sentences. Requirements:
- If goal was met: celebrate it, mention the streak if > 1 week
- If goal was NOT met: be encouraging, not guilt-tripping. Note how close they were or highlight what they did accomplish
- Reference specific workouts from their descriptions if available (makes it personal)
- End with a forward-looking line about next week
- Keep it casual and warm, plain text only, 1-2 emojis max
- Do NOT use markdown formatting`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 250,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = message.content.find((b) => b.type === 'text')
  if (!block || block.type !== 'text') {
    return data.goalMet
      ? `💪 Great week, ${data.playerName.toUpperCase()}! You hit your goal with ${data.total} workouts. Keep it up next week!`
      : `Hey ${data.playerName.toUpperCase()}, you logged ${data.total} workouts this week. Every session counts — let's go harder next week! 💪`
  }
  return block.text.trim()
}
