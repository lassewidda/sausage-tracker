import { NextRequest, NextResponse } from 'next/server'
import { sendSlackChannel, sendSlackChannelWithImage } from '@/lib/slack'
import postgres from 'postgres'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { type } = await req.json()
  const sql = postgres(process.env.DATABASE_URL!, { ssl: { rejectUnauthorized: false } })

  try {
    switch (type) {
      case 'photo_bingo': {
        // Find a real challenge photo
        const photos = await sql`
          SELECT cp.player_name, cp.bingo_item, cp.image_url
          FROM challenge_photos cp
          ORDER BY cp.created_at DESC LIMIT 1
        `
        if (photos.length === 0) {
          return NextResponse.json({ error: 'No bingo photos found' }, { status: 404 })
        }
        const p = photos[0]
        const result = await sendSlackChannelWithImage(
          `📸 ${(p.player_name as string).toUpperCase()} found "${p.bingo_item}" for the weekly challenge!`,
          p.image_url as string,
          `${p.player_name} - ${p.bingo_item}`
        )
        return NextResponse.json(result)
      }

      case 'challenge_complete': {
        // Find a player who has completed a challenge
        const players = await sql`SELECT DISTINCT player_name FROM meals ORDER BY player_name LIMIT 1`
        if (players.length === 0) return NextResponse.json({ error: 'No players found' }, { status: 404 })
        const name = (players[0].player_name as string).toUpperCase()
        const result = await sendSlackChannel(`🏆 ${name} completed the weekly challenge! [TEST]`)
        return NextResponse.json(result)
      }

      case 'team_complete': {
        const result = await sendSlackChannel(`🏆 Team PowerLifters completed the weekly challenge! [TEST]`)
        return NextResponse.json(result)
      }

      case 'goal_met': {
        // Find a player with a goal
        const goals = await sql`
          SELECT player_name, cardio_target, strength_target
          FROM player_goals
          WHERE cardio_target > 0 OR strength_target > 0
          LIMIT 1
        `
        if (goals.length === 0) return NextResponse.json({ error: 'No goals set' }, { status: 404 })
        const g = goals[0]
        const parts = []
        if ((g.cardio_target as number) > 0) parts.push(`${g.cardio_target} cardio`)
        if ((g.strength_target as number) > 0) parts.push(`${g.strength_target} strength`)
        const result = await sendSlackChannel(`✅ ${(g.player_name as string).toUpperCase()} hit their weekly goal! (${parts.join(' + ')}) [TEST]`)
        return NextResponse.json(result)
      }

      case 'battle_end': {
        // Find a real finished battle
        const battles = await sql`
          SELECT challenger, opponent, winner
          FROM battles
          WHERE status = 'finished' AND winner IS NOT NULL
          ORDER BY updated_at DESC LIMIT 1
        `
        if (battles.length === 0) return NextResponse.json({ error: 'No finished battles found' }, { status: 404 })
        const b = battles[0]
        const winner = b.winner as string
        const loser = winner === b.challenger ? b.opponent : b.challenger
        const result = await sendSlackChannel(`⚔️ ${(winner as string).toUpperCase()} defeated ${(loser as string).toUpperCase()} in battle! 🏆 [TEST]`)
        return NextResponse.json(result)
      }

      case 'battle_draw': {
        const result = await sendSlackChannel(`⚔️ Battle ended in a DRAW! PLAYER A vs PLAYER B [TEST]`)
        return NextResponse.json(result)
      }

      default:
        return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  } finally {
    await sql.end()
  }
}
