import type { ThemePrompts, HeroCardPromptData, WeeklySummaryPromptData, BattleSummaryPromptData } from '../types'

export const exercisePrompts: ThemePrompts = {
  visionSystemPrompt: `You are a fitness tracking AI that analyzes screenshots from workout and fitness apps. You can recognize screenshots from Strava, Apple Health, Nike Run Club, Garmin Connect, Fitbit, MyFitnessPal, Strong, JEFIT, Peloton, Whoop, and similar fitness tracking apps.

Your job is to detect:
- The number of individual workouts shown in the screenshot
- Exercise type(s) (running, weightlifting, cycling, swimming, yoga, HIIT, etc.)
- Duration in minutes (if visible)
- Distance (if visible)
- Calories burned (if visible)

Return a JSON object with these fields:
- count: number of distinct workouts visible (integer, minimum 1)
- description: a brief, enthusiastic description of the workout(s) shown
- confidence: "high" if this is clearly a fitness app screenshot, "medium" if somewhat ambiguous, "low" if uncertain
- exercise_types: array of exercise type strings detected (e.g. ["running", "strength training"])
- duration_minutes: total duration in minutes if visible, or null

Be generous but honest. A single workout screenshot counts as 1. A weekly summary showing multiple workouts should count each individual session. If you see a dashboard with multiple activity entries, count each one.

If the image is not a fitness app screenshot at all, return count: 0 with low confidence and explain in the description.`,

  visionUserPrompt: `Analyze this fitness app screenshot. How many individual workouts are shown? What type(s) of exercise? Return JSON with: count (number of workouts), description, confidence, exercise_types (array), duration_minutes (number or null).`,

  heroCardPrompt: (data: HeroCardPromptData) => `Generate a gym-bro themed hero card for a fitness battle game. This card represents a player's weekly workout activity.

Player stats this week:
- Name: ${data.playerName}
- Total workouts logged: ${data.totalItems}
- Total estimated calories: ${data.totalWeight}
- Number of gym sessions: ${data.mealCount}
- Max workouts in one session: ${data.maxInOneMeal}
- Active weeks: ${data.activeWeeks}
- Current workout streak: ${data.chainLength} weeks
- Recent workout descriptions: ${data.recentDescriptions}

Existing card titles to AVOID (make something unique): ${data.existingTitlesList}
Existing types already used: ${data.existingTypesList}

Create a JSON card with these fields:
- heroTitle: A creative, gym-bro themed title (e.g., "The Squat Rack Sentinel", "Cardio Queen Supreme", "Iron Temple Monk"). Make it funny and gym-culture-aware.
- heroType: EXACTLY TWO types separated by a slash from this list: STRENGTH, CARDIO, FLEXIBILITY, ENDURANCE, SPEED, POWER, CROSSFIT, YOGA, HIIT, CALISTHENICS, SWIMMING, CYCLING. Choose types that match the player's workout style.
- hp: Base HP (${data.totalItems <= 3 ? '80-120' : data.totalItems <= 7 ? '100-160' : '130-200'}), higher for more active players.
- attack: ATK stat (${data.totalItems <= 3 ? '40-70' : data.totalItems <= 7 ? '60-100' : '80-130'}). Strength/Power focused players get more.
- defense: DEF stat (${data.totalItems <= 3 ? '40-70' : data.totalItems <= 7 ? '55-90' : '70-120'}). Endurance/Yoga players get more.
- speed: SPD stat (${data.totalItems <= 3 ? '40-70' : data.totalItems <= 7 ? '55-95' : '75-125'}). Cardio/Speed/HIIT players get more.
- specialMoves: Array of EXACTLY 3 moves. Each formatted as "Move Name (damage/pp)". Damage 20-80, PP 2-8. Higher damage = lower PP. Make moves gym-punny and match the types (e.g., "Deadlift Devastation (65/3)", "Protein Shake Splash (30/7)", "Burpee Barrage (50/4)").
- weakness: A funny gym weakness (e.g., "Skips leg day when nobody's watching", "Allergic to cardio machines", "Gets distracted by mirrors").
- catchphrase: A gym-bro battle cry (e.g., "DO YOU EVEN LIFT, BRO?!", "LIGHTWEIGHT BABY!", "ONE MORE REP!").
- flavorText: A short, funny description of this gym warrior in gym-bro speak. Reference their actual workout habits.

Make it entertaining with gym culture references, protein jokes, and fitness memes. Scale stats to reward consistent training.`,

  weeklySummaryPrompt: (data: WeeklySummaryPromptData) => `Write a weekly workout summary in a sports science parody / gym bro tone. Channel your inner bodybuilding forum poster circa 2005.

Player: ${data.playerName}
Week: ${data.weekLabel}
Workouts logged:
${data.mealList}

Stats:
- Total workouts: ${data.totalItems}
- Total estimated calories burned: ${data.totalWeight}
- Number of sessions: ${data.mealCount}
- Streak status: ${data.chainStatus}
- Trend vs last week: ${data.trend}

Write 2-3 sentences max. Use gym bro jargon: "gains", "PRs", "leg day", "protein window", "anabolic", "swole", "natty limit", "progressive overload", "mind-muscle connection", "time under tension". Reference specific workouts they did. If they trained a lot, hype them up. If they slacked, roast them (lovingly). End with a motivational gym bro one-liner.`,

  battleSummaryPrompt: (data: BattleSummaryPromptData) => `Write a battle summary in the style of an over-the-top gym commentator / WWE announcer calling a fitness competition.

Challenger: ${data.challenger}
Opponent: ${data.opponent}
Winner: ${data.winner ?? 'Draw'}

Turn-by-turn log:
${data.turnLog}

Write 2-3 dramatic sentences. Use gym/sports commentary language: "ABSOLUTELY DEMOLISHED", "WHAT A SET", "THE CROWD GOES WILD", "SPOTTED AND DROPPED", "FAILED THAT REP", "NEW PR". Reference specific moves and turning points. If it was close, emphasize the grind. If it was a blowout, emphasize the dominance. End with a gym-appropriate sign-off.`,

  descriptionRewritePrompt: (description: string, oldCount: number, newCount: number) =>
    `The following workout description was written for ${oldCount} workout(s), but the user corrected it to ${newCount} workout(s). Rewrite the description to accurately reflect ${newCount} workout(s) while keeping the same enthusiastic gym-bro tone and exercise types mentioned.

Original description: "${description}"

Return only the rewritten description text, nothing else.`,
}
