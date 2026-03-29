import { NextResponse } from 'next/server'
import { getChallengeLeaderboard, getGroupChallengeLeaderboard } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [individual, groups] = await Promise.all([
    getChallengeLeaderboard(),
    getGroupChallengeLeaderboard(),
  ])
  return NextResponse.json({ individual, groups })
}
