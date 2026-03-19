import { NextResponse } from 'next/server'
import { submitDeck, markPlayerReady } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const playerName = (body.playerName || '').toLowerCase()
  const cardIds = body.cardIds

  if (!playerName || !Array.isArray(cardIds) || cardIds.length !== 3) {
    return NextResponse.json({ error: 'Must select exactly 3 cards' }, { status: 400 })
  }

  try {
    await submitDeck(id, playerName, cardIds)
    const battle = await markPlayerReady(id, playerName)
    return NextResponse.json(battle)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
