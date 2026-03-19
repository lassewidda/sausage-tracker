import postgres from 'postgres'
import type { Meal, WeekGroup, Leaderboard, LeaderboardEntry, SausageChainEntry, WeeklySummary, HeroCard, Battle, BattleDeckCard, BattleTurn, BattleStats, BattleState } from '@/types'

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
        SUM(sausage_count)::int AS total_sausages,
        COALESCE(SUM(estimated_grams), 0)::int AS total_grams,
        MAX(sausage_count)::int AS max_in_one_meal,
        COUNT(DISTINCT week_key)::int AS active_weeks
      FROM meals WHERE player_name = ${playerName}
    `,
    sql`
      SELECT ai_description, sausage_count, estimated_grams
      FROM meals WHERE player_name = ${playerName}
      ORDER BY created_at DESC LIMIT 10
    `,
    sql`
      SELECT week_key, SUM(sausage_count)::int AS week_total
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
    totalSausages: (stats.total_sausages as number) || 0,
    totalGrams: (stats.total_grams as number) || 0,
    maxInOneMeal: (stats.max_in_one_meal as number) || 0,
    activeWeeks: (stats.active_weeks as number) || 0,
    chainLength: chain,
    recentMeals: mealRows.map(r => ({
      description: r.ai_description as string | null,
      sausageCount: r.sausage_count as number,
    })),
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
    status: row.status,
    challengerReady: row.challenger_ready,
    opponentReady: row.opponent_ready,
    currentTurn: row.current_turn,
    turnPlayer: row.turn_player,
    winner: row.winner,
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

export async function createBattle(challenger: string): Promise<Battle> {
  const sql = getDb()
  // Clean up stale waiting battles older than 1 hour
  await sql`DELETE FROM battles WHERE status = 'waiting' AND created_at < NOW() - INTERVAL '1 hour'`
  const rows = await sql`
    INSERT INTO battles (challenger) VALUES (${challenger}) RETURNING *
  `
  await sql.end()
  return rowToBattle(rows[0])
}

export async function getOpenBattles(): Promise<Battle[]> {
  const sql = getDb()
  // Clean up stale
  await sql`DELETE FROM battles WHERE status = 'waiting' AND created_at < NOW() - INTERVAL '1 hour'`
  const rows = await sql`
    SELECT * FROM battles WHERE status = 'waiting' ORDER BY created_at DESC
  `
  await sql.end()
  return rows.map(rowToBattle)
}

export async function getPlayerBattles(playerName: string): Promise<Battle[]> {
  const sql = getDb()
  const rows = await sql`
    SELECT * FROM battles
    WHERE (challenger = ${playerName} OR opponent = ${playerName})
      AND status IN ('selecting', 'battling')
    ORDER BY updated_at DESC
  `
  await sql.end()
  return rows.map(rowToBattle)
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
  const [battleRows, deckRows, turnRows] = await Promise.all([
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
  }
}

export async function submitDeck(battleId: string, playerName: string, cardIds: string[]): Promise<void> {
  const sql = getDb()
  // Verify cards belong to this player
  const cards = await sql`
    SELECT id, hp FROM hero_cards WHERE id = ANY(${cardIds}) AND player_name = ${playerName}
  `
  if (cards.length !== cardIds.length) {
    await sql.end()
    throw new Error('Invalid cards')
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
  moveIndex: number
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

  // PP validation: check if the chosen move still has uses left
  const chosenMove = attackerCard.specialMoves[moveIndex] ?? attackerCard.specialMoves[0]
  const { maxPp, name: moveName } = parseMoveDamage(chosenMove)
  const usedCountRows = await sql`
    SELECT COUNT(*)::int AS used FROM battle_turns
    WHERE battle_id = ${battleId} AND attacker_card_id = ${attackerDeck.card_id} AND move_used = ${moveName}
  `
  const usedCount = (usedCountRows[0]?.used as number) ?? 0

  let result
  if (usedCount >= maxPp) {
    // Struggle: all PP depleted, fixed 10 damage, no type advantage
    result = { damage: 10, multiplier: 1.0, moveName: 'Struggle', baseDamage: 10 }
  } else {
    result = calculateDamage(attackerCard, defenderCard, moveIndex)
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
      move_used, move_damage, type_multiplier, damage_dealt, defender_hp_after, is_knockout)
    VALUES (${battleId}, ${battle.currentTurn}, ${playerName}, ${attackerDeck.card_id},
      ${defenderDeck.card_id}, ${result.moveName}, ${result.baseDamage}, ${result.multiplier},
      ${result.damage}, ${newHp}, ${isKo})
    RETURNING *
  `

  // If KO, activate next card
  if (isKo) {
    const nextCard = await sql`
      SELECT id FROM battle_decks
      WHERE battle_id = ${battleId} AND player_name = ${defenderName}
        AND is_knocked_out = false AND is_active = false
      ORDER BY position LIMIT 1
    `
    if (nextCard.length > 0) {
      await sql`UPDATE battle_decks SET is_active = true WHERE id = ${nextCard[0].id}`
    }
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
    // Update stats
    const loser = winner === battle.challenger ? battle.opponent! : battle.challenger
    await updateBattleStatsInternal(sql, winner, loser)
  } else {
    // Determine next turn player
    let nextTurnPlayer: string
    if (isKo) {
      // After KO, the attacker gets another turn
      nextTurnPlayer = playerName
    } else {
      nextTurnPlayer = defenderName!
    }

    // If KO'd and new card activated, recalculate speed order
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

  const { getStarterCards } = await import('./battleEngine')
  const starters = getStarterCards()
  for (const s of starters) {
    await sql`
      INSERT INTO hero_cards (player_name, hero_title, hero_type, hp, attack, defense, speed, special_moves, weakness, catchphrase, flavor_text, week_key)
      VALUES (${playerName}, ${s.heroTitle}, ${s.heroType}, ${s.hp}, ${s.attack}, ${s.defense}, ${s.speed}, ${s.specialMoves}, ${s.weakness}, ${s.catchphrase}, ${s.flavorText}, ${s.weekKey})
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
    sausageCount: row.sausage_count,
    aiSuggestedCount: row.ai_suggested_count,
    aiDescription: row.ai_description,
    estimatedGrams: row.estimated_grams ?? null,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    weekKey: row.week_key,
    playerName: row.player_name ?? 'Anonymous',
  }
}
