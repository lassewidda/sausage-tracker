import type {
  ThemePrompts,
  HeroCardPromptData,
  WeeklySummaryPromptData,
  BattleSummaryPromptData,
} from '@/theme/types'

const visionSystemPrompt = `You are a precise food analysis assistant specialized in identifying sausages in meal photographs. Your task is to count sausages, estimate their weight, and respond with valid JSON only.

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

const visionUserPrompt = 'Count the sausages in this meal photo and respond with JSON only.'

function heroCardPrompt(data: HeroCardPromptData): string {
  return `Create a superhero/Pok\u00e9mon-style trading card for sausage champion "${data.playerName}".

PLAYER STATS:
- Total lifetime sausages: ${data.totalItems}
- Total weight consumed: ${data.totalWeight}g
- Meals logged: ${data.mealCount}
- Max sausages in a single meal: ${data.maxInOneMeal}
- Active weeks: ${data.activeWeeks}
- Current sausage chain: ${data.chainLength} consecutive weeks

RECENT MEALS:
${data.recentDescriptions || 'No recent meals'}
${data.existingTitlesList}${data.existingTypesList}

Generate a JSON card with these fields. Be creative, funny, and thematic around sausages:

- heroTitle: A dramatic superhero/Pok\u00e9mon name (e.g., "The Bratwurst Berserker", "Wiener Warlord", "Chorizo Champion"). Make it unique to this player's habits. IMPORTANT: Every card MUST have a completely different, unique name \u2014 never repeat or closely resemble a previous title. CRITICAL: Do NOT include the player's name in the heroTitle. The title should be a standalone character name like "The Frankfurter Phantom" not "Lars the Frankfurter Phantom".
- heroType: MUST be exactly two types from this list separated by /: BRATWURST, FRANKFURTER, CHORIZO, KIELBASA, ANDOUILLE, WEISSWURST, CURRYWURST, BLOOD_SAUSAGE, VEGGIE, MUSTARD, SAUERKRAUT, GRILLED. Example: "CHORIZO/GRILLED" or "FRANKFURTER/MUSTARD". Pick types that match the player's sausage eating patterns. IMPORTANT: Use a DIFFERENT type combination than any previously used.
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
- flavorText: 1-2 sentences of dramatic Pok\u00e9dex-style lore about this sausage warrior

Respond with ONLY valid JSON, no markdown, no explanation.`
}

function weeklySummaryPrompt(data: WeeklySummaryPromptData): string {
  return `Write a brief weekly sausage consumption report for "${data.playerName}" for ${data.weekLabel}.

DATA:
- Total sausages consumed: ${data.totalItems}
- Total estimated weight: ${data.totalWeight}g
- Number of meals logged: ${data.mealCount}
- ${data.chainStatus}
- ${data.trend}

MEALS:
${data.mealList}

STYLE: Write 2-4 sentences in the tone of a scientific research paper abstract, but about sausages. Be humorous and absurd while referencing real scientific terminology (e.g., "caloric intake patterns", "protein acquisition events", "longitudinal consumption metrics", "gastrointestinal throughput", "cylindrical meat product utilization").

IMPORTANT: Vary your opening every time. NEVER start with "This longitudinal analysis" or any repetitive pattern. Use creative, different openings \u2014 start with the player's name, a dramatic observation, a fake citation, a surprising statistic, a metaphor, or jump straight into the findings. Every report should feel fresh and unique.

Include observations about their specific sausage choices and quantities. Comment on their chain status. Keep it SHORT and punchy. Do not use markdown formatting.`
}

function battleSummaryPrompt(data: BattleSummaryPromptData): string {
  return `Write a dramatic, funny battle recap for a sausage-themed Pok\u00e9mon-style card game called "Sausage Tracker".

BATTLE: ${data.challenger.toUpperCase()} vs ${data.opponent.toUpperCase()}
WINNER: ${data.winner ? data.winner.toUpperCase() : 'DRAW'}

TURN-BY-TURN LOG:
${data.turnLog}

Write a 3-5 sentence dramatic sports-announcer-style recap of this battle. Be funny, use sausage puns, reference specific moves and knockouts from the log. Write like a breathless esports commentator crossed with a hot dog vendor. Keep it punchy and entertaining. No markdown formatting.`
}

function descriptionRewritePrompt(description: string, oldCount: number, newCount: number): string {
  return `The following meal description was written assuming there are ${oldCount} sausage(s): "${description}"\n\nRewrite ONLY that sentence so it correctly says there are ${newCount} sausage(s) instead. Return just the rewritten sentence, nothing else.`
}

export const sausagePrompts: ThemePrompts = {
  visionSystemPrompt,
  visionUserPrompt,
  heroCardPrompt,
  weeklySummaryPrompt,
  battleSummaryPrompt,
  descriptionRewritePrompt,
}
