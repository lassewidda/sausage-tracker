import { NextResponse } from 'next/server'
import { getPlayerBalance } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const playerName = (searchParams.get('playerName') || '').toLowerCase()
  if (!playerName) return NextResponse.json({ error: 'Missing playerName' }, { status: 400 })

  const balance = await getPlayerBalance(playerName)
  return NextResponse.json({ balance })
}
