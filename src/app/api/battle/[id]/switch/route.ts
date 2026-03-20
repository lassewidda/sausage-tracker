import { NextResponse } from 'next/server'
import { switchCard } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const playerName = (body.playerName || '').toLowerCase()
  const deckCardId = body.deckCardId

  if (!playerName || !deckCardId) {
    return NextResponse.json({ error: 'Missing playerName or deckCardId' }, { status: 400 })
  }

  try {
    await switchCard(id, playerName, deckCardId)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
