import { NextResponse } from 'next/server'
import { sendTaunt } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const playerName = (body.playerName || '').toLowerCase()
  const message = (body.message || '').trim()

  if (!playerName || !message) {
    return NextResponse.json({ error: 'Missing playerName or message' }, { status: 400 })
  }

  try {
    const taunt = await sendTaunt(id, playerName, message)
    return NextResponse.json(taunt)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 429 })
  }
}
