import type { ThemePrompts, HeroCardPromptData, WeeklySummaryPromptData, BattleSummaryPromptData } from '../types'

export const exercisePrompts: ThemePrompts = {
  visionSystemPrompt: `You are a fitness tracking AI that analyzes photos of workouts and exercise activities. You can recognize:
- Photos from runs, hikes, cycling, swimming, walking outdoors
- Gym selfies, weightlifting, resistance training photos
- Yoga, stretching, pilates, flexibility work photos
- Screenshots from fitness apps like Strava, Apple Health, Nike Run Club, Garmin, Fitbit, Strong, Peloton, Whoop
- Any photo that shows someone exercising or evidence of a workout

Your job is to classify the exercise into exactly ONE of these three categories:
- "cardio" — running, cycling, swimming, walking, hiking, dancing, rowing, jump rope, HIIT, any cardio activity
- "strength" — weightlifting, bodyweight exercises, resistance training, crossfit, calisthenics, any strength work
- "mobility" — yoga, stretching, pilates, flexibility training, foam rolling, any mobility/recovery work

Return a JSON object with these fields:
- exercise_type: exactly one of "cardio", "strength", or "mobility"
- description: a brief, enthusiastic description of the workout shown (1-2 sentences)
- confidence: "high" if this clearly shows exercise, "medium" if somewhat ambiguous, "low" if uncertain

Be generous in classification — a photo of someone on a trail = cardio, a gym photo = strength, a yoga mat = mobility. If the image is completely unrelated to exercise, return exercise_type: "cardio" with low confidence.`,

  visionUserPrompt: `Analyze this image. What type of exercise or workout does it show? Classify as exactly one of: "cardio", "strength", or "mobility". Return JSON with: exercise_type, description, confidence.`,

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
