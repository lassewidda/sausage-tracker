import postgres from 'postgres'
import type { Meal, WeekGroup, Leaderboard, LeaderboardEntry } from '@/types'

function getDb() {
  return postgres(process.env.DATABASE_URL!, {
    max: 1,
    ssl: { rejectUnauthorized: false },
    idle_timeout: 20,
    connect_timeout: 10,
  })
}

export function getWeekKey(date: Date = new Date()): string {
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

export function formatWeekLabel(weekKey: string): string {
  const [year, week] = weekKey.split('-W').map(Number)
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = (jan4.getDay() + 6) % 7
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
  estimatedGrams: number | null
  playerName: string
}): Promise<Meal> {
  const sql = getDb()
  const weekKey = getWeekKey()

  const rows = await sql`
    INSERT INTO meals (image_url, blob_path, sausage_count, ai_suggested_count, ai_description, estimated_grams, week_key, player_name)
    VALUES (${data.imageUrl}, ${data.blobPath}, ${data.sausageCount}, ${data.aiSuggestedCount}, ${data.aiDescription}, ${data.estimatedGrams}, ${weekKey}, ${data.playerName})
    RETURNING id, image_url, blob_path, sausage_count, ai_suggested_count, ai_description, estimated_grams, created_at, week_key, player_name
  `

  await sql.end()
  return rowToMeal(rows[0])
}

export async function getAllMeals(): Promise<Meal[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT id, image_url, blob_path, sausage_count, ai_suggested_count, ai_description, estimated_grams, created_at, week_key, player_name
    FROM meals
    ORDER BY created_at DESC
  `
  await sql.end()
  return rows.map(rowToMeal)
}

export async function deleteMeal(id: string, playerName: string): Promise<Meal | null> {
  const sql = getDb()
  // Allow deletion if playerName matches OR if the meal is 'Anonymous' (legacy test posts)
  const rows = await sql`
    DELETE FROM meals
    WHERE id = ${id}
      AND (player_name = ${playerName} OR player_name = 'Anonymous')
    RETURNING id, image_url, blob_path, sausage_count, ai_suggested_count, ai_description, created_at, week_key, player_name
  `
  await sql.end()
  return rows.length > 0 ? rowToMeal(rows[0]) : null
}

export async function getLeaderboard(): Promise<Leaderboard> {
  const sql = getDb()
  const weekKey = getWeekKey()

  const [allTimeRows, weekRows] = await Promise.all([
    sql`
      SELECT player_name, SUM(sausage_count)::int AS total, COALESCE(SUM(estimated_grams), 0)::int AS total_grams
      FROM meals
      GROUP BY player_name
      ORDER BY total DESC
    `,
    sql`
      SELECT player_name, SUM(sausage_count)::int AS total, COALESCE(SUM(estimated_grams), 0)::int AS total_grams
      FROM meals
      WHERE week_key = ${weekKey}
      GROUP BY player_name
      ORDER BY total DESC
    `,
  ])

  await sql.end()

  const toEntries = (rows: typeof allTimeRows): LeaderboardEntry[] =>
    rows.map((r, i) => ({
      playerName: r.player_name as string,
      totalSausages: r.total as number,
      totalGrams: r.total_grams as number,
      rank: i + 1,
    }))

  return {
    allTime: toEntries(allTimeRows),
    thisWeek: toEntries(weekRows),
    weekKey,
  }
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
    totalGrams: weekMeals.reduce((sum, m) => sum + (m.estimatedGrams ?? 0), 0),
    meals: weekMeals,
  }))

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
    estimatedGrams: row.estimated_grams ?? null,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    weekKey: row.week_key,
    playerName: row.player_name ?? 'Anonymous',
  }
}
