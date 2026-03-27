import { NextRequest, NextResponse } from 'next/server'
import { getChallengeView, upsertChallenge, getWeekKey } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const weekKey = req.nextUrl.searchParams.get('weekKey') || getWeekKey()
  const view = await getChallengeView(weekKey)
  return NextResponse.json(view)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { weekKey, bingoItems, exerciseMinimum } = body

  if (!weekKey || !Array.isArray(bingoItems) || bingoItems.length === 0) {
    return NextResponse.json({ error: 'weekKey and bingoItems are required' }, { status: 400 })
  }

  const challenge = await upsertChallenge(weekKey, bingoItems, exerciseMinimum ?? 3)
  return NextResponse.json(challenge)
}
