import { NextResponse } from 'next/server'
import { executeTurn } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const playerName = (body.playerName || '').toLowerCase()
  const moveIndex = body.moveIndex ?? null
  const itemId = body.itemId ?? undefined

  if (!playerName) {
    return NextResponse.json({ error: 'Missing playerName' }, { status: 400 })
  }

  // Either moveIndex or itemId must be provided
  if (moveIndex === null && !itemId) {
    return NextResponse.json({ error: 'Missing moveIndex or itemId' }, { status: 400 })
  }

  try {
    const turn = await executeTurn(id, playerName, moveIndex, itemId)
    return NextResponse.json(turn)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
