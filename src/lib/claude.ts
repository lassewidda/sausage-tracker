import Anthropic from '@anthropic-ai/sdk'
import type { AnalysisResult } from '@/types'

const SAUSAGE_SYSTEM_PROMPT = `You are a precise food analysis assistant specialized in identifying sausages in meal photographs. Your task is to count sausages, estimate their weight, and respond with valid JSON only.

A "sausage" includes: bratwurst, frankfurters, hot dogs, chorizo, merguez, breakfast sausages, chipolatas, weisswurst, bangers, and any similar cylindrical cased meat product. Do NOT count meatballs, nuggets, or other non-sausage items.

Also estimate the weight of a single sausage in grams based on its apparent type and size. Use these reference weights:
- Mini/cocktail sausage: 20-30g
- Chipolata / breakfast sausage: 35-50g
- Hot dog / frankfurter: 60-80g
- Standard bratwurst / banger: 90-120g
- Large bratwurst / thick sausage: 130-180g
- Extra large / jumbo sausage: 200g+

Always respond with ONLY a JSON object in this exact format, no other text, no markdown:
{"count":<integer>,"description":"<one sentence describing the meal and sausages>","confidence":"<high|medium|low>","sausage_types":["<type>"],"grams_per_sausage":<integer>}

If you cannot determine whether sausages are present, set count to 0, confidence to "low", and grams_per_sausage to 0.`

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

export async function generateHeroCard(data: {
  playerName: string
  totalSausages: number
  totalGrams: number
  mealCount: number
  maxInOneMeal: number
  activeWeeks: number
  chainLength: number
  recentMeals: { description: string | null; sausageCount: number }[]
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
    .map(m => `- ${m.sausageCount} sausage(s): ${m.description}`)
    .join('\n')

  const prompt = `Create a superhero/Pokémon-style trading card for sausage champion "${data.playerName}".

PLAYER STATS:
- Total lifetime sausages: ${data.totalSausages}
- Total weight consumed: ${data.totalGrams}g
- Meals logged: ${data.mealCount}
- Max sausages in a single meal: ${data.maxInOneMeal}
- Active weeks: ${data.activeWeeks}
- Current sausage chain: ${data.chainLength} consecutive weeks

RECENT MEALS:
${recentDescriptions || 'No recent meals'}

Generate a JSON card with these fields. Be creative, funny, and thematic around sausages:

- heroTitle: A dramatic superhero/Pokémon name (e.g., "The Bratwurst Berserker", "Wiener Warlord", "Chorizo Champion"). Make it unique to this player's habits.
- heroType: MUST be exactly two types from this list separated by /: BRATWURST, FRANKFURTER, CHORIZO, KIELBASA, ANDOUILLE, WEISSWURST, CURRYWURST, BLOOD_SAUSAGE, VEGGIE, MUSTARD, SAUERKRAUT, GRILLED. Example: "CHORIZO/GRILLED" or "FRANKFURTER/MUSTARD". Pick types that match the player's sausage eating patterns.
- hp: A number 30-120 based on total grams consumed (more grams = higher HP, but max 120)
- attack: A number 10-60 based on max sausages in one meal
- defense: A number 10-60 based on chain length (consistency)
- speed: A number 10-60 based on meals per active week
- specialMoves: Array of exactly 3 special moves. Format: "Move Name (damage/PP)" where damage is the attack power and PP is how many times it can be used. Design a balanced set:
  * One strong move: high damage (40-50), low PP (2-3). Example: "Mustard Megablast (45/2)"
  * One medium move: moderate damage (25-35), medium PP (5-7). Example: "Casing Crush (30/6)"
  * One weak but reliable move: low damage (15-25), high PP (10-15). Example: "Link Slap (20/12)"
  Make each move a sausage pun or food reference!
- weakness: A funny weakness (one short sentence)
- catchphrase: A dramatic one-liner this hero would say
- flavorText: 1-2 sentences of dramatic Pokédex-style lore about this sausage warrior

Respond with ONLY valid JSON, no markdown, no explanation.`

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
        content: `The following meal description was written assuming there are ${oldCount} sausage(s): "${description}"\n\nRewrite ONLY that sentence so it correctly says there are ${newCount} sausage(s) instead. Return just the rewritten sentence, nothing else.`,
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
  meals: { description: string | null; sausageCount: number; estimatedGrams: number | null }[]
  totalSausages: number
  totalGrams: number
  chainLength: number
  prevWeekSausages: number
}): Promise<string> {
  const client = getClient()

  const mealList = data.meals
    .map((m, i) => `  Meal ${i + 1}: ${m.sausageCount} sausage(s), ~${m.estimatedGrams ?? '?'}g — "${m.description ?? 'no description'}"`)
    .join('\n')

  const chainStatus = data.chainLength > 0
    ? `Active sausage chain: ${data.chainLength} consecutive week(s) with 3+ sausages.`
    : 'Sausage chain: BROKEN (failed to reach 3 sausages this week).'

  const trend = data.prevWeekSausages > 0
    ? `Previous week: ${data.prevWeekSausages} sausages. Change: ${data.totalSausages > data.prevWeekSausages ? '+' : ''}${data.totalSausages - data.prevWeekSausages}.`
    : 'No data from previous week for comparison.'

  const prompt = `Write a brief weekly sausage consumption report for "${data.playerName}" for ${data.weekLabel}.

DATA:
- Total sausages consumed: ${data.totalSausages}
- Total estimated weight: ${data.totalGrams}g
- Number of meals logged: ${data.meals.length}
- ${chainStatus}
- ${trend}

MEALS:
${mealList}

STYLE: Write 2-4 sentences in the tone of a scientific research paper abstract, but about sausages. Be humorous and absurd while referencing real scientific terminology (e.g., "caloric intake patterns", "protein acquisition events", "longitudinal consumption metrics", "gastrointestinal throughput", "cylindrical meat product utilization").

IMPORTANT: Vary your opening every time. NEVER start with "This longitudinal analysis" or any repetitive pattern. Use creative, different openings — start with the player's name, a dramatic observation, a fake citation, a surprising statistic, a metaphor, or jump straight into the findings. Every report should feel fresh and unique.

Include observations about their specific sausage choices and quantities. Comment on their chain status. Keep it SHORT and punchy. Do not use markdown formatting.`

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = message.content.find((b) => b.type === 'text')
  if (!block || block.type !== 'text') return 'SUMMARY GENERATION FAILED.'
  return block.text.trim()
}

export async function analyzeSausages(imageUrl: string): Promise<AnalysisResult> {
  const client = getClient()

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    system: SAUSAGE_SYSTEM_PROMPT,
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
            text: 'Count the sausages in this meal photo and respond with JSON only.',
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

  const parsed = JSON.parse(cleaned) as {
    count: number
    description: string
    confidence: string
    sausage_types: string[]
    grams_per_sausage: number
  }

  return {
    count: Math.max(0, Math.round(Number(parsed.count) || 0)),
    description: parsed.description || '',
    confidence: (['high', 'medium', 'low'].includes(parsed.confidence)
      ? parsed.confidence
      : 'low') as AnalysisResult['confidence'],
    sausageTypes: Array.isArray(parsed.sausage_types) ? parsed.sausage_types : [],
    gramsPerSausage: Math.max(0, Math.round(Number(parsed.grams_per_sausage) || 0)),
  }
}
