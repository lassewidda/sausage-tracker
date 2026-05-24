import { NextResponse } from 'next/server'
import { declareBattleWalkover, getSlackUserId } from '@/lib/db'
import { sendSlackChannel, sendSlackDM } from '@/lib/slack'
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

export async function GET(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sql = getDb()
  let stale: { id: string }[] = []
  try {
    const rows = await sql`
      SELECT id FROM battles
      WHERE status IN ('battling', 'awaiting_switch', 'selecting')
        AND updated_at < NOW() - INTERVAL '10 days'
    `
    stale = rows.map(r => ({ id: r.id as string }))
  } finally {
    await sql.end()
  }

  const declared: { id: string; winner: string; loser: string }[] = []
  const skipped: { id: string; reason: string }[] = []

  for (const { id } of stale) {
    try {
      const result = await declareBattleWalkover(id)
      if (!result) {
        skipped.push({ id, reason: 'no-clear-loser' })
        continue
      }
      declared.push({ id, ...result })

      const battleUrl = `https://powerup.eliteprospects.com/battle/${id}`
      const loserMsg = `🏳️ You have forfeited your battle vs ${result.winner.toUpperCase()} by walkover after 10 days without a response. ELO loss applied. ${battleUrl}`
      const winnerMsg = `🏆 ${result.loser.toUpperCase()} has forfeited your battle by walkover (10-day timeout). You win — ELO awarded. ${battleUrl}`

      try {
        const [loserId, winnerId] = await Promise.all([
          getSlackUserId(result.loser),
          getSlackUserId(result.winner),
        ])
        if (loserId) await sendSlackDM(loserId, loserMsg)
        if (winnerId) await sendSlackDM(winnerId, winnerMsg)
      } catch {
        // DM failures don't affect the walkover record
      }

      try {
        await sendSlackChannel(
          `🏳️ ${result.loser.toUpperCase()} forfeited their battle vs ${result.winner.toUpperCase()} by walkover (10-day timeout). ${result.winner.toUpperCase()} wins!`
        )
      } catch {
        // channel announce failures non-fatal
      }
    } catch (err) {
      skipped.push({ id, reason: String(err) })
    }
  }

  return NextResponse.json({ ok: true, stale: stale.length, declared, skipped })
}
