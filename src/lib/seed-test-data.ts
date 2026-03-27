import postgres from 'postgres'

const PLAYERS = [
  'alex', 'bella', 'charlie', 'diana', 'erik',
  'fiona', 'gustav', 'hanna', 'igor', 'jenny',
  'karl', 'lisa', 'marcus', 'nora', 'oscar',
]

const EXERCISE_TYPES = ['cardio', 'strength']
const DESCRIPTIONS: Record<string, string[]> = {
  cardio: [
    'Morning run through the park, 5km at a steady pace',
    'Evening cycling session along the waterfront',
    'Swimming laps at the local pool, 30 minutes',
    'Hiking trail with some serious elevation gain',
    'Jump rope HIIT session in the garage',
    'Brisk walk around the neighborhood, 45 minutes',
    'Stairmaster session at the gym, legs burning',
    'Dance workout following YouTube videos',
  ],
  strength: [
    'Full body workout: squats, bench press, rows',
    'Upper body day: overhead press, pull-ups, curls',
    'Leg day: deadlifts, lunges, leg press',
    'Push day: bench, shoulder press, tricep dips',
    'Pull day: deadlifts, rows, face pulls',
    'Bodyweight circuit: push-ups, dips, chin-ups',
    'Kettlebell swings and Turkish get-ups',
    'CrossFit WOD with heavy cleans and wall balls',
  ],
}

function getWeekKey(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  const weekNum =
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    ) + 1
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function seed() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: { rejectUnauthorized: false } })

  const startDate = new Date('2026-03-09')
  const endDate = new Date('2026-03-27')

  // Set progress config dates
  await sql`INSERT INTO app_config (key, value) VALUES ('progress_start_date', '2026-03-09') ON CONFLICT (key) DO UPDATE SET value = '2026-03-09'`
  await sql`INSERT INTO app_config (key, value) VALUES ('progress_end_date', '2026-03-27') ON CONFLICT (key) DO UPDATE SET value = '2026-03-27'`
  console.log('Set progress dates: 2026-03-09 to 2026-03-27')

  let totalInserted = 0

  for (const player of PLAYERS) {
    // Each player gets 0-7 exercises per week (19 days = ~2.7 weeks)
    // Decide activity level: some very active, some lazy
    const activityLevel = Math.random()
    let exerciseProbability: number
    if (activityLevel > 0.8) exerciseProbability = 0.7      // very active
    else if (activityLevel > 0.5) exerciseProbability = 0.45 // moderate
    else if (activityLevel > 0.2) exerciseProbability = 0.25 // light
    else exerciseProbability = 0.1                            // barely there

    const exerciseDates: Date[] = []
    const current = new Date(startDate)
    while (current <= endDate) {
      if (Math.random() < exerciseProbability) {
        exerciseDates.push(new Date(current))
      }
      current.setDate(current.getDate() + 1)
    }

    for (const date of exerciseDates) {
      const type = randomPick(EXERCISE_TYPES)
      const desc = randomPick(DESCRIPTIONS[type])
      const weekKey = getWeekKey(date)
      // Set time to a random hour during the day
      const hour = randomInt(6, 21)
      const minute = randomInt(0, 59)
      date.setHours(hour, minute, 0, 0)

      await sql`
        INSERT INTO meals (
          image_url, blob_path, item_count, ai_suggested_count, ai_description,
          estimated_grams, week_key, player_name, exercise_type, created_at
        ) VALUES (
          'https://placehold.co/400x300/222/ccc?text=' || ${type.toUpperCase()},
          ${'seed/' + player + '/' + date.toISOString()},
          1, 1, ${desc}, null, ${weekKey}, ${player}, ${type}, ${date.toISOString()}
        )
      `
      totalInserted++
    }

    console.log(`  ${player}: ${exerciseDates.length} exercises (${exerciseProbability > 0.5 ? 'active' : exerciseProbability > 0.2 ? 'moderate' : 'light'})`)
  }

  // Create a weekly challenge for week 13 (Mar 23-29)
  const existingChallenge = await sql`SELECT id FROM weekly_challenges WHERE week_key = '2026-W13'`
  if (existingChallenge.length === 0) {
    await sql`
      INSERT INTO weekly_challenges (week_key, bingo_items, exercise_minimum, exercise_requirements)
      VALUES ('2026-W13', ${'{"a sunset","a dog","someone running"}' as any}::text[], 3, '{"cardio": 2, "strength": 1}'::jsonb)
    `
    console.log('\nCreated weekly challenge for 2026-W13: bingo=[a sunset, a dog, someone running], reqs={cardio:2, strength:1}')
  }

  // Also create one for week 11 (Mar 9-15) that some players have "completed"
  const existingW11 = await sql`SELECT id FROM weekly_challenges WHERE week_key = '2026-W11'`
  if (existingW11.length === 0) {
    await sql`
      INSERT INTO weekly_challenges (week_key, bingo_items, exercise_minimum, exercise_requirements)
      VALUES ('2026-W11', ${'{"a healthy meal","gym selfie"}' as any}::text[], 2, '{"cardio": 1, "strength": 1}'::jsonb)
    `
    console.log('Created weekly challenge for 2026-W11: bingo=[a healthy meal, gym selfie], reqs={cardio:1, strength:1}')

    // Add some bingo photos for active players
    const w11 = await sql`SELECT id FROM weekly_challenges WHERE week_key = '2026-W11'`
    if (w11.length > 0) {
      const challengeId = w11[0].id
      const photoPlayers = ['alex', 'bella', 'charlie', 'diana', 'erik']
      for (const p of photoPlayers) {
        await sql`
          INSERT INTO challenge_photos (challenge_id, player_name, bingo_item, image_url, blob_path)
          VALUES (${challengeId}, ${p}, 'a healthy meal', 'https://placehold.co/400x300/060/ccc?text=HEALTHY+MEAL', ${'seed/challenge/' + p + '/meal'})
          ON CONFLICT (challenge_id, player_name, bingo_item) DO NOTHING
        `
        await sql`
          INSERT INTO challenge_photos (challenge_id, player_name, bingo_item, image_url, blob_path)
          VALUES (${challengeId}, ${p}, 'gym selfie', 'https://placehold.co/400x300/006/ccc?text=GYM+SELFIE', ${'seed/challenge/' + p + '/selfie'})
          ON CONFLICT (challenge_id, player_name, bingo_item) DO NOTHING
        `
      }
      console.log('Added bingo photos for 5 players in W11 challenge')
    }
  }

  await sql.end()
  console.log(`\nDone! Inserted ${totalInserted} exercises for ${PLAYERS.length} players.`)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
