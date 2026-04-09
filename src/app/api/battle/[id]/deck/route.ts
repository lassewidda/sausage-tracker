import { NextResponse } from 'next/server'
import { submitDeck, markPlayerReady } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const playerName = (body.playerName || '').toLowerCase()
  const cardIds = body.cardIds

  if (!playerName || !Array.isArray(cardIds) || cardIds.length !== 4) {
    return NextResponse.json({ error: 'Must select exactly 4 cards (including 1 starter)' }, { status: 400 })
  }

  try {
    console.log(`[deck] battleId=${id} player=${playerName} cards=${cardIds.join(',')}`)
    await submitDeck(id, playerName, cardIds)
    const battle = await markPlayerReady(id, playerName)
    return NextResponse.json(battle)
  } catch (e) {
    console.error(`[deck] FAILED battleId=${id} player=${playerName}:`, (e as Error).message)
    return NextResponse.json({ error: (e as Error).message, player: playerName, battleId: id }, { status: 400 })
  }
}
