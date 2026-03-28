import { NextResponse } from 'next/server'
import postgres from 'postgres'

export const dynamic = 'force-dynamic'

const IS_EXERCISE = process.env.NEXT_PUBLIC_THEME === 'exercise'

export async function GET() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: { rejectUnauthorized: false } })

  const recentMeals = await sql`
    SELECT player_name, exercise_type, created_at
    FROM meals
    ORDER BY created_at DESC
    LIMIT 10
  `

  let recentPhotos: { player_name: string; bingo_item: string; created_at: string | Date }[] = []
  try {
    const photoRows = await sql`
      SELECT cp.player_name, cp.bingo_item, cp.created_at
      FROM challenge_photos cp
      ORDER BY cp.created_at DESC
      LIMIT 5
    `
    recentPhotos = photoRows as unknown as typeof recentPhotos
  } catch { /* table may not exist */ }

  await sql.end()

  const events: { text: string; time: string }[] = []

  for (const m of recentMeals) {
    const name = (m.player_name as string).toUpperCase()
    const type = m.exercise_type as string | null
    const time = (m.created_at instanceof Date ? m.created_at.toISOString() : m.created_at) as string

    if (type === 'photo') {
      events.push({ text: `📸 ${name} uploaded a bingo photo`, time })
    } else if (IS_EXERCISE && type) {
      const emoji = type === 'cardio' ? '🏃' : '💪'
      events.push({ text: `${emoji} ${name} just logged ${type.toUpperCase()}`, time })
    } else {
      events.push({ text: `🔥 ${name} logged a workout`, time })
    }
  }

  for (const p of recentPhotos) {
    const name = (p.player_name as string).toUpperCase()
    const item = p.bingo_item as string
    const time = (p.created_at instanceof Date ? p.created_at.toISOString() : p.created_at) as string
    events.push({ text: `📸 ${name} found "${item}" for the challenge`, time })
  }

  // Sort by time descending, deduplicate, take top 8
  events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  const seen = new Set<string>()
  const unique = events.filter(e => {
    if (seen.has(e.text)) return false
    seen.add(e.text)
    return true
  }).slice(0, 8)

  return NextResponse.json(unique)
}
