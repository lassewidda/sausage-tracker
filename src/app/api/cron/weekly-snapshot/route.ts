import { NextResponse } from 'next/server'
import { getWeekKey } from '@/lib/db'
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
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sql = getDb()

  try {
    // This runs at midnight Monday Stockholm time = end of the previous week
    const weekKey = getWeekKey()

    // Get all player goals
    const goals = await sql`
      SELECT player_name, cardio_target, strength_target FROM player_goals
      WHERE cardio_target > 0 OR strength_target > 0
    `

    if (goals.length === 0) {
      await sql.end()
      return NextResponse.json({ ok: true, message: 'No goals to snapshot', weekKey })
    }

    // Get workout counts for this week grouped by player and type
    const counts = await sql`
      SELECT player_name, exercise_type, COUNT(*)::int AS cnt
      FROM meals
      WHERE week_key = ${weekKey}
      GROUP BY player_name, exercise_type
    `

    // Build counts map: player -> { cardio, strength }
    const countMap = new Map<string, { cardio: number; strength: number }>()
    for (const row of counts) {
      const name = row.player_name as string
      if (!countMap.has(name)) countMap.set(name, { cardio: 0, strength: 0 })
      const entry = countMap.get(name)!
      if (row.exercise_type === 'cardio') entry.cardio = row.cnt as number
      else if (row.exercise_type === 'strength') entry.strength = row.cnt as number
    }

    // Upsert snapshots for all players with goals
    let snapshotCount = 0
    for (const goal of goals) {
      const playerName = goal.player_name as string
      const cardioTarget = goal.cardio_target as number
      const strengthTarget = goal.strength_target as number
      const actual = countMap.get(playerName) ?? { cardio: 0, strength: 0 }
      const goalMet = actual.cardio >= cardioTarget && actual.strength >= strengthTarget

      await sql`
        INSERT INTO weekly_goal_snapshots (player_name, week_key, cardio_target, strength_target, cardio_actual, strength_actual, goal_met)
        VALUES (${playerName}, ${weekKey}, ${cardioTarget}, ${strengthTarget}, ${actual.cardio}, ${actual.strength}, ${goalMet})
        ON CONFLICT (player_name, week_key) DO UPDATE SET
          cardio_target = ${cardioTarget},
          strength_target = ${strengthTarget},
          cardio_actual = ${actual.cardio},
          strength_actual = ${actual.strength},
          goal_met = ${goalMet}
      `
      snapshotCount++
    }

    await sql.end()
    return NextResponse.json({ ok: true, weekKey, snapshotCount })
  } catch (error) {
    console.error('Weekly snapshot cron error:', error)
    await sql.end()
    return NextResponse.json({ error: 'Failed to create snapshots', details: String(error) }, { status: 500 })
  }
}
