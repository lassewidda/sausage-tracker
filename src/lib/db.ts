import { neon, NeonQueryFunction } from '@neondatabase/serverless'
import type { Meal, WeekGroup } from '@/types'

let _sql: NeonQueryFunction<false, false> | null = null

function getDb(): NeonQueryFunction<false, false> {
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL!)
  }
  return _sql
}

/**
 * Compute ISO 8601 week key, e.g. "2024-W03"
 * Week starts on Monday.
 */
export function getWeekKey(date: Date = new Date()): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  // Set to nearest Thursday (makes ISO week calculation easier)
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

/**
 * Format ISO week key to human-readable label
 * "2024-W03" → "Week of Jan 15, 2024"
 */
export function formatWeekLabel(weekKey: string): string {
  const [year, week] = weekKey.split('-W').map(Number)
  // Find the Monday of that ISO week
  const jan4 = new Date(year, 0, 4) // Jan 4 is always in week 1
  const dayOfWeek = (jan4.getDay() + 6) % 7 // 0=Mon
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - dayOfWeek + (week - 1) * 7)
  return `Week of ${monday.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`
}

export async function insertMeal(data: {
  imageUrl: string
  blobPath: string
  sausageCount: number
  aiSuggestedCount: number | null
  aiDescription: string | null
}): Promise<Meal> {
  const sql = getDb()
  const weekKey = getWeekKey()

  const rows = await sql`
    INSERT INTO meals (image_url, blob_path, sausage_count, ai_suggested_count, ai_description, week_key)
    VALUES (${data.imageUrl}, ${data.blobPath}, ${data.sausageCount}, ${data.aiSuggestedCount}, ${data.aiDescription}, ${weekKey})
    RETURNING id, image_url, blob_path, sausage_count, ai_suggested_count, ai_description, created_at, week_key
  `

  const row = rows[0]
  return rowToMeal(row)
}

export async function getAllMeals(): Promise<Meal[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT id, image_url, blob_path, sausage_count, ai_suggested_count, ai_description, created_at, week_key
    FROM meals
    ORDER BY created_at DESC
  `
  return rows.map(rowToMeal)
}

export function groupByWeek(meals: Meal[]): WeekGroup[] {
  const map = new Map<string, Meal[]>()
  for (const meal of meals) {
    const existing = map.get(meal.weekKey) ?? []
    existing.push(meal)
    map.set(meal.weekKey, existing)
  }

  const weeks: WeekGroup[] = Array.from(map.entries()).map(([weekKey, weekMeals]) => ({
    weekKey,
    weekLabel: formatWeekLabel(weekKey),
    totalSausages: weekMeals.reduce((sum, m) => sum + m.sausageCount, 0),
    meals: weekMeals,
  }))

  // Sort newest first
  weeks.sort((a, b) => b.weekKey.localeCompare(a.weekKey))
  return weeks
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMeal(row: any): Meal {
  return {
    id: row.id,
    imageUrl: row.image_url,
    blobPath: row.blob_path,
    sausageCount: row.sausage_count,
    aiSuggestedCount: row.ai_suggested_count,
    aiDescription: row.ai_description,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    weekKey: row.week_key,
  }
}
