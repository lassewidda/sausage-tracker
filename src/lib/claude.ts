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
  meals: { description: string | null; itemCount: number; estimatedGrams: number | null }[]
  totalItems: number
  totalGrams: number
  chainLength: number
  prevWeekItems: number
}): Promise<string> {
  const client = getClient()

  const mealList = data.meals
    .map((m, i) => `  Meal ${i + 1}: ${m.itemCount} item(s), ~${m.estimatedGrams ?? '?'}g — "${m.description ?? 'no description'}"`)
    .join('\n')

  const chainStatus = data.chainLength > 0
    ? `Active chain: ${data.chainLength} consecutive week(s) with 3+ items.`
    : 'Chain: BROKEN (failed to reach 3 items this week).'

  const trend = data.prevWeekItems > 0
    ? `Previous week: ${data.prevWeekItems} items. Change: ${data.totalItems > data.prevWeekItems ? '+' : ''}${data.totalItems - data.prevWeekItems}.`
    : 'No data from previous week for comparison.'

  const prompt = theme.prompts.weeklySummaryPrompt({
    playerName: data.playerName,
    weekLabel: data.weekLabel,
    mealList,
    totalItems: data.totalItems,
    totalWeight: data.totalGrams,
    mealCount: data.meals.length,
    chainStatus,
    trend,
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
    const validTypes = ['cardio', 'strength', 'mobility']
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
