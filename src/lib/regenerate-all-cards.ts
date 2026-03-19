import postgres from 'postgres'
import { getWeekKey } from './db'
import { generateHeroCard } from './claude'

async function regenerateAll() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: { rejectUnauthorized: false } })

  console.log('=== Clearing battle data and hero cards ===')
  await sql`DELETE FROM battle_turns`
  await sql`DELETE FROM battle_decks`
  await sql`DELETE FROM battles`
  await sql`DELETE FROM battle_stats`
  console.log('Cleared all battle data')
  const deleted = await sql`DELETE FROM hero_cards RETURNING player_name, week_key, hero_title`
  console.log(`Deleted ${deleted.length} cards`)

  // Find all player-week combinations from meals
  const playerWeeks = await sql`
    SELECT DISTINCT player_name, week_key
    FROM meals
    ORDER BY player_name, week_key
  `
  console.log(`\nFound ${playerWeeks.length} player-week combinations to generate`)

  for (const pw of playerWeeks) {
    const playerName = pw.player_name as string
    const weekKey = pw.week_key as string

    console.log(`\n  ${playerName} / ${weekKey} — generating...`)

    // Get cumulative stats up to that week
    const statsRows = await sql`
      SELECT
        COUNT(*)::int AS meal_count,
        SUM(sausage_count)::int AS total_sausages,
        COALESCE(SUM(estimated_grams), 0)::int AS total_grams,
        MAX(sausage_count)::int AS max_in_one_meal,
        COUNT(DISTINCT week_key)::int AS active_weeks
      FROM meals
      WHERE player_name = ${playerName} AND week_key <= ${weekKey}
    `
    const stats = statsRows[0]

    const recentRows = await sql`
      SELECT ai_description, sausage_count
      FROM meals
      WHERE player_name = ${playerName} AND week_key <= ${weekKey}
      ORDER BY created_at DESC LIMIT 10
    `

    try {
      const generated = await generateHeroCard({
        playerName,
        totalSausages: (stats.total_sausages as number) || 0,
        totalGrams: (stats.total_grams as number) || 0,
        mealCount: (stats.meal_count as number) || 0,
        maxInOneMeal: (stats.max_in_one_meal as number) || 0,
        activeWeeks: (stats.active_weeks as number) || 0,
        chainLength: 0,
        recentMeals: recentRows.map(r => ({
          description: r.ai_description as string | null,
          sausageCount: r.sausage_count as number,
        })),
      })

      await sql`
        INSERT INTO hero_cards (player_name, hero_title, hero_type, hp, attack, defense, speed, special_moves, weakness, catchphrase, flavor_text, week_key)
        VALUES (
          ${playerName},
          ${generated.heroTitle || 'The Sausage Warrior'},
          ${generated.heroType || 'BRATWURST/GRILLED'},
          ${generated.hp || 80},
          ${generated.attack || 30},
          ${generated.defense || 30},
          ${generated.speed || 30},
          ${Array.isArray(generated.specialMoves) ? generated.specialMoves : ['Sausage Slam (40/3)', 'Mustard Blast (30/6)', 'Link Slap (20/12)']},
          ${generated.weakness || 'Vegetarian restaurants'},
          ${generated.catchphrase || 'Fear the sausage!'},
          ${generated.flavorText || 'A mighty warrior.'},
          ${weekKey}
        )
      `
      console.log(`    ✓ ${generated.heroTitle} [${generated.heroType}] HP:${generated.hp} ATK:${generated.attack} DEF:${generated.defense} SPD:${generated.speed}`)
      console.log(`      Moves: ${(generated.specialMoves || []).join(' | ')}`)
    } catch (err) {
      console.error(`    ✗ Failed:`, err)
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 600))
  }

  // Insert starter cards for all players
  const { getStarterCards } = await import('./battleEngine')
  const starters = getStarterCards()
  const allPlayers = Array.from(new Set(playerWeeks.map(pw => pw.player_name as string)))
  console.log(`\n=== Inserting starter cards for ${allPlayers.length} players ===`)
  for (const player of allPlayers) {
    for (const s of starters) {
      await sql`
        INSERT INTO hero_cards (player_name, hero_title, hero_type, hp, attack, defense, speed, special_moves, weakness, catchphrase, flavor_text, week_key)
        VALUES (${player}, ${s.heroTitle}, ${s.heroType}, ${s.hp}, ${s.attack}, ${s.defense}, ${s.speed}, ${s.specialMoves}, ${s.weakness}, ${s.catchphrase}, ${s.flavorText}, ${s.weekKey})
        ON CONFLICT (player_name, week_key) DO NOTHING
      `
    }
    console.log(`  ${player}: 5 starter cards inserted`)
  }

  // Summary
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
  console.log('\nDone!')
}

regenerateAll().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
