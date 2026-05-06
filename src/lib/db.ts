import postgres from 'postgres'
import type { Meal, WeekGroup, Leaderboard, LeaderboardEntry, ChainEntry, WeeklySummary, HeroCard, Battle, BattleDeckCard, BattleTurn, BattleTaunt, BattleStats, BattleState, PlayerItem, BattleEffect, ItemEffectType, WeeklyChallenge, ChallengePhoto, ChallengeParticipant, ChallengeView, ChallengeLeaderboardEntry, Team, TeamProgress, GroupLeaderboardEntry, PlayerGoal, GoalStreakEntry } from '@/types'

function getDb() {
  return postgres(process.env.DATABASE_URL!, {
    max: 5,
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

export async function getPlayerMealCount(playerName: string): Promise<number> {
  const sql = getDb()
  const rows = await sql`SELECT COUNT(*)::int AS count FROM meals WHERE player_name = ${playerName.toLowerCase()}`
  await sql.end()
  return rows[0].count as number
}

export async function insertMeal(data: {
  imageUrl: string
  blobPath: string
  itemCount: number
  aiSuggestedCount: number | null
  aiDescription: string | null
  estimatedGrams: number | null
  playerName: string
  exerciseType?: string | null
}): Promise<Meal> {
  const sql = getDb()
  const weekKey = getWeekKey()

  const rows = await sql`
    INSERT INTO meals (image_url, blob_path, item_count, ai_suggested_count, ai_description, estimated_grams, week_key, player_name, exercise_type)
    VALUES (${data.imageUrl}, ${data.blobPath}, ${data.itemCount}, ${data.aiSuggestedCount}, ${data.aiDescription}, ${data.estimatedGrams}, ${weekKey}, ${data.playerName}, ${data.exerciseType ?? null})
    RETURNING id, image_url, blob_path, item_count, ai_suggested_count, ai_description, estimated_grams, created_at, week_key, player_name, exercise_type
  `

  await sql.end()
  return rowToMeal(rows[0])
}

export async function getAllMeals(): Promise<Meal[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT id, image_url, blob_path, item_count, ai_suggested_count, ai_description, estimated_grams, created_at, week_key, player_name, exercise_type
    FROM meals
    ORDER BY created_at DESC
  `
  await sql.end()
  return rows.map(rowToMeal)
}

export async function getMealsPaginated(options: {
  page?: number
  perPage?: number
  weekKey?: string
}): Promise<{ meals: Meal[]; total: number }> {
  const sql = getDb()
  const page = options.page ?? 1
  const perPage = options.perPage ?? 20
  const offset = (page - 1) * perPage

  let meals, countResult
  if (options.weekKey) {
    [meals, countResult] = await Promise.all([
      sql`SELECT id, image_url, blob_path, item_count, ai_suggested_count, ai_description, estimated_grams, created_at, week_key, player_name, exercise_type
        FROM meals WHERE week_key = ${options.weekKey}
        ORDER BY created_at DESC LIMIT ${perPage} OFFSET ${offset}`,
      sql`SELECT COUNT(*)::int AS count FROM meals WHERE week_key = ${options.weekKey}`,
    ])
  } else {
    [meals, countResult] = await Promise.all([
      sql`SELECT id, image_url, blob_path, item_count, ai_suggested_count, ai_description, estimated_grams, created_at, week_key, player_name, exercise_type
        FROM meals ORDER BY created_at DESC LIMIT ${perPage} OFFSET ${offset}`,
      sql`SELECT COUNT(*)::int AS count FROM meals`,
    ])
  }
  await sql.end()
  return { meals: meals.map(rowToMeal), total: countResult[0].count as number }
}

export async function getAvailableWeeks(): Promise<string[]> {
  const sql = getDb()
  const rows = await sql`SELECT DISTINCT week_key FROM meals ORDER BY week_key DESC`
  await sql.end()
  return rows.map(r => r.week_key as string)
}

export async function deleteMeal(id: string, playerName: string): Promise<Meal | null> {
  const sql = getDb()
  // Allow deletion if playerName matches OR if the meal is 'Anonymous' (legacy test posts)
  const rows = await sql`
    DELETE FROM meals
    WHERE id = ${id}
      AND (player_name = ${playerName} OR player_name = 'Anonymous')
    RETURNING id, image_url, blob_path, item_count, ai_suggested_count, ai_description, estimated_grams, created_at, week_key, player_name, exercise_type
  `
  await sql.end()
  return rows.length > 0 ? rowToMeal(rows[0]) : null
}

export async function updateMealDescription(id: string, playerName: string, description: string): Promise<Meal | null> {
  const sql = getDb()
  const rows = await sql`
    UPDATE meals SET ai_description = ${description}
    WHERE id = ${id} AND player_name = ${playerName}
    RETURNING id, image_url, blob_path, item_count, ai_suggested_count, ai_description, estimated_grams, created_at, week_key, player_name, exercise_type
  `
  await sql.end()
  return rows.length > 0 ? rowToMeal(rows[0]) : null
}

export async function deleteMealByBlobPath(blobPath: string): Promise<void> {
  const sql = getDb()
  await sql`DELETE FROM meals WHERE blob_path = ${blobPath}`
  await sql.end()
}

export async function getLeaderboard(): Promise<Leaderboard> {
  const sql = getDb()
  const weekKey = getWeekKey()

  const [allTimeRows, weekRows] = await Promise.all([
    sql`
      SELECT player_name,
        SUM(item_count)::int AS total,
        COALESCE(SUM(estimated_grams), 0)::int AS total_grams,
        COUNT(*) FILTER (WHERE exercise_type = 'cardio')::int AS cardio_count,
        COUNT(*) FILTER (WHERE exercise_type = 'strength')::int AS strength_count
      FROM meals
      GROUP BY player_name
      ORDER BY total DESC
    `,
    sql`
      SELECT player_name,
        SUM(item_count)::int AS total,
        COALESCE(SUM(estimated_grams), 0)::int AS total_grams,
        COUNT(*) FILTER (WHERE exercise_type = 'cardio')::int AS cardio_count,
        COUNT(*) FILTER (WHERE exercise_type = 'strength')::int AS strength_count
      FROM meals
      WHERE week_key = ${weekKey}
      GROUP BY player_name
      ORDER BY total DESC
    `,
  ])

  // Get challenge completion counts
  let challengeMap = new Map<string, number>()
  try {
    const challengeEntries = await getChallengeLeaderboard()
    for (const e of challengeEntries) {
      challengeMap.set(e.playerName, e.completedChallenges)
    }
  } catch { /* challenges table may not exist yet */ }

  // Get goal streak data
  let goalMap = new Map<string, { totalGoalWeeks: number; hasGoal: boolean }>()
  try {
    const goalStreaks = await getGoalStreaks()
    for (const g of goalStreaks) {
      goalMap.set(g.playerName, { totalGoalWeeks: g.totalGoalWeeks, hasGoal: true })
    }
  } catch { /* goal table may not exist yet */ }

  // Also check who has goals set but maybe 0 goal weeks
  try {
    const allGoals = await getAllPlayerGoals()
    for (const g of allGoals) {
      if (!goalMap.has(g.playerName)) {
        goalMap.set(g.playerName, { totalGoalWeeks: 0, hasGoal: true })
      }
    }
  } catch { /* silent */ }

  await sql.end()

  const toEntries = (rows: typeof allTimeRows): LeaderboardEntry[] =>
    rows.map((r, i) => {
      const playerName = r.player_name as string
      const goalData = goalMap.get(playerName)
      return {
        playerName,
        totalItems: r.total as number,
        totalGrams: r.total_grams as number,
        cardioCount: r.cardio_count as number,
        strengthCount: r.strength_count as number,
        challengesCompleted: challengeMap.get(playerName) ?? 0,
        goalWeeks: goalData?.totalGoalWeeks ?? 0,
        hasGoal: goalData?.hasGoal ?? false,
        rank: i + 1,
      }
    })

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

export async function getChains(): Promise<ChainEntry[]> {
  const sql = getDb()

  const rows = await sql`
    SELECT player_name, week_key, SUM(item_count)::int AS week_total
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
  const entries: ChainEntry[] = []

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

// ── Player Goals ──────────────────────────────────────────

export async function getPlayerGoal(playerName: string): Promise<PlayerGoal | null> {
  const sql = getDb()
  const rows = await sql`
    SELECT player_name, cardio_target, strength_target, slack_user_id
    FROM player_goals
    WHERE player_name = ${playerName}
  `
  await sql.end()
  if (rows.length === 0) return null
  return {
    playerName: rows[0].player_name as string,
    cardioTarget: rows[0].cardio_target as number,
    strengthTarget: rows[0].strength_target as number,
    slackUserId: (rows[0].slack_user_id as string) || undefined,
  }
}

export async function upsertPlayerGoal(playerName: string, cardioTarget: number, strengthTarget: number, slackUserId?: string): Promise<PlayerGoal> {
  const sql = getDb()
  const rows = slackUserId !== undefined
    ? await sql`
        INSERT INTO player_goals (player_name, cardio_target, strength_target, slack_user_id)
        VALUES (${playerName}, ${cardioTarget}, ${strengthTarget}, ${slackUserId})
        ON CONFLICT (player_name) DO UPDATE SET
          cardio_target = ${cardioTarget},
          strength_target = ${strengthTarget},
          slack_user_id = ${slackUserId}
        RETURNING player_name, cardio_target, strength_target, slack_user_id
      `
    : await sql`
        INSERT INTO player_goals (player_name, cardio_target, strength_target)
        VALUES (${playerName}, ${cardioTarget}, ${strengthTarget})
        ON CONFLICT (player_name) DO UPDATE SET
          cardio_target = ${cardioTarget},
          strength_target = ${strengthTarget}
        RETURNING player_name, cardio_target, strength_target, slack_user_id
      `
  await sql.end()
  return {
    playerName: rows[0].player_name as string,
    cardioTarget: rows[0].cardio_target as number,
    strengthTarget: rows[0].strength_target as number,
    slackUserId: (rows[0].slack_user_id as string) || undefined,
  }
}

export async function getSlackUserId(playerName: string): Promise<string | null> {
  const sql = getDb()
  const rows = await sql`
    SELECT slack_user_id FROM player_goals WHERE player_name = ${playerName}
  `
  await sql.end()
  if (rows.length === 0 || !rows[0].slack_user_id) return null
  return rows[0].slack_user_id as string
}

export async function setSlackUserId(playerName: string, slackUserId: string): Promise<void> {
  const sql = getDb()
  await sql`
    INSERT INTO player_goals (player_name, cardio_target, strength_target, slack_user_id)
    VALUES (${playerName}, 0, 0, ${slackUserId})
    ON CONFLICT (player_name) DO UPDATE SET slack_user_id = ${slackUserId}
  `
  await sql.end()
}

export async function getAllPlayerGoals(): Promise<PlayerGoal[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT player_name, cardio_target, strength_target
    FROM player_goals
  `
  await sql.end()
  return rows.map(r => ({
    playerName: r.player_name as string,
    cardioTarget: r.cardio_target as number,
    strengthTarget: r.strength_target as number,
  }))
}

export async function getGoalStreaks(): Promise<GoalStreakEntry[]> {
  const sql = getDb()

  // Get all goals
  const goalRows = await sql`
    SELECT player_name, cardio_target, strength_target FROM player_goals
  `

  if (goalRows.length === 0) {
    await sql.end()
    return []
  }

  // Get snapshots for past weeks (frozen goal completion)
  const snapshotRows = await sql`
    SELECT player_name, week_key, goal_met FROM weekly_goal_snapshots
  `

  // Get all meals grouped by player, week, and exercise_type (for current week + pre-snapshot weeks)
  const mealRows = await sql`
    SELECT player_name, week_key, exercise_type, COUNT(*)::int AS cnt
    FROM meals
    GROUP BY player_name, week_key, exercise_type
  `
  await sql.end()

  // Build snapshot map: player -> week -> goal_met
  const snapshots = new Map<string, Map<string, boolean>>()
  for (const row of snapshotRows) {
    const name = row.player_name as string
    const week = row.week_key as string
    if (!snapshots.has(name)) snapshots.set(name, new Map())
    snapshots.get(name)!.set(week, row.goal_met as boolean)
  }

  // Build meal counts map: player -> week -> { cardio, strength }
  const weekCounts = new Map<string, Map<string, { cardio: number; strength: number }>>()
  for (const row of mealRows) {
    const name = row.player_name as string
    const week = row.week_key as string
    const exType = (row.exercise_type as string | null) || ''
    const cnt = row.cnt as number

    if (!weekCounts.has(name)) weekCounts.set(name, new Map())
    const playerMap = weekCounts.get(name)!
    if (!playerMap.has(week)) playerMap.set(week, { cardio: 0, strength: 0 })
    const weekData = playerMap.get(week)!

    if (exType === 'cardio') weekData.cardio += cnt
    else if (exType === 'strength') weekData.strength += cnt
  }

  const currentWeek = getWeekKey()
  const entries: GoalStreakEntry[] = []

  for (const goalRow of goalRows) {
    const playerName = goalRow.player_name as string
    const cardioTarget = goalRow.cardio_target as number
    const strengthTarget = goalRow.strength_target as number
    const playerWeeks = weekCounts.get(playerName)
    const playerSnapshots = snapshots.get(playerName)

    // Skip players with 0/0 targets (they can never meet the goal)
    if (cardioTarget === 0 && strengthTarget === 0) continue

    // Helper: check if goal was met for a given week
    // Use snapshot if available (frozen), otherwise calculate dynamically
    const wasGoalMet = (week: string): boolean => {
      if (week !== currentWeek && playerSnapshots?.has(week)) {
        return playerSnapshots.get(week)!
      }
      // Current week or pre-snapshot weeks: calculate from meal data + current goals
      const counts = playerWeeks?.get(week) ?? { cardio: 0, strength: 0 }
      return counts.cardio >= cardioTarget && counts.strength >= strengthTarget
    }

    let streak = 0
    let totalGoalWeeks = 0
    let wk = currentWeek

    // First pass: count total goal weeks across all weeks with activity
    if (playerWeeks) {
      for (const [week] of Array.from(playerWeeks.entries())) {
        if (wasGoalMet(week)) {
          totalGoalWeeks++
        }
      }
    }
    // Also count snapshot weeks where goal was met but no meals exist (edge case)
    if (playerSnapshots) {
      for (const [week, met] of Array.from(playerSnapshots.entries())) {
        if (met && !playerWeeks?.has(week)) {
          totalGoalWeeks++
        }
      }
    }

    // Second pass: count consecutive streak walking backwards
    for (let i = 0; i < 500; i++) {
      const met = wasGoalMet(wk)

      if (met) {
        streak++
        wk = prevWeekKey(wk)
      } else {
        // Current week doesn't break streak — skip and check previous
        if (i === 0) {
          wk = prevWeekKey(wk)
          continue
        }
        break
      }
    }

    entries.push({ playerName, streakWeeks: streak, totalGoalWeeks, cardioTarget, strengthTarget })
  }

  // Sort by streak descending, then by total goal weeks, then alphabetically
  entries.sort((a, b) => b.streakWeeks - a.streakWeeks || b.totalGoalWeeks - a.totalGoalWeeks || a.playerName.localeCompare(b.playerName))
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
    totalItems: weekMeals.reduce((sum, m) => sum + m.itemCount, 0),
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
  meals: { description: string | null; itemCount: number; estimatedGrams: number | null; exerciseType: string | null }[]
  totalItems: number
  totalGrams: number
  chainLength: number
  prevWeekItems: number
}

export async function getPlayerWeekData(weekKey: string): Promise<PlayerWeekData[]> {
  const sql = getDb()

  const [mealRows, chainRows, prevRows] = await Promise.all([
    sql`
      SELECT player_name, ai_description, item_count, estimated_grams, exercise_type
      FROM meals WHERE week_key = ${weekKey}
      ORDER BY player_name, created_at
    `,
    sql`
      SELECT player_name, week_key, SUM(item_count)::int AS week_total
      FROM meals GROUP BY player_name, week_key
    `,
    sql`
      SELECT player_name, SUM(item_count)::int AS total
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

  // Prev week items per player
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
        totalItems: 0,
        totalGrams: 0,
        chainLength: computeChain(name),
        prevWeekItems: prevMap.get(name) ?? 0,
      })
    }
    const pd = byPlayer.get(name)!
    const count = r.item_count as number
    const grams = (r.estimated_grams as number | null) ?? 0
    pd.meals.push({
      description: r.ai_description as string | null,
      itemCount: count,
      estimatedGrams: r.estimated_grams as number | null,
      exerciseType: (r.exercise_type as string | null) ?? null,
    })
    pd.totalItems += count
    pd.totalGrams += grams
  }

  return Array.from(byPlayer.values())
}

