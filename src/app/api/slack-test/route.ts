import { NextRequest, NextResponse } from 'next/server'
import { getSlackUserId } from '@/lib/db'
import { sendSlackDM } from '@/lib/slack'

const IS_EXERCISE = process.env.NEXT_PUBLIC_THEME === 'exercise'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { playerName, slackUserId } = await req.json()

  if (!playerName) {
    return NextResponse.json({ error: 'playerName required' }, { status: 400 })
  }

  // Use provided slackUserId (for testing before save) or look up from DB
  const slackId = slackUserId || await getSlackUserId(playerName.toLowerCase())
  if (!slackId) {
    return NextResponse.json({ error: 'No Slack ID set for this player' }, { status: 404 })
  }

  const message = IS_EXERCISE
    ? `🍄 PowerUp test notification! If you see this, Slack notifications are working for ${playerName.toUpperCase()}. 💪`
    : `🌭 Sausage Tracker test notification! If you see this, Slack notifications are working for ${playerName.toUpperCase()}. 🔥`

  const result = await sendSlackDM(slackId, message)

  if (result.ok) {
    return NextResponse.json({ ok: true })
  } else {
    return NextResponse.json({ error: result.error || 'Failed to send' }, { status: 500 })
  }
}
