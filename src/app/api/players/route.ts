import { NextResponse } from 'next/server'
import postgres from 'postgres'

export const dynamic = 'force-dynamic'

function getDb() {
  return postgres(process.env.DATABASE_URL!, {
    max: 1,
    ssl: { rejectUnauthorized: false },
    idle_timeout: 20,
    connect_timeout: 10,
  })
}

export async function GET() {
  const sql = getDb()
  const rows = await sql`
    SELECT DISTINCT player_name FROM (
      SELECT player_name FROM meals
      UNION
      SELECT player_name FROM player_goals
    ) combined
    ORDER BY player_name
  `
  await sql.end()
  return NextResponse.json(rows.map(r => r.player_name))
}
