import { NextResponse } from 'next/server'
import { joinBattle, ensureStarterCards, ensureStarterItem } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const playerName = (body.playerName || '').toLowerCase()
  if (!playerName) return NextResponse.json({ error: 'Missing playerName' }, { status: 400 })

  try {
    await ensureStarterCards(playerName)
    await ensureStarterItem(playerName)
    const battle = await joinBattle(id, playerName)
    return NextResponse.json(battle)
  } catch {
    return NextResponse.json({ error: 'Battle not available' }, { status: 400 })
  }
}
