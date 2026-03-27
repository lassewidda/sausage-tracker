import type { ThemePrompts, HeroCardPromptData, WeeklySummaryPromptData, BattleSummaryPromptData } from '../types'

export const exercisePrompts: ThemePrompts = {
  visionSystemPrompt: `You are a fitness tracking AI that analyzes photos of workouts and exercise activities. You can recognize:
- Photos from runs, hikes, cycling, swimming, walking outdoors
- Gym selfies, weightlifting, resistance training photos
- Screenshots from fitness apps like Strava, Apple Health, Nike Run Club, Garmin, Fitbit, Strong, Peloton, Whoop
- Any photo that shows someone exercising or evidence of a workout

Each uploaded image counts as exactly ONE workout. Classify it as either cardio or strength:
- "cardio" — running, cycling, swimming, walking, hiking, dancing, rowing, jump rope, HIIT, yoga, stretching, pilates
- "strength" — weightlifting, bodyweight exercises, resistance training, crossfit, calisthenics

Even if a screenshot shows multiple sessions, treat the upload as a single workout and pick the dominant type.

Return a JSON object with these fields:
- exercise_type: exactly one of "cardio" or "strength"
- description: a brief, enthusiastic description of the workout (1-2 sentences)
- confidence: "high" if this clearly shows exercise, "medium" if somewhat ambiguous, "low" if uncertain

Be generous — a photo of someone on a trail = cardio, a gym photo = strength. If the image is unrelated to exercise, return exercise_type: "cardio" with low confidence.`,

  visionUserPrompt: `Analyze this image. This counts as one workout — classify it as either "cardio" or "strength". Return JSON with: exercise_type, description, confidence.`,

  heroCardPrompt: (data: HeroCardPromptData) => `Generate a fitness-themed hero card for an exercise battle game. This card represents a player's weekly workout activity.

IMPORTANT: Look at the player's recent workout descriptions below to determine their exercise style. If they mostly run, cycle, swim, or do cardio — make the card RUNNER/CARDIO themed (trail names, pace jokes, marathon humor, cycling puns). If they mostly lift or do strength training — make it GYM/STRENGTH themed (lifting puns, protein jokes, squat humor). If it's a mix, blend both worlds. The card should reflect what this player ACTUALLY does.

Player stats this week:
- Name: ${data.playerName}
- Total workouts logged: ${data.totalItems}
- Total estimated calories: ${data.totalWeight}
- Number of sessions: ${data.mealCount}
- Max workouts in one session: ${data.maxInOneMeal}
- Active weeks: ${data.activeWeeks}
- Current workout streak: ${data.chainLength} weeks
- Recent workout descriptions: ${data.recentDescriptions}

Existing card titles to AVOID (make something unique): ${data.existingTitlesList}
Existing types already used: ${data.existingTypesList}

Create a JSON card with these fields:
- heroTitle: A creative, fitness-themed title that matches the player's exercise style. Runner examples: "The Trail Tornado", "Pace Demon", "Marathon Maniac", "The Strava Stalker". Gym examples: "The Squat Rack Sentinel", "Iron Temple Monk". Cyclist examples: "The Peloton Predator", "Chain Grease Champion". Make it funny and fitness-culture-aware.
- heroType: EXACTLY TWO types separated by a slash from this list: STRENGTH, CARDIO, FLEXIBILITY, ENDURANCE, SPEED, POWER, CROSSFIT, YOGA, HIIT, CALISTHENICS, SWIMMING, CYCLING. Choose types that match the player's actual workout style.
- hp: Base HP (${data.totalItems <= 3 ? '80-120' : data.totalItems <= 7 ? '100-160' : '130-200'}), higher for more active players.
- attack: ATK stat (${data.totalItems <= 3 ? '40-70' : data.totalItems <= 7 ? '60-100' : '80-130'}). Strength/Power focused players get more.
- defense: DEF stat (${data.totalItems <= 3 ? '40-70' : data.totalItems <= 7 ? '55-90' : '70-120'}). Endurance/Distance players get more.
- speed: SPD stat (${data.totalItems <= 3 ? '40-70' : data.totalItems <= 7 ? '55-95' : '75-125'}). Cardio/Speed/Running players get more.
- specialMoves: Array of EXACTLY 3 moves. Each formatted as "Move Name (damage/pp)". Damage 20-80, PP 2-8. Higher damage = lower PP. Make moves match the player's exercise style. Runner moves: "Sprint Finish (60/3)", "Negative Split (45/5)", "Hill Repeat Hammer (70/2)". Gym moves: "Deadlift Devastation (65/3)", "Protein Shake Splash (30/7)". Cyclist moves: "Breakaway Burst (55/4)", "Drafting Dodge (25/7)".
- weakness: A funny fitness weakness that matches their style. Runners: "Forgets to hydrate past mile 8", "GPS watch dies at mile 12". Gym: "Skips leg day when nobody's watching". Cyclists: "Gets a flat tire at the worst moment".
- catchphrase: A battle cry matching their style. Runners: "CATCH ME IF YOU CAN!", "JUST ONE MORE MILE!". Gym: "LIGHTWEIGHT BABY!", "ONE MORE REP!". Cyclists: "ON YOUR LEFT!", "CADENCE IS KING!".
- flavorText: A short, funny description referencing their actual workout habits. If they run, talk about their running. If they lift, talk about their lifting. Mix if they do both.

Make it entertaining with fitness culture references. Scale stats to reward consistent training.`,

  weeklySummaryPrompt: (data: WeeklySummaryPromptData) => `Write a weekly workout summary in a fun, fitness-enthusiast tone. Adapt the tone to what the player actually did:
- If mostly cardio (running, cycling, swimming): use running/cardio jargon (splits, pace, PRs, negative splits, bonking, hitting the wall, KMs, cadence)
- If mostly strength (lifting, gym): use gym jargon (gains, PRs, progressive overload, volume, sets)
- If a mix: blend both styles

Player: ${data.playerName}
Week: ${data.weekLabel}
Workouts logged:
${data.mealList}

Stats:
- Total workouts: ${data.totalItems}
- Total estimated calories burned: ${data.totalWeight}
- Number of sessions: ${data.mealCount}
- ${data.chainStatus}
- Trend vs last week: ${data.trend}${data.exerciseBreakdown ? `\n- ${data.exerciseBreakdown}` : ''}${data.challengeStatus ? `\n- ${data.challengeStatus}` : ''}

Write 2-3 sentences max. Reference specific workouts they did and their exercise type breakdown. Mention the streak if active (${'>'} 1 week). If they completed the weekly challenge, celebrate it. If they trained a lot, hype them up. If they slacked, roast them (lovingly). End with a motivational one-liner that fits their exercise style.`,

  battleSummaryPrompt: (data: BattleSummaryPromptData) => `Write a battle summary in the style of an over-the-top sports commentator calling a fitness competition. Mix running commentary, cycling race, and gym competition language depending on the moves used.

Challenger: ${data.challenger}
Opponent: ${data.opponent}
Winner: ${data.winner ?? 'Draw'}

Turn-by-turn log:
${data.turnLog}

Write 2-3 dramatic sentences. Use sports commentary language: "WHAT A FINISH!", "ABSOLUTELY DOMINATED!", "SPRINT TO THE LINE!", "LEFT THEM IN THE DUST!", "THAT WAS A KNOCKOUT SET!", "NEW PR!". Reference specific moves and turning points. If it was close, emphasize the grind. If it was a blowout, emphasize the dominance.`,

  descriptionRewritePrompt: (description: string, oldCount: number, newCount: number) =>
    `The following workout description was written for ${oldCount} workout(s), but the user corrected it to ${newCount} workout(s). Rewrite the description to accurately reflect ${newCount} workout(s) while keeping the same enthusiastic fitness tone and exercise types mentioned.

Original description: "${description}"

Return only the rewritten description text, nothing else.`,
}
