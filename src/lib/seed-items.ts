import postgres from 'postgres'
import theme from '@/theme'

async function seedItems() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, idle_timeout: 5, connect_timeout: 30, prepare: false, ssl: { rejectUnauthorized: false } })

  // Get all distinct players
  const players = await sql`
    SELECT DISTINCT player_name FROM meals WHERE player_name != 'Anonymous'
    UNION
    SELECT DISTINCT player_name FROM hero_cards
  `

  const allKeys = Object.keys(theme.itemCatalog)

  for (const row of players) {
    const name = row.player_name as string

    // Check if they already have items
    const existing = await sql`
      SELECT COUNT(*)::int AS count FROM player_items WHERE player_name = ${name}
    `
    if ((existing[0].count as number) > 0) {
      console.log(`${name} already has items, skipping`)
      continue
    }

    const randomKey = allKeys[Math.floor(Math.random() * allKeys.length)]
    await sql`
      INSERT INTO player_items (player_name, item_key) VALUES (${name}, ${randomKey})
    `
    console.log(`Gave ${name} a ${theme.itemCatalog[randomKey].name} (${theme.itemCatalog[randomKey].rarity})`)
  }

  await sql.end()
  console.log('Done!')
}

seedItems().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
