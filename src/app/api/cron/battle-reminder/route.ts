import { NextResponse } from 'next/server'
import { getSlackUserId, hasReminderSinceActivity, recordBattleReminder } from '@/lib/db'
import { sendSlackDM } from '@/lib/slack'
import { generateBattleNudge } from '@/lib/claude'
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

type BattleStatus = 'selecting' | 'battling' | 'awaiting_switch'

function pickPlayerToNudge(b: {
  status: BattleStatus
  challenger: string
  opponent: string | null
  turn_player: string | null
  switch_player: string | null
  challenger_ready: boolean
  opponent_ready: boolean
}): string | null {
  if (b.status === 'awaiting_switch') return b.switch_player
  if (b.status === 'battling') return b.turn_player
  if (b.status === 'selecting') {
    if (!b.challenger_ready) return b.challenger
    if (!b.opponent_ready) return b.opponent
  }
  return null
}

function tierFromDays(daysIdle: number): 1 | 2 | 3 | null {
  if (daysIdle >= 9) return 3
  if (daysIdle >= 5) return 2
  if (daysIdle >= 2) return 1
  return null
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sql = getDb()

  try {
    const staleBattles = await sql`
      SELECT id, challenger, opponent, status, turn_player, switch_player,
             challenger_ready, opponent_ready, updated_at
      FROM battles
      WHERE status IN ('battling', 'awaiting_switch', 'selecting')
        AND updated_at < NOW() - INTERVAL '2 days'
    `
    await sql.end()

    let sent = 0
    const skipped: { id: string; reason: string }[] = []

    for (const b of staleBattles) {
      const status = b.status as BattleStatus
      const playerToNudge = pickPlayerToNudge({
        status,
        challenger: b.challenger as string,
        opponent: b.opponent as string | null,
        turn_player: b.turn_player as string | null,
        switch_player: b.switch_player as string | null,
        challenger_ready: b.challenger_ready as boolean,
        opponent_ready: b.opponent_ready as boolean,
      })
      if (!playerToNudge) { skipped.push({ id: b.id, reason: 'no-target' }); continue }

      const updatedAt = new Date(b.updated_at as string)
      const daysIdle = (Date.now() - updatedAt.getTime()) / 86400000
      const tier = tierFromDays(daysIdle)
      if (!tier) continue

      if (await hasReminderSinceActivity(b.id, tier, updatedAt)) {
        skipped.push({ id: b.id, reason: `tier-${tier}-already-sent` })
        continue
      }

      const slackId = await getSlackUserId(playerToNudge)
      if (!slackId) { skipped.push({ id: b.id, reason: 'no-slack-id' }); continue }

      const opponent = playerToNudge === b.challenger ? (b.opponent as string) : (b.challenger as string)

      try {
        const text = await generateBattleNudge({
          playerName: playerToNudge,
          opponent,
          daysIdle: Math.floor(daysIdle),
          tier,
          status,
        })
        await sendSlackDM(slackId, `${text}\nhttps://powerup.eliteprospects.com/battle/${b.id}`)
        await recordBattleReminder(b.id, tier, playerToNudge)
        sent++
      } catch {
        // Don't fail the whole cron if one DM fails
      }
    }

    return NextResponse.json({ ok: true, staleBattles: staleBattles.length, sent, skipped })
  } catch (error) {
    console.error('Battle reminder cron error:', error)
    await sql.end()
    return NextResponse.json({ error: 'Failed', details: String(error) }, { status: 500 })
  }
}