async function attachImageUrls(sql: ReturnType<typeof getDb>, summaries: WeeklySummary[]): Promise<WeeklySummary[]> {
  if (summaries.length === 0) return summaries

  const weekKeys = Array.from(new Set(summaries.map(s => s.weekKey)))
  const playerNames = Array.from(new Set(summaries.map(s => s.playerName)))

  // Get meal images
  const mealImages = await sql`
    SELECT player_name, week_key, image_url FROM meals
    WHERE week_key = ANY(${weekKeys}) AND player_name = ANY(${playerNames})
    ORDER BY created_at
  `

  // Get challenge bingo photos
  let bingoPhotos: { player_name: string; week_key: string; image_url: string }[] = []
  try {
    const bRows = await sql`
      SELECT cp.player_name, wc.week_key, cp.image_url
      FROM challenge_photos cp
      JOIN weekly_challenges wc ON wc.id = cp.challenge_id
      WHERE wc.week_key = ANY(${weekKeys}) AND cp.player_name = ANY(${playerNames})
      ORDER BY cp.created_at
    `
    bingoPhotos = bRows as unknown as typeof bingoPhotos
  } catch { /* challenge tables may not exist */ }

  // Build image map: player+week -> urls
  const imageMap = new Map<string, string[]>()
  for (const r of mealImages) {
    const key = `${r.player_name}|${r.week_key}`
    if (!imageMap.has(key)) imageMap.set(key, [])
    imageMap.get(key)!.push(r.image_url as string)
  }
  for (const r of bingoPhotos) {
    const key = `${r.player_name}|${r.week_key}`
    if (!imageMap.has(key)) imageMap.set(key, [])
    imageMap.get(key)!.push(r.image_url as string)
  }

  return summaries.map(s => ({
    ...s,
    imageUrls: imageMap.get(`${s.playerName}|${s.weekKey}`) ?? [],
  }))
}

export async function getWeeklySummaries(weekKey: string): Promise<WeeklySummary[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT id, player_name, week_key, summary_text, total_items, total_grams, meal_count, chain_length, created_at
    FROM weekly_summaries
    WHERE week_key = ${weekKey}
    ORDER BY total_items DESC
  `
  const summaries = rows.map(rowToSummary)
  const result = await attachImageUrls(sql, summaries)
  await sql.end()
  return result
}

export async function getAllWeeklySummaries(): Promise<WeeklySummary[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT id, player_name, week_key, summary_text, total_items, total_grams, meal_count, chain_length, created_at
    FROM weekly_summaries
    ORDER BY week_key DESC, total_items DESC
  `
  const summaries = rows.map(rowToSummary)
  const result = await attachImageUrls(sql, summaries)
  await sql.end()
  return result
}

export async function insertWeeklySummary(data: {
  playerName: string
  weekKey: string
  summaryText: string
  totalItems: number
  totalGrams: number
  mealCount: number
  chainLength: number
}): Promise<WeeklySummary> {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO weekly_summaries (player_name, week_key, summary_text, total_items, total_grams, meal_count, chain_length)
    VALUES (${data.playerName}, ${data.weekKey}, ${data.summaryText}, ${data.totalItems}, ${data.totalGrams}, ${data.mealCount}, ${data.chainLength})
    ON CONFLICT (player_name, week_key) DO UPDATE SET
      summary_text = EXCLUDED.summary_text,
      total_items = EXCLUDED.total_items,
      total_grams = EXCLUDED.total_grams,
      meal_count = EXCLUDED.meal_count,
      chain_length = EXCLUDED.chain_length
    RETURNING id, player_name, week_key, summary_text, total_items, total_grams, meal_count, chain_length, created_at
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
    totalItems: row.total_items,
    totalGrams: row.total_grams,
    mealCount: row.meal_count,
    chainLength: row.chain_length,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
}

// ── Hero Cards ────────────────────────────────────────────────

export async function getHeroCard(playerName: string, weekKey?: string): Promise<HeroCard | null> {
  const sql = getDb()
  let rows
  if (weekKey) {
    rows = await sql`
      SELECT * FROM hero_cards WHERE player_name = ${playerName} AND week_key = ${weekKey}
    `
  } else {
    rows = await sql`
      SELECT * FROM hero_cards WHERE player_name = ${playerName} ORDER BY created_at DESC LIMIT 1
    `
  }
  await sql.end()
  return rows.length > 0 ? rowToHeroCard(rows[0]) : null
}

