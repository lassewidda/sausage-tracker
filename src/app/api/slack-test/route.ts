import { NextRequest, NextResponse } from 'next/server'
import { getSlackUserId } from '@/lib/db'
import { sendSlackDM } from '@/lib/slack'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { playerName } = await req.json()

  if (!playerName) {
    return NextResponse.json({ error: 'playerName required' }, { status: 400 })
  }

  const slackId = await getSlackUserId(playerName.toLowerCase())
  if (!slackId) {
    return NextResponse.json({ error: 'No Slack ID set for this player' }, { status: 404 })
  }

  const success = await sendSlackDM(
    slackId,
    `🍄 PowerUp test notification! If you see this, Slack notifications are working for ${playerName.toUpperCase()}. 💪`
  )

  if (success) {
    return NextResponse.json({ ok: true })
  } else {
    return NextResponse.json({ error: 'Failed to send Slack message. Check your Slack ID and bot permissions.' }, { status: 500 })
  }
}
