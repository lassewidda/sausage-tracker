import { NextRequest, NextResponse } from 'next/server'
import { getAllChallenges, deleteChallenge } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const challenges = await getAllChallenges()
  return NextResponse.json(challenges)
}

export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const { weekKey } = body

  if (!weekKey) {
    return NextResponse.json({ error: 'weekKey is required' }, { status: 400 })
  }

  const deleted = await deleteChallenge(weekKey)

  if (!deleted) {
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