export async function getPlayerDeck(playerName: string): Promise<HeroCard[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM hero_cards WHERE player_name = ${playerName} ORDER BY created_at DESC
  `
  await sql.end()
  return rows.map(rowToHeroCard)
}

export async function insertHeroCard(data: Omit<HeroCard, 'id' | 'createdAt'>): Promise<HeroCard> {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO hero_cards (player_name, hero_title, hero_type, hp, attack, defense, speed, special_moves, weakness, catchphrase, flavor_text, week_key)
    VALUES (${data.playerName}, ${data.heroTitle}, ${data.heroType}, ${data.hp}, ${data.attack}, ${data.defense}, ${data.speed}, ${data.specialMoves}, ${data.weakness}, ${data.catchphrase}, ${data.flavorText}, ${data.weekKey})
    ON CONFLICT (player_name, week_key) DO UPDATE SET
      hero_title = EXCLUDED.hero_title, hero_type = EXCLUDED.hero_type,
      hp = EXCLUDED.hp, attack = EXCLUDED.attack, defense = EXCLUDED.defense, speed = EXCLUDED.speed,
      special_moves = EXCLUDED.special_moves, weakness = EXCLUDED.weakness,
      catchphrase = EXCLUDED.catchphrase, flavor_text = EXCLUDED.flavor_text,
      created_at = NOW()
    RETURNING *
  `
  await sql.end()
  return rowToHeroCard(rows[0])
}

export async function getPlayerAllTimeStats(playerName: string) {
  const sql = getDb()
  const [statsRows, mealRows, chainRows] = await Promise.all([
    sql`
      SELECT
        COUNT(*)::int AS meal_count,
        SUM(item_count)::int AS total_items,
        COALESCE(SUM(estimated_grams), 0)::int AS total_grams,
        MAX(item_count)::int AS max_in_one_meal,
        COUNT(DISTINCT week_key)::int AS active_weeks,
        COUNT(*) FILTER (WHERE exercise_type = 'cardio')::int AS cardio_count,
        COUNT(*) FILTER (WHERE exercise_type = 'strength')::int AS strength_count
      FROM meals WHERE player_name = ${playerName}
    `,
    sql`
      SELECT ai_description, item_count, estimated_grams, exercise_type
      FROM meals WHERE player_name = ${playerName}
      ORDER BY created_at DESC LIMIT 10
    `,
    sql`
      SELECT week_key, SUM(item_count)::int AS week_total
      FROM meals WHERE player_name = ${playerName}
      GROUP BY week_key
    `,
  ])
  await sql.end()

  const stats = statsRows[0]

  // Compute chain
  const weekMap = new Map<string, number>()
  for (const r of chainRows) weekMap.set(r.week_key as string, r.week_total as number)
  let chain = 0
  let wk = getWeekKey()
  for (let i = 0; i < 500; i++) {
    if ((weekMap.get(wk) ?? 0) >= 3) { chain++; wk = prevWeekKey(wk) }
    else if (i === 0) { wk = prevWeekKey(wk); continue }
    else break
  }

  return {
    mealCount: (stats.meal_count as number) || 0,
    totalItems: (stats.total_items as number) || 0,
    totalGrams: (stats.total_grams as number) || 0,
    maxInOneMeal: (stats.max_in_one_meal as number) || 0,
    activeWeeks: (stats.active_weeks as number) || 0,
    cardioCount: (stats.cardio_count as number) || 0,
    strengthCount: (stats.strength_count as number) || 0,
    chainLength: chain,
    recentMeals: mealRows.map(r => ({
      description: r.ai_description as string | null,
      itemCount: r.item_count as number,
      exerciseType: r.exercise_type as string | null,
    })),
  }
}

