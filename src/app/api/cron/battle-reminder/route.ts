import { NextResponse } from 'next/server'
import { getSlackUserId } from '@/lib/db'
import { sendSlackDM } from '@/lib/slack'
import postgres from 'postgres'

export const dynamic = 'force-dynamic'

function getDb() {
  return postgres(process.env.DATABASE_URL!, {
    max: 5,
    ssl: { rejectUnauthorized: false },
    idle_timeout: 20,
    connect_timeout: 10,
  })
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sql = getDb()

  try {
    // Find battles where the current player hasn't acted for 2+ days
    const staleBattles = await sql`
      SELECT id, challenger, opponent, status, turn_player, switch_player
      FROM battles
      WHERE status IN ('battling', 'awaiting_switch', 'selecting')
        AND updated_at < NOW() - INTERVAL '2 days'
    `
    await sql.end()

    let sent = 0
    for (const battle of staleBattles) {
      // Determine who needs to act
      const playerToNudge = battle.status === 'awaiting_switch'
        ? battle.switch_player as string
        : battle.turn_player as string

      if (!playerToNudge) continue

      const opponent = playerToNudge === battle.challenger
        ? battle.opponent as string
        : battle.challenger as string

      try {
        const slackId = await getSlackUserId(playerToNudge)
        if (!slackId) continue

        const battleUrl = `https://powerup.eliteprospects.com/battle/${battle.id}`
        await sendSlackDM(
          slackId,
          `Hey ${playerToNudge.toUpperCase()}! Your battle against ${opponent.toUpperCase()} is waiting for you — it's your turn! ${battleUrl}`
        )
        sent++
      } catch {
        // Don't fail the whole cron if one DM fails
      }
    }

    return NextResponse.json({ ok: true, staleBattles: staleBattles.length, sent })
  } catch (error) {
    console.error('Battle reminder cron error:', error)
    await sql.end()
    return NextResponse.json({ error: 'Failed', details: String(error) }, { status: 500 })
  }
}
