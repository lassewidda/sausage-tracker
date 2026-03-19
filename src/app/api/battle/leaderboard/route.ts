import { NextResponse } from 'next/server'
import { getBattleLeaderboard } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const leaderboard = await getBattleLeaderboard()
  return NextResponse.json(leaderboard)
}