export async function getPlayerProfileData(playerName: string) {
  const sql = getDb()

  // Get leaderboard rank
  const rankRows = await sql`
    SELECT player_name, SUM(item_count)::int AS total
    FROM meals GROUP BY player_name ORDER BY total DESC
  `
  const totalPlayers = rankRows.length
  const rank = rankRows.findIndex(r => r.player_name === playerName) + 1

  // Get all hero cards for this player
  const cards = await sql`
    SELECT * FROM hero_cards WHERE player_name = ${playerName} ORDER BY created_at DESC
  `

  // Get recent 10 meals with full data
  const recentActivity = await sql`
    SELECT id, image_url, item_count, ai_description, exercise_type, created_at, week_key
    FROM meals WHERE player_name = ${playerName}
    ORDER BY created_at DESC LIMIT 10
  `

  // Get all photos for photo grid
  const allPhotos = await sql`
    SELECT id, image_url, ai_description, exercise_type, created_at
    FROM meals WHERE player_name = ${playerName}
    ORDER BY created_at DESC
  `

  // Get battle stats
  let battleStats = { wins: 0, losses: 0, eloRating: 1000 }
  try {
    const bRows = await sql`SELECT * FROM battle_stats WHERE player_name = ${playerName}`
    if (bRows.length > 0) {
      battleStats = { wins: bRows[0].wins as number, losses: bRows[0].losses as number, eloRating: bRows[0].elo_rating as number }
    }
  } catch { /* table may not exist */ }

  // Get challenge completions
  let challengesCompleted = 0
  try {
    const challenges = await sql`SELECT * FROM weekly_challenges`
    if (challenges.length > 0) {
      const allPhotos = await sql`SELECT * FROM challenge_photos WHERE player_name = ${playerName}`
      const exerciseRows = await sql`
        SELECT week_key, SUM(item_count)::int AS exercise_count
        FROM meals WHERE player_name = ${playerName}
        GROUP BY week_key
      `
      const exerciseMap = new Map<string, number>()
      for (const row of exerciseRows) exerciseMap.set(row.week_key as string, row.exercise_count as number)

      for (const ch of challenges) {
        const bingoItems = ch.bingo_items as string[]
        const challengePhotos = allPhotos.filter((p: Record<string, unknown>) => p.challenge_id === ch.id)
        const completedItems = challengePhotos.map((p: Record<string, unknown>) => p.bingo_item as string)
        const allBingoDone = bingoItems.every(item => completedItems.includes(item))
        const exerciseMet = (exerciseMap.get(ch.week_key as string) ?? 0) >= (ch.exercise_minimum as number)
        if (allBingoDone && exerciseMet) challengesCompleted++
      }
    }
  } catch { /* tables may not exist */ }

  await sql.end()

  return {
    rank,
    totalPlayers,
    cards: cards.map(rowToHeroCard),
    recentActivity: recentActivity.map(r => ({
      id: r.id as string,
      imageUrl: r.image_url as string,
      itemCount: r.item_count as number,
      description: r.ai_description as string | null,
      exerciseType: r.exercise_type as string | null,
      weekKey: r.week_key as string,
      createdAt: (r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at) as string,
    })),
    photos: allPhotos.map(r => ({
      id: r.id as string,
      imageUrl: r.image_url as string,
      description: r.ai_description as string | null,
      exerciseType: r.exercise_type as string | null,
      createdAt: (r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at) as string,
    })),
    battleStats,
    challengesCompleted,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToHeroCard(row: any): HeroCard {
  return {
    id: row.id,
    playerName: row.player_name,
    heroTitle: row.hero_title,
    heroType: row.hero_type,
    hp: row.hp,
    attack: row.attack,
    defense: row.defense,
    speed: row.speed,
    specialMoves: row.special_moves ?? [],
    weakness: row.weakness,
    catchphrase: row.catchphrase,
    flavorText: row.flavor_text,
    weekKey: row.week_key ?? '',
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
}

// ── Battles ──────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToBattle(row: any): Battle {
  return {
    id: row.id,
    challenger: row.challenger,
    opponent: row.opponent,
    targetOpponent: row.target_opponent ?? null,
    status: row.status,
    challengerReady: row.challenger_ready,
    opponentReady: row.opponent_ready,
    currentTurn: row.current_turn,
    turnPlayer: row.turn_player,
    winner: row.winner,
    summary: row.summary ?? null,
    switchPlayer: row.switch_player ?? null,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToDeckCard(row: any): BattleDeckCard {
  return {
    id: row.id,
    battleId: row.battle_id,
    playerName: row.player_name,
    cardId: row.card_id,
    position: row.position,
    currentHp: row.current_hp,
    isActive: row.is_active,
    isKnockedOut: row.is_knocked_out,
    lastMoveUsed: row.last_move_used ?? null,
    card: row.hero_title ? rowToHeroCard(row) : undefined,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTurn(row: any): BattleTurn {
  return {
    id: row.id,
    battleId: row.battle_id,
    turnNumber: row.turn_number,
    attacker: row.attacker,
    attackerCardId: row.attacker_card_id,
    defenderCardId: row.defender_card_id,
    moveUsed: row.move_used,
    moveDamage: row.move_damage,
    typeMultiplier: row.type_multiplier,
    damageDealt: row.damage_dealt,
    defenderHpAfter: row.defender_hp_after,
    isKnockout: row.is_knockout,
    isCritical: row.is_critical ?? false,
    isMiss: row.is_miss as boolean,
    isGuard: row.is_guard as boolean,
    itemUsed: row.item_used ?? null,
    itemEffect: row.item_effect ?? null,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPlayerItem(row: any): PlayerItem {
  return {
    id: row.id,
    playerName: row.player_name,
    itemKey: row.item_key,
    obtainedAt: row.obtained_at instanceof Date ? row.obtained_at.toISOString() : row.obtained_at,
    usedAt: row.used_at ? (row.used_at instanceof Date ? row.used_at.toISOString() : row.used_at) : null,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToBattleEffect(row: any): BattleEffect {
  return {
    id: row.id,
    battleId: row.battle_id,
    targetCardId: row.target_card_id,
    effectType: row.effect_type as ItemEffectType,
    effectValue: row.effect_value,
    remainingTurns: row.remaining_turns,
    sourcePlayer: row.source_player,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTaunt(row: any): BattleTaunt {
  return {
    id: row.id,
    battleId: row.battle_id,
    playerName: row.player_name,
    message: row.message,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToBattleStats(row: any): BattleStats {
  return {
    playerName: row.player_name,
    wins: row.wins,
    losses: row.losses,
    eloRating: row.elo_rating,
  }
}

export async function createBattle(challenger: string, targetOpponent?: string): Promise<Battle> {
  const sql = getDb()
  // Clean up stale waiting battles older than 1 hour
  await sql`DELETE FROM battles WHERE status = 'waiting' AND created_at < NOW() - INTERVAL '1 hour'`
  const rows = await sql`
    INSERT INTO battles (challenger, target_opponent) VALUES (${challenger}, ${targetOpponent ?? null}) RETURNING *
  `
  await sql.end()
  return rowToBattle(rows[0])
}

export async function getOpenBattles(playerName?: string): Promise<Battle[]> {
  const sql = getDb()
  // Clean up stale
  await sql`DELETE FROM battles WHERE status = 'waiting' AND created_at < NOW() - INTERVAL '1 hour'`
  const rows = await sql`
    SELECT * FROM battles WHERE status = 'waiting'
      AND (target_opponent IS NULL OR target_opponent = ${playerName ?? ''} OR challenger = ${playerName ?? ''})
    ORDER BY created_at DESC
  `
  await sql.end()
  return rows.map(rowToBattle)
}

export async function getPlayerBattles(playerName: string): Promise<Battle[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM battles
    WHERE (challenger = ${playerName} OR opponent = ${playerName})
      AND status IN ('selecting', 'battling', 'awaiting_switch')
    ORDER BY updated_at DESC
  `
  await sql.end()
  return rows.map(rowToBattle)
}

export async function saveBattleSummary(battleId: string, summary: string): Promise<void> {
  const sql = getDb()
  await sql`UPDATE battles SET summary = ${summary} WHERE id = ${battleId}`
  await sql.end()
}

export async function getFinishedBattles(): Promise<Battle[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM battles
    WHERE status = 'finished'
    ORDER BY updated_at DESC
    LIMIT 50
  `
  await sql.end()
  return rows.map(rowToBattle)
}

export interface BattleLogEntry {
  battle: Battle
  decks: {
    playerName: string
    cards: {
      playerName: string
      heroTitle: string
      heroType: string
      hp: number
      currentHp: number
      isKnockedOut: boolean
    }[]
  }[]
}

export async function getFinishedBattlesWithDecks(): Promise<BattleLogEntry[]> {
  const sql = getDb()
  const [battleRows, deckRows] = await Promise.all([
    sql`SELECT * FROM battles WHERE status = 'finished' ORDER BY updated_at DESC LIMIT 50`,
    sql`
      SELECT d.battle_id, d.player_name, d.current_hp, d.is_knocked_out, d.position,
             h.hero_title, h.hero_type, h.hp
      FROM battle_decks d
      JOIN hero_cards h ON h.id = d.card_id
      JOIN battles b ON b.id = d.battle_id
      WHERE b.status = 'finished'
      ORDER BY d.player_name, d.position
    `,
  ])
  await sql.end()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decksByBattle = new Map<string, Map<string, any[]>>()
  for (const row of deckRows) {
    if (!decksByBattle.has(row.battle_id as string)) decksByBattle.set(row.battle_id as string, new Map())
    const playerMap = decksByBattle.get(row.battle_id as string)!
    if (!playerMap.has(row.player_name as string)) playerMap.set(row.player_name as string, [])
    playerMap.get(row.player_name as string)!.push(row)
  }

  return battleRows.map(row => {
    const battle = rowToBattle(row)
    const playerMap = decksByBattle.get(battle.id) ?? new Map()
    const decks = Array.from(playerMap.entries()).map(([playerName, cards]) => ({
      playerName,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cards: cards.map((c: any) => ({
        playerName: playerName,
        heroTitle: c.hero_title as string,
        heroType: c.hero_type as string,
        hp: c.hp as number,
        currentHp: c.current_hp as number,
        isKnockedOut: c.is_knocked_out as boolean,
      })),
    }))
    return { battle, decks }
  })
}

export async function joinBattle(battleId: string, opponent: string): Promise<Battle> {
  const sql = getDb()
  const rows = await sql`
    UPDATE battles
    SET opponent = ${opponent}, status = 'selecting', updated_at = NOW()
    WHERE id = ${battleId} AND status = 'waiting' AND challenger != ${opponent}
    RETURNING *
  `
  await sql.end()
  if (rows.length === 0) throw new Error('Battle not available')
  return rowToBattle(rows[0])
}

export async function getBattleState(battleId: string): Promise<BattleState> {
  const sql = getDb()
  const [battleRows, deckRows, turnRows, tauntRows, effectRows] = await Promise.all([
    sql`SELECT * FROM battles WHERE id = ${battleId}`,
    sql`
      SELECT d.*, h.player_name, h.hero_title, h.hero_type, h.hp, h.attack, h.defense, h.speed,
             h.special_moves, h.weakness, h.catchphrase, h.flavor_text, h.week_key, h.created_at
      FROM battle_decks d
      JOIN hero_cards h ON h.id = d.card_id
      WHERE d.battle_id = ${battleId}
      ORDER BY d.player_name, d.position
    `,
    sql`
      SELECT * FROM battle_turns WHERE battle_id = ${battleId} ORDER BY turn_number
    `,
    sql`
      SELECT * FROM battle_taunts
      WHERE battle_id = ${battleId} AND created_at > NOW() - INTERVAL '10 seconds'
      ORDER BY created_at DESC LIMIT 5
    `,
    sql`
      SELECT * FROM battle_effects WHERE battle_id = ${battleId}
    `,
  ])
  await sql.end()

  if (battleRows.length === 0) throw new Error('Battle not found')
  const battle = rowToBattle(battleRows[0])

  const allDeck = deckRows.map(rowToDeckCard)
  const challengerDeck = allDeck.filter(d => d.playerName === battle.challenger)
  const opponentDeck = allDeck.filter(d => d.playerName === battle.opponent)

  return {
    battle,
    challengerDeck,
    opponentDeck,
    turns: turnRows.map(rowToTurn),
    taunts: tauntRows.map(rowToTaunt),
    effects: effectRows.map(rowToBattleEffect),
  }
}

export async function submitDeck(battleId: string, playerName: string, cardIds: string[]): Promise<void> {
  const sql = getDb()
  // Verify cards belong to this player
  const cards = await sql`
    SELECT id, hp, week_key FROM hero_cards WHERE id = ANY(${cardIds}) AND player_name = ${playerName}
  `
  if (cards.length !== cardIds.length) {
    await sql.end()
    throw new Error('Invalid cards')
  }
  // Must include at least 1 starter card
  const hasStarter = cards.some(c => (c.week_key as string).startsWith('STARTER'))
  if (!hasStarter) {
    await sql.end()
    throw new Error('Must include at least 1 starter card')
  }

  // Delete existing deck entries for this player in this battle
  await sql`DELETE FROM battle_decks WHERE battle_id = ${battleId} AND player_name = ${playerName}`

  // Insert deck cards
  for (let i = 0; i < cardIds.length; i++) {
    const card = cards.find(c => c.id === cardIds[i])!
    await sql`
      INSERT INTO battle_decks (battle_id, player_name, card_id, position, current_hp, is_active)
      VALUES (${battleId}, ${playerName}, ${cardIds[i]}, ${i}, ${card.hp}, ${i === 0})
    `
  }
  await sql.end()
}

export async function markPlayerReady(battleId: string, playerName: string): Promise<Battle> {
  const sql = getDb()
  // Mark this player ready
  await sql`
    UPDATE battles SET
      challenger_ready = CASE WHEN challenger = ${playerName} THEN true ELSE challenger_ready END,
      opponent_ready = CASE WHEN opponent = ${playerName} THEN true ELSE opponent_ready END,
      updated_at = NOW()
    WHERE id = ${battleId}
  `
  // Check if both ready → start battle
  const rows = await sql`SELECT * FROM battles WHERE id = ${battleId}`
  const battle = rowToBattle(rows[0])

  if (battle.challengerReady && battle.opponentReady) {
    // Determine who goes first based on active cards' speed
    const deckRows = await sql`
      SELECT d.player_name, h.speed FROM battle_decks d
      JOIN hero_cards h ON h.id = d.card_id
      WHERE d.battle_id = ${battleId} AND d.is_active = true
    `
    const challengerSpeed = deckRows.find(r => r.player_name === battle.challenger)?.speed ?? 0
    const opponentSpeed = deckRows.find(r => r.player_name === battle.opponent)?.speed ?? 0

    const { determineTurnOrder } = await import('./battleEngine')
    const firstPlayer = determineTurnOrder(
      { playerName: battle.challenger, speed: challengerSpeed as number },
      { playerName: battle.opponent!, speed: opponentSpeed as number }
    )

    const updatedRows = await sql`
      UPDATE battles SET status = 'battling', current_turn = 1, turn_player = ${firstPlayer}, updated_at = NOW()
      WHERE id = ${battleId} RETURNING *
    `
    await sql.end()
    return rowToBattle(updatedRows[0])
  }

  await sql.end()
  return battle
}

export async function executeTurn(
  battleId: string,
  playerName: string,
  moveIndex: number | null,
  itemId?: string
): Promise<BattleTurn> {
  const sql = getDb()

  // Get battle state with row lock
  const battleRows = await sql`SELECT * FROM battles WHERE id = ${battleId} FOR UPDATE`
  if (battleRows.length === 0) { await sql.end(); throw new Error('Battle not found') }
  const battle = rowToBattle(battleRows[0])

  if (battle.status !== 'battling') { await sql.end(); throw new Error('Battle not in progress') }
  if (battle.turnPlayer !== playerName) { await sql.end(); throw new Error('Not your turn') }

  // Get active cards
  const deckRows = await sql`
    SELECT d.*, h.player_name, h.hero_title, h.hero_type, h.hp, h.attack, h.defense, h.speed,
           h.special_moves, h.weakness, h.catchphrase, h.flavor_text, h.week_key, h.created_at
    FROM battle_decks d
    JOIN hero_cards h ON h.id = d.card_id
    WHERE d.battle_id = ${battleId} AND d.is_active = true
  `

  const attackerDeck = deckRows.find(r => r.player_name === playerName)
  const defenderName = playerName === battle.challenger ? battle.opponent : battle.challenger
  const defenderDeck = deckRows.find(r => r.player_name === defenderName)

  if (!attackerDeck || !defenderDeck) { await sql.end(); throw new Error('Missing active cards') }

  const attackerCard = rowToHeroCard(attackerDeck)
  const defenderCard = rowToHeroCard(defenderDeck)

  const { calculateDamage, checkBattleEnd, determineTurnOrder, parseMoveDamage } = await import('./battleEngine')
  const { getItemDefinition } = await import('./itemCatalog')

  const opponentName = defenderName

  // ── GUARD ACTION ─────────────────────────────────────────
  if (moveIndex === -1) {
    if (attackerDeck.last_move_used === 'GUARD') {
      await sql.end()
      throw new Error('Cannot guard twice in a row')
    }

    const guardTurn = await sql`
      INSERT INTO battle_turns (battle_id, turn_number, attacker, attacker_card_id, defender_card_id, move_used, move_damage, type_multiplier, damage_dealt, defender_hp_after, is_knockout, is_critical, is_miss, is_guard)
      VALUES (${battleId}, ${battle.currentTurn + 1}, ${playerName}, ${attackerDeck.card_id}, ${defenderDeck.card_id}, ${'GUARD'}, ${0}, ${1.0}, ${0}, ${defenderDeck.current_hp}, ${false}, ${false}, ${false}, ${true})
      RETURNING *
    `

    await sql`UPDATE battle_decks SET last_move_used = 'GUARD' WHERE id = ${attackerDeck.id}`
    await sql`UPDATE battles SET current_turn = current_turn + 1, turn_player = ${opponentName}, updated_at = NOW() WHERE id = ${battleId}`

    await sql.end()
    return {
      id: guardTurn[0].id, battleId, turnNumber: guardTurn[0].turn_number,
      attacker: playerName, attackerCardId: attackerDeck.card_id, defenderCardId: defenderDeck.card_id,
      moveUsed: 'GUARD', moveDamage: 0, typeMultiplier: 1.0, damageDealt: 0,
      defenderHpAfter: defenderDeck.current_hp, isKnockout: false, isCritical: false,
      isMiss: false, isGuard: true, itemUsed: null, itemEffect: null, createdAt: guardTurn[0].created_at,
    } as BattleTurn
  }

  // ── ITEM PATH ─────────────────────────────────────────────
  if (itemId && moveIndex === null) {
    // Validate item ownership, check cooldown, and put on 3-day cooldown
    const consumed = await sql`
      UPDATE player_items SET used_at = NOW()
      WHERE id = ${itemId} AND player_name = ${playerName}
        AND (used_at IS NULL OR used_at < NOW() - INTERVAL '3 days')
      RETURNING item_key
    `
    if (consumed.length === 0) { await sql.end(); throw new Error('Item not found, not yours, or on cooldown') }

    const itemKey = consumed[0].item_key as string
    const item = getItemDefinition(itemKey)
    if (!item) { await sql.end(); throw new Error('Unknown item') }

    let damageDealt = 0
    let defenderHpAfter = defenderDeck.current_hp as number
    let isKo = false
    let itemEffectDesc = item.description

    switch (item.effectType) {
      case 'heal': {
        const maxHp = attackerCard.hp
        const currentHp = attackerDeck.current_hp as number
        const healed = Math.min(item.effectValue, maxHp - currentHp)
        await sql`
          UPDATE battle_decks SET current_hp = ${currentHp + healed} WHERE id = ${attackerDeck.id}
        `
        itemEffectDesc = `Healed ${healed} HP`
        break
      }
      case 'direct_damage': {
        damageDealt = item.effectValue
        defenderHpAfter = Math.max(0, (defenderDeck.current_hp as number) - damageDealt)
        isKo = defenderHpAfter <= 0
        await sql`
          UPDATE battle_decks SET current_hp = ${defenderHpAfter}, is_knocked_out = ${isKo}, is_active = ${!isKo}
          WHERE id = ${defenderDeck.id}
        `
        itemEffectDesc = `Dealt ${damageDealt} direct damage`
        break
      }
      case 'buff_atk':
      case 'buff_def':
      case 'buff_spd': {
        await sql`
          INSERT INTO battle_effects (battle_id, target_card_id, effect_type, effect_value, remaining_turns, source_player)
          VALUES (${battleId}, ${attackerDeck.id}, ${item.effectType}, ${item.effectValue}, ${item.effectDuration ?? 3}, ${playerName})
        `
        break
      }
      case 'debuff_def': {
        await sql`
          INSERT INTO battle_effects (battle_id, target_card_id, effect_type, effect_value, remaining_turns, source_player)
          VALUES (${battleId}, ${defenderDeck.id}, ${item.effectType}, ${item.effectValue}, ${item.effectDuration ?? 3}, ${playerName})
        `
        break
      }
      case 'debuff_atk': {
        // Curry powder bomb: 15 damage + debuff
        damageDealt = 15
        defenderHpAfter = Math.max(0, (defenderDeck.current_hp as number) - damageDealt)
        isKo = defenderHpAfter <= 0
        await sql`
          UPDATE battle_decks SET current_hp = ${defenderHpAfter}, is_knocked_out = ${isKo}, is_active = ${!isKo}
          WHERE id = ${defenderDeck.id}
        `
        if (!isKo) {
          await sql`
            INSERT INTO battle_effects (battle_id, target_card_id, effect_type, effect_value, remaining_turns, source_player)
            VALUES (${battleId}, ${defenderDeck.id}, ${item.effectType}, ${item.effectValue}, ${item.effectDuration ?? 3}, ${playerName})
          `
        }
        itemEffectDesc = `Dealt ${damageDealt} damage + lowered ATK by ${item.effectValue}`
        break
      }
    }

    // Record turn
    const turnRows = await sql`
      INSERT INTO battle_turns (battle_id, turn_number, attacker, attacker_card_id, defender_card_id,
        move_used, move_damage, type_multiplier, damage_dealt, defender_hp_after, is_knockout, is_critical, is_miss, is_guard, item_used, item_effect)
      VALUES (${battleId}, ${battle.currentTurn}, ${playerName}, ${attackerDeck.card_id},
        ${defenderDeck.card_id}, ${'ITEM'}, ${0}, ${1.0},
        ${damageDealt}, ${defenderHpAfter}, ${isKo}, ${false}, ${false}, ${false}, ${itemKey}, ${itemEffectDesc})
      RETURNING *
    `

    // If KO, handle card swap + clear effects
    if (isKo) {
      await sql`DELETE FROM battle_effects WHERE battle_id = ${battleId} AND target_card_id = ${defenderDeck.id}`
      const remainingCards = await sql`
        SELECT id FROM battle_decks
        WHERE battle_id = ${battleId} AND player_name = ${defenderName}
          AND is_knocked_out = false AND is_active = false
        ORDER BY position
      `
      if (remainingCards.length === 1) {
        // Only 1 card left — auto-activate it
        await sql`UPDATE battle_decks SET is_active = true WHERE id = ${remainingCards[0].id}`
      }
      // If 2+ cards: leave none active, enter awaiting_switch (handled below)
    }

    // Check battle end + advance turn (same logic as move path)
    const allDecks = await sql`SELECT * FROM battle_decks WHERE battle_id = ${battleId}`
    const challengerDeck = allDecks.filter(d => d.player_name === battle.challenger).map(rowToDeckCard)
    const opponentDeckCards = allDecks.filter(d => d.player_name === battle.opponent).map(rowToDeckCard)
    const winner = checkBattleEnd(challengerDeck, opponentDeckCards)

    if (winner) {
      await sql`UPDATE battles SET status = 'finished', winner = ${winner}, updated_at = NOW() WHERE id = ${battleId}`
      const loser = winner === battle.challenger ? battle.opponent! : battle.challenger
      await updateBattleStatsInternal(sql, winner, loser)
    } else if (isKo && allDecks.filter(d => d.player_name === defenderName && !d.is_knocked_out && !d.is_active).length >= 2) {
      // Multiple cards remaining — let the KO'd player choose which to send out
      await sql`
        UPDATE battles SET status = 'awaiting_switch', switch_player = ${defenderName},
          current_turn = ${battle.currentTurn + 1}, turn_player = ${playerName}, updated_at = NOW()
        WHERE id = ${battleId}
      `
    } else {
      const nextTurnPlayer = isKo ? playerName : defenderName!
      await sql`
        UPDATE battles SET current_turn = ${battle.currentTurn + 1}, turn_player = ${nextTurnPlayer}, updated_at = NOW()
        WHERE id = ${battleId}
      `
    }

    await sql.end()
    return rowToTurn(turnRows[0])
  }

  // ── MOVE PATH ─────────────────────────────────────────────

  // Fetch active effects for stat modifications
  const effectRows = await sql`
    SELECT * FROM battle_effects WHERE battle_id = ${battleId}
  `

  // Calculate stat modifiers from effects
  let atkMod = 0
  let defModAttacker = 0
  let defModDefender = 0
  for (const eff of effectRows) {
    const targetId = eff.target_card_id as string
    const effType = eff.effect_type as string
    const effVal = eff.effect_value as number
    if (targetId === attackerDeck.id) {
      if (effType === 'buff_atk') atkMod += effVal
      if (effType === 'debuff_atk') atkMod -= effVal
      if (effType === 'buff_def') defModAttacker += effVal
      if (effType === 'debuff_def') defModAttacker -= effVal
    }
    if (targetId === defenderDeck.id) {
      if (effType === 'buff_def') defModDefender += effVal
      if (effType === 'debuff_def') defModDefender -= effVal
      if (effType === 'buff_atk') {} // doesn't affect defense
      if (effType === 'debuff_atk') {} // doesn't affect defense
    }
  }

  // Create modified card copies for damage calculation
  const modAttacker = { ...attackerCard, attack: Math.max(1, attackerCard.attack + atkMod) }
  const modDefender = { ...defenderCard, defense: Math.max(0, defenderCard.defense + defModDefender) }

  // Cooldown check: can't use same move twice in a row
  const chosenMoveForCooldown = modAttacker.specialMoves[moveIndex!] ?? modAttacker.specialMoves[0]
  const cooldownMoveName = parseMoveDamage(chosenMoveForCooldown).name
  if (attackerDeck.last_move_used === cooldownMoveName) {
    await sql.end()
    throw new Error('This move is on cooldown — use a different move')
  }

  // PP validation: check if the chosen move still has uses left
  const chosenMove = modAttacker.specialMoves[moveIndex!] ?? modAttacker.specialMoves[0]
  const { maxPp, name: moveName } = parseMoveDamage(chosenMove)
  const usedCountRows = await sql`
    SELECT COUNT(*)::int AS used FROM battle_turns
    WHERE battle_id = ${battleId} AND attacker_card_id = ${attackerDeck.card_id} AND move_used = ${moveName}
  `
  const usedCount = (usedCountRows[0]?.used as number) ?? 0

  const defenderIsGuarding = defenderDeck.last_move_used === 'GUARD'

  let result
  if (usedCount >= maxPp) {
    result = { damage: 10, multiplier: 1.0, moveName: 'Struggle', baseDamage: 10, isCritical: false, isMiss: false }
  } else {
    result = calculateDamage(modAttacker, modDefender, moveIndex!, defenderIsGuarding)
  }

  // Handle miss
  if (result.isMiss) {
    const turnRow = await sql`
      INSERT INTO battle_turns (battle_id, turn_number, attacker, attacker_card_id, defender_card_id, move_used, move_damage, type_multiplier, damage_dealt, defender_hp_after, is_knockout, is_critical, is_miss, is_guard)
      VALUES (${battleId}, ${battle.currentTurn + 1}, ${playerName}, ${attackerDeck.card_id}, ${defenderDeck.card_id}, ${result.moveName}, ${result.baseDamage}, ${result.multiplier}, ${0}, ${defenderDeck.current_hp}, ${false}, ${false}, ${true}, ${false})
      RETURNING *
    `

    await sql`UPDATE battle_decks SET last_move_used = ${result.moveName} WHERE id = ${attackerDeck.id}`
    await sql`UPDATE battle_decks SET last_move_used = NULL WHERE id = ${defenderDeck.id} AND last_move_used = 'GUARD'`
    await sql`UPDATE battles SET current_turn = current_turn + 1, turn_player = ${opponentName}, updated_at = NOW() WHERE id = ${battleId}`

    // Tick effects
    await sql`UPDATE battle_effects SET remaining_turns = remaining_turns - 1 WHERE battle_id = ${battleId}`
    await sql`DELETE FROM battle_effects WHERE battle_id = ${battleId} AND remaining_turns <= 0`

    await sql.end()
    return {
      id: turnRow[0].id, battleId, turnNumber: turnRow[0].turn_number,
      attacker: playerName, attackerCardId: attackerDeck.card_id, defenderCardId: defenderDeck.card_id,
      moveUsed: result.moveName, moveDamage: result.baseDamage, typeMultiplier: result.multiplier,
      damageDealt: 0, defenderHpAfter: defenderDeck.current_hp as number,
      isKnockout: false, isCritical: false, isMiss: true, isGuard: false,
      itemUsed: null, itemEffect: null, createdAt: turnRow[0].created_at,
    } as BattleTurn
  }

  const newHp = Math.max(0, (defenderDeck.current_hp as number) - result.damage)
  const isKo = newHp <= 0

  // Update defender HP
  await sql`
    UPDATE battle_decks SET current_hp = ${newHp}, is_knocked_out = ${isKo}, is_active = ${!isKo}
    WHERE id = ${defenderDeck.id}
  `

  // Record turn
  const turnRows = await sql`
    INSERT INTO battle_turns (battle_id, turn_number, attacker, attacker_card_id, defender_card_id,
      move_used, move_damage, type_multiplier, damage_dealt, defender_hp_after, is_knockout, is_critical, is_miss, is_guard)
    VALUES (${battleId}, ${battle.currentTurn}, ${playerName}, ${attackerDeck.card_id},
      ${defenderDeck.card_id}, ${result.moveName}, ${result.baseDamage}, ${result.multiplier},
      ${result.damage}, ${newHp}, ${isKo}, ${result.isCritical}, ${false}, ${false})
    RETURNING *
  `

  // Track cooldown: update last_move_used for attacker, clear guard for defender
  await sql`UPDATE battle_decks SET last_move_used = ${result.moveName} WHERE id = ${attackerDeck.id}`
  await sql`UPDATE battle_decks SET last_move_used = NULL WHERE id = ${defenderDeck.id} AND last_move_used = 'GUARD'`

  // Tick effects: decrement remaining_turns, delete expired
  await sql`
    UPDATE battle_effects SET remaining_turns = remaining_turns - 1
    WHERE battle_id = ${battleId}
  `
  await sql`
    DELETE FROM battle_effects WHERE battle_id = ${battleId} AND remaining_turns <= 0
  `

  // If KO, handle card swap and clear effects on dead card
  if (isKo) {
    await sql`DELETE FROM battle_effects WHERE battle_id = ${battleId} AND target_card_id = ${defenderDeck.id}`
    const remainingCards = await sql`
      SELECT id FROM battle_decks
      WHERE battle_id = ${battleId} AND player_name = ${defenderName}
        AND is_knocked_out = false AND is_active = false
      ORDER BY position
    `
    if (remainingCards.length === 1) {
      // Only 1 card left — auto-activate it
      await sql`UPDATE battle_decks SET is_active = true WHERE id = ${remainingCards[0].id}`
    }
    // If 2+ cards: leave none active, enter awaiting_switch (handled below)
  }

  // Check battle end
  const allDecks = await sql`
    SELECT * FROM battle_decks WHERE battle_id = ${battleId}
  `
  const challengerDeck = allDecks.filter(d => d.player_name === battle.challenger).map(rowToDeckCard)
  const opponentDeckCards = allDecks.filter(d => d.player_name === battle.opponent).map(rowToDeckCard)
  const winner = checkBattleEnd(challengerDeck, opponentDeckCards)

  if (winner) {
    await sql`
      UPDATE battles SET status = 'finished', winner = ${winner}, updated_at = NOW()
      WHERE id = ${battleId}
    `
    const loser = winner === battle.challenger ? battle.opponent! : battle.challenger
    await updateBattleStatsInternal(sql, winner, loser)
  } else if (isKo && allDecks.filter(d => d.player_name === defenderName && !d.is_knocked_out && !d.is_active).length >= 2) {
    // Multiple cards remaining — let the KO'd player choose which to send out
    await sql`
      UPDATE battles SET status = 'awaiting_switch', switch_player = ${defenderName},
        current_turn = ${battle.currentTurn + 1}, turn_player = ${playerName}, updated_at = NOW()
      WHERE id = ${battleId}
    `
  } else {
    let nextTurnPlayer: string
    if (isKo) {
      nextTurnPlayer = playerName
    } else {
      nextTurnPlayer = defenderName!
    }

    if (isKo) {
      const activeCards = await sql`
        SELECT d.player_name, h.speed FROM battle_decks d
        JOIN hero_cards h ON h.id = d.card_id
        WHERE d.battle_id = ${battleId} AND d.is_active = true
      `
      if (activeCards.length === 2) {
        const c1 = activeCards.find(r => r.player_name === battle.challenger)
        const c2 = activeCards.find(r => r.player_name === battle.opponent)
        if (c1 && c2) {
          nextTurnPlayer = determineTurnOrder(
            { playerName: battle.challenger, speed: c1.speed as number },
            { playerName: battle.opponent!, speed: c2.speed as number }
          )
        }
      }
    }

    await sql`
      UPDATE battles SET current_turn = ${battle.currentTurn + 1}, turn_player = ${nextTurnPlayer}, updated_at = NOW()
      WHERE id = ${battleId}
    `
  }

  await sql.end()
  return rowToTurn(turnRows[0])
}

export async function switchCard(battleId: string, playerName: string, deckCardId: string): Promise<void> {
  const sql = getDb()

  const battleRows = await sql`SELECT * FROM battles WHERE id = ${battleId} FOR UPDATE`
  if (battleRows.length === 0) { await sql.end(); throw new Error('Battle not found') }
  const battle = rowToBattle(battleRows[0])

  const isVoluntarySwitch = battle.status === 'battling' && battle.turnPlayer === playerName
  const isPostKoSwitch = battle.status === 'awaiting_switch' && battle.switchPlayer === playerName

  if (!isVoluntarySwitch && !isPostKoSwitch) {
    await sql.end()
    throw new Error('Cannot switch right now')
  }

  // Validate the card belongs to this player, is in this battle, and is alive + not active
  const cardRows = await sql`
    SELECT id FROM battle_decks
    WHERE id = ${deckCardId} AND battle_id = ${battleId} AND player_name = ${playerName}
      AND is_knocked_out = false AND is_active = false
  `
  if (cardRows.length === 0) { await sql.end(); throw new Error('Invalid card selection') }

  // Deactivate current active card (for voluntary switch)
  if (isVoluntarySwitch) {
    await sql`UPDATE battle_decks SET is_active = false WHERE battle_id = ${battleId} AND player_name = ${playerName} AND is_active = true`

    // Get opponent's active card for the turn record
    const opponentName = playerName === battle.challenger ? battle.opponent : battle.challenger
    const defenderDeckRows = await sql`
      SELECT card_id, current_hp FROM battle_decks
      WHERE battle_id = ${battleId} AND player_name = ${opponentName} AND is_active = true
      LIMIT 1
    `
    const defenderCardId = defenderDeckRows[0]?.card_id ?? deckCardId
    const defenderHp = (defenderDeckRows[0]?.current_hp as number) ?? 0

    // Record the switch as a turn
    await sql`
      INSERT INTO battle_turns (battle_id, turn_number, attacker, attacker_card_id, defender_card_id, move_used, move_damage, type_multiplier, damage_dealt, defender_hp_after, is_knockout, is_critical, is_miss, is_guard)
      VALUES (${battleId}, ${battle.currentTurn + 1}, ${playerName}, ${deckCardId}, ${defenderCardId}, ${'SWITCH'}, ${0}, ${1.0}, ${0}, ${defenderHp}, ${false}, ${false}, ${false}, ${false})
    `
  }

  // Activate the chosen card
  await sql`UPDATE battle_decks SET is_active = true WHERE id = ${deckCardId}`
  // Reset cooldown for the new card
  await sql`UPDATE battle_decks SET last_move_used = NULL WHERE id = ${deckCardId}`

  if (isVoluntarySwitch) {
    // Voluntary switch costs your turn — opponent goes next
    const opponentName = playerName === battle.challenger ? battle.opponent : battle.challenger
    await sql`
      UPDATE battles SET current_turn = current_turn + 1, turn_player = ${opponentName}, updated_at = NOW()
      WHERE id = ${battleId}
    `
  } else {
    // Post-KO switch — resume battle, attacker keeps turn
    await sql`
      UPDATE battles SET status = 'battling', switch_player = NULL, updated_at = NOW()
      WHERE id = ${battleId}
    `
  }

  await sql.end()
}

async function updateBattleStatsInternal(sql: ReturnType<typeof getDb>, winner: string, loser: string) {
  // Ensure rows exist
  await sql`INSERT INTO battle_stats (player_name) VALUES (${winner}) ON CONFLICT DO NOTHING`
  await sql`INSERT INTO battle_stats (player_name) VALUES (${loser}) ON CONFLICT DO NOTHING`

  const statsRows = await sql`SELECT * FROM battle_stats WHERE player_name IN (${winner}, ${loser})`
  const winnerStats = statsRows.find(r => r.player_name === winner)
  const loserStats = statsRows.find(r => r.player_name === loser)

  const { calculateElo } = await import('./battleEngine')
  const { newWinnerElo, newLoserElo } = calculateElo(
    (winnerStats?.elo_rating as number) ?? 1000,
    (loserStats?.elo_rating as number) ?? 1000
  )

  await sql`UPDATE battle_stats SET wins = wins + 1, elo_rating = ${newWinnerElo} WHERE player_name = ${winner}`
  await sql`UPDATE battle_stats SET losses = losses + 1, elo_rating = ${newLoserElo} WHERE player_name = ${loser}`
}

export async function getBattleLeaderboard(): Promise<BattleStats[]> {
  const sql = getDb()
  const rows = await sql`SELECT * FROM battle_stats ORDER BY elo_rating DESC`
  await sql.end()
  return rows.map(rowToBattleStats)
}

export async function sendTaunt(battleId: string, playerName: string, message: string): Promise<BattleTaunt> {
  const sql = getDb()
  // Rate limit: max 1 taunt per 2 seconds per player
  const recent = await sql`
    SELECT COUNT(*)::int AS count FROM battle_taunts
    WHERE battle_id = ${battleId} AND player_name = ${playerName}
      AND created_at > NOW() - INTERVAL '2 seconds'
  `
  if ((recent[0].count as number) > 0) {
    await sql.end()
    throw new Error('Too fast! Wait a moment.')
  }
  const rows = await sql`
    INSERT INTO battle_taunts (battle_id, player_name, message)
    VALUES (${battleId}, ${playerName}, ${message.slice(0, 80)})
    RETURNING *
  `
  await sql.end()
  return rowToTaunt(rows[0])
}

// ── Inventory ──────────────────────────────────────────────

export async function getPlayerInventory(playerName: string): Promise<PlayerItem[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM player_items WHERE player_name = ${playerName} ORDER BY obtained_at DESC
  `
  await sql.end()
  return rows.map(rowToPlayerItem)
}

export async function addPlayerItem(playerName: string, itemKey: string): Promise<PlayerItem> {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO player_items (player_name, item_key) VALUES (${playerName}, ${itemKey}) RETURNING *
  `
  await sql.end()
  return rowToPlayerItem(rows[0])
}

export async function consumePlayerItem(itemId: string, playerName: string): Promise<boolean> {
  const sql = getDb()
  const rows = await sql`
    UPDATE player_items SET used_at = NOW()
    WHERE id = ${itemId} AND player_name = ${playerName}
      AND (used_at IS NULL OR used_at < NOW() - INTERVAL '3 days')
    RETURNING id
  `
  await sql.end()
  return rows.length > 0
}

// ── Battle Effects ─────────────────────────────────────────

export async function getBattleEffects(battleId: string): Promise<BattleEffect[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM battle_effects WHERE battle_id = ${battleId}
  `
  await sql.end()
  return rows.map(rowToBattleEffect)
}

export async function ensureStarterItem(playerName: string): Promise<void> {
  const sql = getDb()
  const existing = await sql`
    SELECT COUNT(*)::int AS count FROM player_items WHERE player_name = ${playerName}
  `
  if ((existing[0].count as number) > 0) {
    await sql.end()
    return
  }
  // Give one random item
  const themeModule = await import('@/theme')
  const allKeys = Object.keys(themeModule.default.itemCatalog)
  const randomKey = allKeys[Math.floor(Math.random() * allKeys.length)]
  await sql`
    INSERT INTO player_items (player_name, item_key) VALUES (${playerName}, ${randomKey})
  `
  await sql.end()
}

function hashName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0
  return Math.abs(h)
}

function pickStarterCards(playerName: string, allStarters: typeof import('@/theme').default.starterCards): typeof allStarters {
  if (allStarters.length <= 5) return allStarters
  // Deterministic shuffle seeded by player name, then pick first 5
  const seed = hashName(playerName)
  const indices = allStarters.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = ((seed * (i + 1) * 2654435761) >>> 0) % (i + 1)
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices.slice(0, 5).map(i => allStarters[i])
}

export async function ensureStarterCards(playerName: string): Promise<void> {
  const sql = getDb()
  // Check if starter cards already exist
  const existing = await sql`
    SELECT COUNT(*)::int AS count FROM hero_cards
    WHERE player_name = ${playerName} AND week_key LIKE 'STARTER-%'
  `
  if ((existing[0].count as number) >= 5) {
    await sql.end()
    return
  }

  const themeModule = await import('@/theme')
  const allStarters = themeModule.default.starterCards
  const starters = pickStarterCards(playerName, allStarters)
  // Assign STARTER-1 through STARTER-5 keys to the picked cards
  for (let i = 0; i < starters.length; i++) {
    const s = starters[i]
    const weekKey = `STARTER-${i + 1}`
    await sql`
      INSERT INTO hero_cards (player_name, hero_title, hero_type, hp, attack, defense, speed, special_moves, weakness, catchphrase, flavor_text, week_key)
      VALUES (${playerName}, ${s.heroTitle}, ${s.heroType}, ${s.hp}, ${s.attack}, ${s.defense}, ${s.speed}, ${s.specialMoves}, ${s.weakness}, ${s.catchphrase}, ${s.flavorText}, ${weekKey})
      ON CONFLICT (player_name, week_key) DO NOTHING
    `
  }
  await sql.end()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToMeal(row: any): Meal {
  return {
    id: row.id,
    imageUrl: row.image_url,
    blobPath: row.blob_path,
    itemCount: row.item_count,
    aiSuggestedCount: row.ai_suggested_count,
    aiDescription: row.ai_description,
    estimatedGrams: row.estimated_grams ?? null,
    exerciseType: row.exercise_type ?? null,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    weekKey: row.week_key,
    playerName: row.player_name ?? 'Anonymous',
  }
}

// ── Shop / Wallet ──────────────────────────────────────────

export async function getPlayerBalance(playerName: string): Promise<number> {
  const sql = getDb()
  const rows = await sql`
    SELECT balance FROM player_wallets WHERE player_name = ${playerName}
  `
  await sql.end()
  return rows.length > 0 ? (rows[0].balance as number) : 0
}

export async function deductBalance(playerName: string, amount: number): Promise<boolean> {
  const sql = getDb()
  const rows = await sql`
    UPDATE player_wallets SET balance = balance - ${amount}
    WHERE player_name = ${playerName} AND balance >= ${amount}
    RETURNING balance
  `
  await sql.end()
  return rows.length > 0
}

export async function addBalance(playerName: string, amount: number): Promise<number> {
  const sql = getDb()
  const rows = await sql`
    INSERT INTO player_wallets (player_name, balance) VALUES (${playerName}, ${amount})
    ON CONFLICT (player_name) DO UPDATE SET balance = player_wallets.balance + ${amount}
    RETURNING balance
  `
  await sql.end()
  return rows[0].balance as number
}

export async function recordShopPurchase(playerName: string, itemSlug: string, price: number): Promise<void> {
  const sql = getDb()
  await sql`
    INSERT INTO shop_transactions (player_name, item_slug, price)
    VALUES (${playerName}, ${itemSlug}, ${price})
  `
  await sql.end()
}

// ── Weekly Challenges ──────────────────────────────────────────

function rowToChallenge(row: any): WeeklyChallenge {
  let reqs = typeof row.exercise_requirements === 'string' ? JSON.parse(row.exercise_requirements) : (row.exercise_requirements ?? null)
  // Strip mobility from requirements (removed exercise type)
  if (reqs && typeof reqs === 'object') {
    delete reqs.mobility
    if (Object.keys(reqs).length === 0) reqs = null
  }
  let teams: Team[] | null = row.teams ? (typeof row.teams === 'string' ? JSON.parse(row.teams) : row.teams) : null
  if (teams) {
    teams = teams.map(t => ({ ...t, members: t.members.map((m: string) => m.toLowerCase()) }))
  }

  return {
    id: row.id,
    weekKey: row.week_key,
    bingoItems: row.bingo_items ?? [],
    exerciseMinimum: row.exercise_minimum ?? 3,
    exerciseRequirements: reqs,
    challengeMode: (row.challenge_mode as string) ?? 'individual',
    teams,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  } as WeeklyChallenge
}

function rowToChallengePhoto(row: any): ChallengePhoto {
  return {
    id: row.id,
    challengeId: row.challenge_id,
    playerName: row.player_name,
    bingoItem: row.bingo_item,
    imageUrl: row.image_url,
    blobPath: row.blob_path,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  }
}

export async function upsertChallenge(
  weekKey: string,
  bingoItems: string[],
  exerciseMinimum: number,
  exerciseRequirements?: Record<string, number> | null,
  challengeMode: 'individual' | 'group' = 'individual',
  teams?: Team[] | null,
): Promise<WeeklyChallenge> {
  const sql = getDb()
  const reqJson = exerciseRequirements ? JSON.stringify(exerciseRequirements) : null
  const teamsJson = teams ? JSON.stringify(teams.map(t => ({ ...t, members: t.members.map(m => m.toLowerCase()) }))) : null
  const rows = await sql`
    INSERT INTO weekly_challenges (week_key, bingo_items, exercise_minimum, exercise_requirements, challenge_mode, teams)
    VALUES (${weekKey}, ${bingoItems}, ${exerciseMinimum}, ${reqJson}::jsonb, ${challengeMode}, ${teamsJson}::jsonb)
    ON CONFLICT (week_key) DO UPDATE SET bingo_items = ${bingoItems}, exercise_minimum = ${exerciseMinimum}, exercise_requirements = ${reqJson}::jsonb, challenge_mode = ${challengeMode}, teams = ${teamsJson}::jsonb
    RETURNING *
  `
  await sql.end()
  return rowToChallenge(rows[0])
}

export async function getChallengeByWeek(weekKey: string): Promise<WeeklyChallenge | null> {
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM weekly_challenges WHERE week_key = ${weekKey}
  `
  await sql.end()
  return rows.length > 0 ? rowToChallenge(rows[0]) : null
}

export async function getAllChallenges(): Promise<WeeklyChallenge[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM weekly_challenges ORDER BY week_key DESC
  `
  await sql.end()
  return rows.map(rowToChallenge)
}

export async function deleteChallenge(weekKey: string): Promise<boolean> {
  const sql = getDb()
  const rows = await sql`
    DELETE FROM weekly_challenges WHERE week_key = ${weekKey} RETURNING id
  `
  await sql.end()
  return rows.length > 0
}

export async function upsertChallengePhoto(
  challengeId: string,
  playerName: string,
  bingoItem: string,
  imageUrl: string,
  blobPath: string,
  challenge?: WeeklyChallenge | null,
): Promise<ChallengePhoto> {
  const sql = getDb()

  // Group mode guards
  if (challenge && challenge.challengeMode === 'group' && challenge.teams) {
    const playerTeam = challenge.teams.find(t => t.members.includes(playerName.toLowerCase()))
    if (!playerTeam) {
      await sql.end()
      throw new Error('You are not assigned to a team for this challenge')
    }
    // Check if a teammate already submitted this bingo item
    const teamMembers = playerTeam.members
    const existing = await sql`
      SELECT 1 FROM challenge_photos
      WHERE challenge_id = ${challengeId}
        AND bingo_item = ${bingoItem}
        AND player_name = ANY(${teamMembers})
        AND player_name != ${playerName.toLowerCase()}
    `
    if (existing.length > 0) {
      await sql.end()
      throw new Error('A teammate already submitted this item')
    }
  }

  const rows = await sql`
    INSERT INTO challenge_photos (challenge_id, player_name, bingo_item, image_url, blob_path)
    VALUES (${challengeId}, ${playerName}, ${bingoItem}, ${imageUrl}, ${blobPath})
    ON CONFLICT (challenge_id, player_name, bingo_item) DO UPDATE
      SET image_url = ${imageUrl}, blob_path = ${blobPath}
    RETURNING *
  `
  await sql.end()
  return rowToChallengePhoto(rows[0])
}

export async function deleteChallengePhoto(id: string, playerName: string): Promise<string | null> {
  const sql = getDb()
  const rows = await sql`
    DELETE FROM challenge_photos WHERE id = ${id} AND player_name = ${playerName} RETURNING id, blob_path
  `
  await sql.end()
  return rows.length > 0 ? (rows[0].blob_path as string) : null
}

export async function getChallengeView(weekKey: string): Promise<ChallengeView> {
  const sql = getDb()

  // Get the challenge
  const challengeRows = await sql`
    SELECT * FROM weekly_challenges WHERE week_key = ${weekKey}
  `

  if (challengeRows.length === 0) {
    await sql.end()
    return { challenge: null, participants: [] }
  }

  const challenge = rowToChallenge(challengeRows[0])

  // Get all photos for this challenge
  const photoRows = await sql`
    SELECT * FROM challenge_photos WHERE challenge_id = ${challenge.id}
  `
  const photos = photoRows.map(rowToChallengePhoto)

  // Get exercise counts from meals for this week (total + per-type, excluding photos)
  const exerciseRows = await sql`
    SELECT player_name, COUNT(*)::int AS exercise_count
    FROM meals WHERE week_key = ${weekKey} AND (exercise_type IS NULL OR exercise_type != 'photo')
    GROUP BY player_name
  `

  // Get per-type counts for exercise theme
  const typeRows = await sql`
    SELECT player_name, exercise_type, COUNT(*)::int AS type_count
    FROM meals WHERE week_key = ${weekKey} AND exercise_type IS NOT NULL
    GROUP BY player_name, exercise_type
  `

  await sql.end()

  // Build exercise map
  const exerciseMap = new Map<string, number>()
  for (const row of exerciseRows) {
    exerciseMap.set(row.player_name as string, row.exercise_count as number)
  }

  // Build per-type map: player -> { cardio: N, strength: N }
  const typeMap = new Map<string, Record<string, number>>()
  for (const row of typeRows) {
    const player = row.player_name as string
    if (!typeMap.has(player)) typeMap.set(player, {})
    const types = typeMap.get(player)!
    types[row.exercise_type as string] = row.type_count as number
  }

  // Collect all unique players
  const playerSet = new Set<string>()
  for (const photo of photos) playerSet.add(photo.playerName)
  Array.from(exerciseMap.keys()).forEach(name => playerSet.add(name))

  // Build participants
  const participants: ChallengeParticipant[] = Array.from(playerSet).map(playerName => {
    const playerPhotos = photos.filter(p => p.playerName === playerName)
    const completedBingoItems = playerPhotos.map(p => p.bingoItem)
    const exerciseCount = exerciseMap.get(playerName) ?? 0
    const allBingoDone = challenge.bingoItems.every(item => completedBingoItems.includes(item))

    // Check exercise requirements: per-type if available, otherwise total minimum
    let exerciseMet = exerciseCount >= challenge.exerciseMinimum
    if (challenge.exerciseRequirements) {
      const playerTypes = typeMap.get(playerName) ?? {}
      exerciseMet = Object.entries(challenge.exerciseRequirements).every(
        ([type, required]) => (playerTypes[type] ?? 0) >= (required as number)
      )
    }

    return {
      playerName,
      photos: playerPhotos,
      exerciseCount,
      exerciseTypeCounts: (() => { const t = { ...(typeMap.get(playerName) ?? {}) }; delete t.mobility; return t })(),
      completedBingoItems,
      isComplete: allBingoDone && exerciseMet,
    }
  })

  // Sort: completed first, then by exercise count desc, then alphabetically
  participants.sort((a, b) => {
    if (a.isComplete !== b.isComplete) return a.isComplete ? -1 : 1
    if (a.exerciseCount !== b.exerciseCount) return b.exerciseCount - a.exerciseCount
    return a.playerName.localeCompare(b.playerName)
  })

  // Build team progress for group mode
  let teamProgress: TeamProgress[] | undefined
  if (challenge.challengeMode === 'group' && challenge.teams) {
    teamProgress = challenge.teams.map(team => {
      const teamPhotos = photos.filter(p => team.members.includes(p.playerName.toLowerCase()))
      const completedBingoItems = Array.from(new Set(teamPhotos.map(p => p.bingoItem)))
      const memberProgress = participants.filter(p => team.members.includes(p.playerName.toLowerCase()))

      // Team complete: all bingo items done AND every member met exercise requirements
      const allBingoDone = challenge.bingoItems.every(item => completedBingoItems.includes(item))
      const allMembersExerciseMet = team.members.every(memberName => {
        const mp = participants.find(p => p.playerName === memberName)
        if (!mp) return false
        if (challenge.exerciseRequirements) {
          const playerTypes = mp.exerciseTypeCounts ?? {}
          return Object.entries(challenge.exerciseRequirements).every(
            ([type, required]) => (playerTypes[type] ?? 0) >= (required as number)
          )
        }
        return mp.exerciseCount >= challenge.exerciseMinimum
      })

      return {
        team,
        photos: teamPhotos,
        completedBingoItems,
        memberProgress,
        isComplete: allBingoDone && allMembersExerciseMet,
      }
    })

    // Sort: complete teams first
    teamProgress.sort((a, b) => {
      if (a.isComplete !== b.isComplete) return a.isComplete ? -1 : 1
      return a.team.name.localeCompare(b.team.name)
    })
  }

  return { challenge, participants, teamProgress }
}

export async function getChallengeLeaderboard(): Promise<ChallengeLeaderboardEntry[]> {
  const sql = getDb()

  // Get all challenges
  const challenges = await sql`SELECT * FROM weekly_challenges`

  if (challenges.length === 0) {
    await sql.end()
    return []
  }

  // Get all photos grouped by challenge
  const allPhotos = await sql`SELECT * FROM challenge_photos`

  // Get exercise counts per player per week
  const exerciseRows = await sql`
    SELECT player_name, week_key, SUM(item_count)::int AS exercise_count
    FROM meals
    GROUP BY player_name, week_key
  `

  await sql.end()

  // Build exercise map: weekKey -> playerName -> count
  const exerciseMap = new Map<string, Map<string, number>>()
  for (const row of exerciseRows) {
    const wk = row.week_key as string
    const pn = row.player_name as string
    if (!exerciseMap.has(wk)) exerciseMap.set(wk, new Map())
    exerciseMap.get(wk)!.set(pn, row.exercise_count as number)
  }

  // For each challenge, determine which players completed it
  const completionCount = new Map<string, number>()

  for (const ch of challenges) {
    const challenge = rowToChallenge(ch)
    const challengePhotos = allPhotos.filter((p: any) => p.challenge_id === challenge.id).map(rowToChallengePhoto)
    const weekExercise = exerciseMap.get(challenge.weekKey) ?? new Map()

    // Find all players who have any involvement
    const playerSet = new Set<string>()
    for (const p of challengePhotos) playerSet.add(p.playerName)
    Array.from(weekExercise.keys()).forEach(name => playerSet.add(name))

    Array.from(playerSet).forEach(playerName => {
      const playerPhotos = challengePhotos.filter(p => p.playerName === playerName)
      const completedItems = playerPhotos.map(p => p.bingoItem)
      const allBingoDone = challenge.bingoItems.every(item => completedItems.includes(item))
      const exerciseMet = (weekExercise.get(playerName) ?? 0) >= challenge.exerciseMinimum

      if (allBingoDone && exerciseMet) {
        completionCount.set(playerName, (completionCount.get(playerName) ?? 0) + 1)
      }
    })
  }

  const entries: ChallengeLeaderboardEntry[] = Array.from(completionCount.entries())
    .map(([playerName, completedChallenges]) => ({ playerName, completedChallenges }))
    .sort((a, b) => b.completedChallenges - a.completedChallenges || a.playerName.localeCompare(b.playerName))

  return entries
}

export async function getGroupChallengeLeaderboard(): Promise<GroupLeaderboardEntry[]> {
  const sql = getDb()

  // Get only group-mode challenges
  const challenges = await sql`SELECT * FROM weekly_challenges WHERE challenge_mode = 'group'`

  if (challenges.length === 0) {
    await sql.end()
    return []
  }

  const challengeIds = challenges.map(c => c.id)
  const allPhotos = await sql`SELECT * FROM challenge_photos WHERE challenge_id = ANY(${challengeIds})`

  // Get exercise counts per player per week + per-type
  const exerciseRows = await sql`
    SELECT player_name, week_key, COUNT(*)::int AS exercise_count
    FROM meals
    GROUP BY player_name, week_key
  `
  const typeRows = await sql`
    SELECT player_name, week_key, exercise_type, COUNT(*)::int AS type_count
    FROM meals WHERE exercise_type IS NOT NULL
    GROUP BY player_name, week_key, exercise_type
  `

  await sql.end()

  // Build exercise maps
  const exerciseMap = new Map<string, Map<string, number>>()
  for (const row of exerciseRows) {
    const wk = row.week_key as string
    const pn = row.player_name as string
    if (!exerciseMap.has(wk)) exerciseMap.set(wk, new Map())
    exerciseMap.get(wk)!.set(pn, row.exercise_count as number)
  }
  const typeCountMap = new Map<string, Map<string, Record<string, number>>>()
  for (const row of typeRows) {
    const wk = row.week_key as string
    const pn = row.player_name as string
    if (!typeCountMap.has(wk)) typeCountMap.set(wk, new Map())
    const weekMap = typeCountMap.get(wk)!
    if (!weekMap.has(pn)) weekMap.set(pn, {})
    weekMap.get(pn)![row.exercise_type as string] = row.type_count as number
  }

  const teamCompletionCount = new Map<string, number>()

  for (const ch of challenges) {
    const challenge = rowToChallenge(ch)
    if (!challenge.teams) continue
    const challengePhotos = allPhotos.filter((p: any) => p.challenge_id === challenge.id).map(rowToChallengePhoto)
    const weekExercise = exerciseMap.get(challenge.weekKey) ?? new Map()
    const weekTypes = typeCountMap.get(challenge.weekKey) ?? new Map()

    for (const team of challenge.teams) {
      const teamPhotos = challengePhotos.filter(p => team.members.includes(p.playerName.toLowerCase()))
      const completedBingoItems = Array.from(new Set(teamPhotos.map(p => p.bingoItem)))
      const allBingoDone = challenge.bingoItems.every(item => completedBingoItems.includes(item))

      const allMembersExerciseMet = team.members.every(memberName => {
        if (challenge.exerciseRequirements) {
          const playerTypes = weekTypes.get(memberName) ?? {}
          return Object.entries(challenge.exerciseRequirements).every(
            ([type, required]) => (playerTypes[type] ?? 0) >= (required as number)
          )
        }
        return (weekExercise.get(memberName) ?? 0) >= challenge.exerciseMinimum
      })

      if (allBingoDone && allMembersExerciseMet) {
        teamCompletionCount.set(team.name, (teamCompletionCount.get(team.name) ?? 0) + 1)
      }
    }
  }

  return Array.from(teamCompletionCount.entries())
    .map(([teamName, completedChallenges]) => ({ teamName, completedChallenges }))
    .sort((a, b) => b.completedChallenges - a.completedChallenges || a.teamName.localeCompare(b.teamName))
}

// ── App Config ─────────────────────────────────────────────────

export async function getAppConfig(key: string): Promise<string | null> {
  const sql = getDb()
  const rows = await sql`SELECT value FROM app_config WHERE key = ${key}`
  await sql.end()
  return rows.length > 0 ? (rows[0].value as string) : null
}

export async function setAppConfig(key: string, value: string): Promise<void> {
  const sql = getDb()
  await sql`
    INSERT INTO app_config (key, value) VALUES (${key}, ${value})
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `
  await sql.end()
}

export async function getExerciseDaysByPlayer(
  startDate: string,
  endDate: string
): Promise<Record<string, string[]>> {
  const sql = getDb()
  const rows = await sql`
    SELECT DISTINCT player_name, created_at::date AS exercise_date
    FROM meals
    WHERE created_at::date >= ${startDate}::date AND created_at::date <= ${endDate}::date
  `
  await sql.end()

  const result: Record<string, Set<string>> = {}
  for (const row of rows) {
    const name = row.player_name as string
    const dateStr = (row.exercise_date as Date).toISOString().split('T')[0]
    if (!result[name]) result[name] = new Set()
    result[name].add(dateStr)
  }

  // Convert sets to arrays
  const out: Record<string, string[]> = {}
  for (const [name, dates] of Object.entries(result)) {
    out[name] = Array.from(dates).sort()
  }
  return out
}
