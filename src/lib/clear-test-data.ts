import postgres from 'postgres'

async function run() {
  const sql = postgres(process.env.DATABASE_URL!, { ssl: { rejectUnauthorized: false } })

  console.log('Clearing all test data except player "lars"...\n')

  // Order matters due to foreign key constraints
  const deleted = {
    battle_effects: (await sql`DELETE FROM battle_effects RETURNING id`).length,
    battle_taunts: (await sql`DELETE FROM battle_taunts RETURNING id`).length,
    battle_turns: (await sql`DELETE FROM battle_turns RETURNING id`).length,
    battle_decks: (await sql`DELETE FROM battle_decks RETURNING id`).length,
    battles: (await sql`DELETE FROM battles RETURNING id`).length,
    battle_stats: (await sql`DELETE FROM battle_stats RETURNING player_name`).length,
    challenge_photos: (await sql`DELETE FROM challenge_photos WHERE player_name != 'lars' RETURNING id`).length,
    weekly_summaries: (await sql`DELETE FROM weekly_summaries RETURNING id`).length,
    shop_transactions: (await sql`DELETE FROM shop_transactions WHERE player_name != 'lars' RETURNING id`).length,
    player_items: (await sql`DELETE FROM player_items WHERE player_name != 'lars' RETURNING id`).length,
    player_wallets: (await sql`DELETE FROM player_wallets WHERE player_name != 'lars' RETURNING player_name`).length,
    hero_cards: (await sql`DELETE FROM hero_cards WHERE player_name != 'lars' RETURNING id`).length,
    meals_others: (await sql`DELETE FROM meals WHERE player_name != 'lars' RETURNING id`).length,
    player_goals: (await sql`DELETE FROM player_goals WHERE player_name != 'lars' RETURNING player_name`).length,
  }

  for (const [table, count] of Object.entries(deleted)) {
    console.log(`  ${table}: ${count} rows deleted`)
  }

  // Check what's left
  const remaining = await sql`SELECT COUNT(*)::int AS c FROM meals WHERE player_name = 'lars'`
  console.log(`\nRemaining: ${remaining[0].c} meals for lars`)

  const remainingCards = await sql`SELECT COUNT(*)::int AS c FROM hero_cards WHERE player_name = 'lars'`
  console.log(`Remaining: ${remainingCards[0].c} hero cards for lars`)

  await sql.end()
  console.log('\nDone!')
}

run().catch(err => { console.error('Failed:', err); process.exit(1) })
