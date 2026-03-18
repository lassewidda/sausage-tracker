import postgres from 'postgres'
import type { Meal, WeekGroup, Leaderboard, LeaderboardEntry, SausageChainEntry, WeeklySummary } from '@/types'

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

function prevWeekKey(weekKey: string): string {
  const [yearStr, weekStr] = weekKey.split('-W')
  const year = parseInt(yearStr)
  const week = parseInt(weekStr)
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = (jan4.getDay() + 6) % 7
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - dayOfWeek + (week - 1) * 7)
  monday.setDate(monday.getDate() - 7)
  return getWeekKey(monday)
}

export async function getSausageChains(): Promise<SausageChainEntry[]> {
  const sql = getDb()

  const rows = await sql`
    SELECT player_name, week_key, SUM(sausage_count)::int AS week_total
    FROM meals
    GROUP BY player_name, week_key
  `
  await sql.end()

  // Build a map: playerName -> (weekKey -> total)
  const byPlayer = new Map<string, Map<string, number>>()
  for (const row of rows) {
    const name = row.player_name as string
    const week = row.week_key as string
    const total = row.week_total as number
    if (!byPlayer.has(name)) byPlayer.set(name, new Map())
    byPlayer.get(name)!.set(week, total)
  }

  const currentWeek = getWeekKey()
  const entries: SausageChainEntry[] = []

  for (const [playerName, weekMap] of Array.from(byPlayer.entries())) {
    let streak = 0
    let wk = currentWeek

    // Walk backwards up to 500 weeks (safety limit)
    for (let i = 0; i < 500; i++) {
      const total = weekMap.get(wk) ?? 0
      if (total >= 3) {
        streak++
        wk = prevWeekKey(wk)
      } else {
        // Current week with < 3 doesn't break the streak — skip it and check last week
        if (i === 0) {
          wk = prevWeekKey(wk)
          continue
        }
        break
      }
    }

    entries.push({ playerName, streakWeeks: streak })
  }

  // Sort by streak descending, then alphabetically
  entries.sort((a, b) => b.streakWeeks - a.streakWeeks || a.playerName.localeCompare(b.playerName))
  return entries
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

// ── Weekly Summaries ──────────────────────────────────────────

export interface PlayerWeekData {
  playerName: string
  weekKey: string
  meals: { description: string | null; sausageCount: number; estimatedGrams: number | null }[]
  totalSausages: number
  totalGrams: number
  chainLength: number
  prevWeekSausages: number
}

export async function getPlayerWeekData(weekKey: string): Promise<PlayerWeekData[]> {
  const sql = getDb()

  const [mealRows, chainRows, prevRows] = await Promise.all([
    sql`
      SELECT player_name, ai_description, sausage_count, estimated_grams
      FROM meals WHERE week_key = ${weekKey}
      ORDER BY player_name, created_at
    `,
    sql`
      SELECT player_name, week_key, SUM(sausage_count)::int AS week_total
      FROM meals GROUP BY player_name, week_key
    `,
    sql`
      SELECT player_name, SUM(sausage_count)::int AS total
      FROM meals WHERE week_key = ${prevWeekKey(weekKey)}
      GROUP BY player_name
    `,
  ])
  await sql.end()

  // Build chain map
  const chainMap = new Map<string, Map<string, number>>()
  for (const r of chainRows) {
    const name = r.player_name as string
    if (!chainMap.has(name)) chainMap.set(name, new Map())
    chainMap.get(name)!.set(r.week_key as string, r.week_total as number)
  }

  // Compute chain length per player at given week
  function computeChain(player: string): number {
    const weekMap = chainMap.get(player)
    if (!weekMap) return 0
    let streak = 0
    let wk = weekKey
    for (let i = 0; i < 500; i++) {
      if ((weekMap.get(wk) ?? 0) >= 3) {
        streak++
        wk = prevWeekKey(wk)
      } else {
        break
      }
    }
    return streak
  }

  // Prev week sausages per player
  const prevMap = new Map<string, number>()
  for (const r of prevRows) prevMap.set(r.player_name as string, r.total as number)

  // Group meals by player
  const byPlayer = new Map<string, PlayerWeekData>()
  for (const r of mealRows) {
    const name = r.player_name as string
    if (!byPlayer.has(name)) {
      byPlayer.set(name, {
        playerName: name,
        weekKey,
        meals: [],
        totalSausages: 0,
        totalGrams: 0,
        chainLength: computeChain(name),
        prevWeekSausages: prevMap.get(name) ?? 0,
      })
    }
    const pd = byPlayer.get(name)!
    const count = r.sausage_count as number
    const grams = (r.estimated_grams as number | null) ?? 0
    pd.meals.push({
      description: r.ai_description as string | null,
      sausageCount: count,
      estimatedGrams: r.estimated_grams as number | null,
    })
    pd.totalSausages += count
    pd.totalGrams += grams
  }

  return Array.from(byPlayer.values())
}

export async function getWeeklySummaries(weekKey: string): Promise<WeeklySummary[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT id, player_name, week_key, summary_text, total_sausages, total_grams, meal_count, chain_length, created_at
    FROM weekly_summaries
    WHERE week_key = ${weekKey}
    ORDER BY total_sausages DESC
  `
  await sql.end()
  return rows.map(rowToSummary)
}

export async function getAllWeeklySummaries(): Promise<WeeklySummary[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT id, player_name, week_key, summary_text, total_sausages, total_grams, meal_count, chain_length, created_at
    FROM weekly_summaries
    ORDER BY week_key DESC, total_sausages DESC
  `
  await sql.end()
  return rows.map(rowToSummary)
}

export async function insertWeeklySummary(data: {
  playerName: string
  weekKey: string
  summaryText: string
  totalSausages: number
  totalGrams: number
  mealCount: number
  chainLength: number
}): Promise<WeeklySummary> {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO weekly_summaries (player_name, week_key, summary_text, total_sausages, total_grams, meal_count, chain_length)
    VALUES (${data.playerName}, ${data.weekKey}, ${data.summaryText}, ${data.totalSausages}, ${data.totalGrams}, ${data.mealCount}, ${data.chainLength})
    ON CONFLICT (player_name, week_key) DO UPDATE SET
      summary_text = EXCLUDED.summary_text,
      total_sausages = EXCLUDED.total_sausages,
      total_grams = EXCLUDED.total_grams,
      meal_count = EXCLUDED.meal_count,
      chain_length = EXCLUDED.chain_length
    RETURNING id, player_name, week_key, summary_text, total_sausages, total_grams, meal_count, chain_length, created_at
  `
  await sql.end()
  return rowToSummary(rows[0])
}

export async function getWeeksWithMeals(): Promise<string[]> {
  const sql = getDb()
  const rows = await sql`SELECT DISTINCT week_key FROM meals ORDER BY week_key DESC`
  await sql.end()
  return rows.map(r => r.week_key as string)
}

export async function getSummarizedWeeks(): Promise<string[]> {
  const sql = getDb()
  const rows = await sql`SELECT DISTINCT week_key FROM weekly_summaries ORDER BY week_key DESC`
  await sql.end()
  return rows.map(r => r.week_key as string)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSummary(row: any): WeeklySummary {
  return {
    id: row.id,
    playerName: row.player_name,
    weekKey: row.week_key,
    summaryText: row.summary_text,
    totalSausages: row.total_sausages,
    totalGrams: row.total_grams,
    mealCount: row.meal_count,
    chainLength: row.chain_length,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
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
