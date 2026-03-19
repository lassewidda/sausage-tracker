import { NextResponse } from 'next/server'
import { getPlayerInventory } from '@/lib/db'
import { getItemDefinition } from '@/lib/itemCatalog'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const playerName = searchParams.get('playerName')?.toLowerCase()

  if (!playerName) {
    return NextResponse.json({ error: 'playerName required' }, { status: 400 })
  }

  const items = await getPlayerInventory(playerName)
  const enriched = items.map(item => ({
    ...item,
    definition: getItemDefinition(item.itemKey),
  }))

  return NextResponse.json(enriched)
}
