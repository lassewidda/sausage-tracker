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

export async function GET() {
  try {
    const sql = getDb()
    const weekKey = getWeekKey()
    const today = new Date().toISOString().split('T')[0]

    const [todayResult, weekResult] = await Promise.all([
      sql`SELECT COUNT(DISTINCT player_name)::int AS count FROM meals WHERE created_at::date = ${today}::date`,
      sql`SELECT COUNT(*)::int AS total, COUNT(DISTINCT player_name)::int AS players FROM meals WHERE week_key = ${weekKey}`,
    ])
    await sql.end()

    return NextResponse.json({
      todayPlayers: todayResult[0].count as number,
      weekTotal: weekResult[0].total as number,
      weekPlayers: weekResult[0].players as number,
    })
  } catch {
    return NextResponse.json({ todayPlayers: 0, weekTotal: 0, weekPlayers: 0 })
  }
}
