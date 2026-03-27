import { NextResponse } from 'next/server'
import { getChallengeLeaderboard } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const leaderboard = await getChallengeLeaderboard()
  return NextResponse.json(leaderboard)
}
