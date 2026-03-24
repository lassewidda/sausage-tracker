import postgres from 'postgres'
import { getWeekKey } from './db'
import { generateHeroCard } from './claude'

async function backfill() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: { rejectUnauthorized: false } })

  console.log('=== Backfilling hero cards ===')

  // 1. Fix existing cards: set week_key from created_at
  const existingCards = await sql`SELECT id, player_name, created_at, week_key FROM hero_cards WHERE week_key = '' OR week_key IS NULL`
  for (const card of existingCards) {
    const weekKey = getWeekKey(new Date(card.created_at))
    console.log(`Fixing ${card.player_name}: setting week_key to ${weekKey}`)
    await sql`UPDATE hero_cards SET week_key = ${weekKey} WHERE id = ${card.id}`
  }

  // 2. Find all weeks where each player logged meals
  const playerWeeks = await sql`
    SELECT DISTINCT player_name, week_key
    FROM meals
    WHERE player_name IN ('jerry', 'lars', 'sebbe', 'Jerry', 'Lars', 'Sebbe')
    ORDER BY player_name, week_key
  `
  console.log(`\nFound ${playerWeeks.length} player-week combinations with meals`)

  // 3. Check which weeks already have cards
  const existingCombos = await sql`
    SELECT player_name, week_key FROM hero_cards
  `
  const existingSet = new Set(existingCombos.map(r => `${r.player_name}::${r.week_key}`))

  // 4. Generate missing cards
  for (const pw of playerWeeks) {
    const playerName = pw.player_name as string
    const weekKey = pw.week_key as string

    if (existingSet.has(`${playerName}::${weekKey}`)) {
      console.log(`  ${playerName} / ${weekKey} — already has card, skipping`)
      continue
    }

    console.log(`  ${playerName} / ${weekKey} — generating card...`)

    // Get stats up to and including that week
    const statsRows = await sql`
      SELECT
        COUNT(*)::int AS meal_count,
        SUM(item_count)::int AS total_items,
        COALESCE(SUM(estimated_grams), 0)::int AS total_grams,
        MAX(item_count)::int AS max_in_one_meal,
        COUNT(DISTINCT week_key)::int AS active_weeks
      FROM meals
      WHERE player_name = ${playerName} AND week_key <= ${weekKey}
    `
    const stats = statsRows[0]

    const recentRows = await sql`
      SELECT ai_description, item_count
      FROM meals
      WHERE player_name = ${playerName} AND week_key <= ${weekKey}
      ORDER BY created_at DESC LIMIT 10
    `

    try {
      const generated = await generateHeroCard({
        playerName,
        totalItems: (stats.total_items as number) || 0,
        totalGrams: (stats.total_grams as number) || 0,
        mealCount: (stats.meal_count as number) || 0,
        maxInOneMeal: (stats.max_in_one_meal as number) || 0,
        activeWeeks: (stats.active_weeks as number) || 0,
        chainLength: 0,
        recentMeals: recentRows.map(r => ({
          description: r.ai_description as string | null,
          itemCount: r.item_count as number,
        })),
      })

      await sql`
        INSERT INTO hero_cards (player_name, hero_title, hero_type, hp, attack, defense, speed, special_moves, weakness, catchphrase, flavor_text, week_key)
        VALUES (
          ${playerName},
          ${generated.heroTitle || 'The Sausage Warrior'},
          ${generated.heroType || 'FIRE/MEAT'},
          ${generated.hp || 100},
          ${generated.attack || 50},
          ${generated.defense || 50},
          ${generated.speed || 50},
          ${Array.isArray(generated.specialMoves) ? generated.specialMoves : ['Sausage Slam (40)', 'Mustard Blast (30)', 'Link Storm (50)']},
          ${generated.weakness || 'Vegetarian restaurants'},
          ${generated.catchphrase || 'Fear the sausage!'},
          ${generated.flavorText || 'A mighty warrior.'},
          ${weekKey}
        )
        ON CONFLICT (player_name, week_key) DO NOTHING
      `
      console.log(`    ✓ Created: ${generated.heroTitle}`)
    } catch (err) {
      console.error(`    ✗ Failed for ${playerName}/${weekKey}:`, err)
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500))
  }

  // 5. Summary
  const finalCards = await sql`
    SELECT player_name, COUNT(*)::int AS card_count
    FROM hero_cards
    GROUP BY player_name
    ORDER BY player_name
  `
  console.log('\n=== Final card counts ===')
  for (const r of finalCards) {
    console.log(`  ${r.player_name}: ${r.card_count} cards`)
  }

  await sql.end()
  console.log('\nBackfill complete!')
}

backfill().catch(err => {
  console.error('Backfill failed:', err)
  process.exit(1)
})
