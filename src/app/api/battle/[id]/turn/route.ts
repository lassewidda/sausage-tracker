import { NextResponse } from 'next/server'
import { executeTurn } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const playerName = (body.playerName || '').toLowerCase()
  const moveIndex = body.moveIndex

  if (!playerName || moveIndex === undefined) {
    return NextResponse.json({ error: 'Missing playerName or moveIndex' }, { status: 400 })
  }

  try {
    const turn = await executeTurn(id, playerName, moveIndex)
    return NextResponse.json(turn)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
