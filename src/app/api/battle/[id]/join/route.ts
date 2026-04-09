import { NextResponse } from 'next/server'
import { joinBattle, ensureStarterCards, ensureStarterItem, getSlackUserId } from '@/lib/db'
import { sendSlackDM } from '@/lib/slack'

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const playerName = (body.playerName || '').toLowerCase()
  if (!playerName) return NextResponse.json({ error: 'Missing playerName' }, { status: 400 })

  try {
    await ensureStarterCards(playerName)
    await ensureStarterItem(playerName)
    const battle = await joinBattle(id, playerName)

    // Notify the challenger that someone joined (non-blocking)
    try {
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
      const baseUrl = host ? `https://${host}` : ''
      const challengerSlackId = await getSlackUserId(battle.challenger)
      if (challengerSlackId) {
        const battleUrl = `${baseUrl}/battle/${id}`
        sendSlackDM(challengerSlackId, `\uD83C\uDFAE ${playerName} has joined your battle! Time to select your deck. ${battleUrl}`).catch(() => {})
      }
    } catch {
      // Never let notification failures break the join
    }

    return NextResponse.json(battle)
  } catch {
    return NextResponse.json({ error: 'Battle not available' }, { status: 400 })
  }
}
