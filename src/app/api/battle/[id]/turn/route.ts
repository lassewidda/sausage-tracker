import { NextResponse } from 'next/server'
import { executeTurn, getBattleState, getSlackUserId } from '@/lib/db'
import { sendSlackDM } from '@/lib/slack'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const playerName = (body.playerName || '').toLowerCase()
  const moveIndex = body.moveIndex ?? null
  const itemId = body.itemId ?? undefined

  if (!playerName) {
    return NextResponse.json({ error: 'Missing playerName' }, { status: 400 })
  }

  // Either moveIndex or itemId must be provided
  if (moveIndex === null && !itemId) {
    return NextResponse.json({ error: 'Missing moveIndex or itemId' }, { status: 400 })
  }

  try {
    const turn = await executeTurn(id, playerName, moveIndex, itemId)

    // Send Slack DM to the next player (non-blocking)
    try {
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
      const baseUrl = host ? `https://${host}` : ''
      const battleState = await getBattleState(id)
      const nextPlayer = battleState.battle.turnPlayer
      if (nextPlayer && nextPlayer !== playerName && battleState.battle.status === 'battling') {
        const slackUserId = await getSlackUserId(nextPlayer)
        if (slackUserId) {
          const battleUrl = `${baseUrl}/battle/${id}`
          sendSlackDM(slackUserId, `\u2694\uFE0F It's your turn in PowerUp! ${playerName} just attacked. Go to ${battleUrl}`).catch(() => {})
        }
      }
    } catch {
      // Never let notification failures break the turn
    }

    return NextResponse.json(turn)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
