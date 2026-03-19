import { NextResponse } from 'next/server'
import { getPlayerInventory, addPlayerItem } from '@/lib/db'
import { ITEM_CATALOG } from '@/lib/itemCatalog'
import postgres from 'postgres'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, ssl: { rejectUnauthorized: false } })

  // Get all distinct players
  const players = await sql`
    SELECT DISTINCT player_name FROM meals WHERE player_name != 'Anonymous'
    UNION
    SELECT DISTINCT player_name FROM hero_cards
  `
  await sql.end()

  const allKeys = Object.keys(ITEM_CATALOG)
  const results: string[] = []

  for (const row of players) {
    const name = row.player_name as string
    const existing = await getPlayerInventory(name)
    if (existing.length > 0) {
      results.push(`${name}: already has ${existing.length} items`)
      continue
    }
    const randomKey = allKeys[Math.floor(Math.random() * allKeys.length)]
    await addPlayerItem(name, randomKey)
    results.push(`${name}: gave ${ITEM_CATALOG[randomKey].name} (${ITEM_CATALOG[randomKey].rarity})`)
  }

  return NextResponse.json({ results })
}
