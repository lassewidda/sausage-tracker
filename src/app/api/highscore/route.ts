import { NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/db'

export async function GET(): Promise<NextResponse> {
  try {
    const leaderboard = await getLeaderboard()
    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('GET /api/highscore error:', error)
    return NextResponse.json({ error: 'Failed to fetch highscore', details: String(error) }, { status: 500 })
  }
}
