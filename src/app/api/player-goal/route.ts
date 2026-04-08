import { NextRequest, NextResponse } from 'next/server'
import { getPlayerGoal, upsertPlayerGoal } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const playerName = req.nextUrl.searchParams.get('playerName')
    if (!playerName) {
      return NextResponse.json({ error: 'playerName required' }, { status: 400 })
    }
    const goal = await getPlayerGoal(playerName.toLowerCase())
    return NextResponse.json(goal ? { ...goal, slackUserId: goal.slackUserId || null } : null)
  } catch (error) {
    console.error('GET /api/player-goal error:', error)
    return NextResponse.json({ error: 'Failed to fetch goal', details: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const { playerName, cardioTarget, strengthTarget, slackUserId } = body

    if (!playerName || typeof cardioTarget !== 'number' || typeof strengthTarget !== 'number') {
      return NextResponse.json({ error: 'playerName, cardioTarget, and strengthTarget required' }, { status: 400 })
    }

    if (cardioTarget < 0 || strengthTarget < 0) {
      return NextResponse.json({ error: 'Targets must be non-negative' }, { status: 400 })
    }

    if (cardioTarget + strengthTarget < 3) {
      return NextResponse.json({ error: 'Minimum 3 activities per week required (any mix of cardio + strength)' }, { status: 400 })
    }

    const goal = await upsertPlayerGoal(
      playerName.toLowerCase(),
      cardioTarget,
      strengthTarget,
      typeof slackUserId === 'string' ? slackUserId : undefined,
    )
    return NextResponse.json(goal)
  } catch (error) {
    console.error('POST /api/player-goal error:', error)
    return NextResponse.json({ error: 'Failed to save goal', details: String(error) }, { status: 500 })
  }
}
