import { NextResponse } from 'next/server'
import { createBattle, getOpenBattles, getPlayerBattles, ensureStarterCards, ensureStarterItem } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const playerName = (searchParams.get('playerName') || '').toLowerCase()

  const openBattles = await getOpenBattles()

  let activeBattles: Awaited<ReturnType<typeof getPlayerBattles>> = []
  if (playerName) {
    activeBattles = await getPlayerBattles(playerName)
  }

  return NextResponse.json({ openBattles, activeBattles })
}

export async function POST(request: Request) {
  const body = await request.json()
  const playerName = (body.playerName || '').toLowerCase()
  if (!playerName) return NextResponse.json({ error: 'Missing playerName' }, { status: 400 })

  await ensureStarterCards(playerName)
  await ensureStarterItem(playerName)
  const battle = await createBattle(playerName)
  return NextResponse.json(battle)
}
