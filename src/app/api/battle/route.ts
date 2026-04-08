import { NextResponse } from 'next/server'
import { createBattle, getOpenBattles, getPlayerBattles, ensureStarterCards, ensureStarterItem, getSlackUserId } from '@/lib/db'
import { sendSlackDM } from '@/lib/slack'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const playerName = (searchParams.get('playerName') || '').toLowerCase()

  const openBattles = await getOpenBattles(playerName || undefined)

  let activeBattles: Awaited<ReturnType<typeof getPlayerBattles>> = []
  if (playerName) {
    activeBattles = await getPlayerBattles(playerName)
  }

  return NextResponse.json({ openBattles, activeBattles })
}

export async function POST(request: Request) {
  const body = await request.json()
  const playerName = (body.playerName || '').toLowerCase()
  const targetOpponent = body.targetOpponent ? (body.targetOpponent as string).toLowerCase() : undefined
  if (!playerName) return NextResponse.json({ error: 'Missing playerName' }, { status: 400 })

  await ensureStarterCards(playerName)
  await ensureStarterItem(playerName)
  const battle = await createBattle(playerName, targetOpponent)

  // Send Slack DM to challenged player (non-blocking)
  if (targetOpponent) {
    try {
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
      const baseUrl = host ? `https://${host}` : ''
      const slackId = await getSlackUserId(targetOpponent)
      if (slackId) {
        const battleUrl = `${baseUrl}/battle`
        sendSlackDM(slackId, `⚔️ ${playerName.toUpperCase()} has challenged YOU to a battle! Go to ${battleUrl}`).catch(() => {})
      }
    } catch {
      // Never let notification failures break battle creation
    }
  }

  return NextResponse.json(battle)
}
