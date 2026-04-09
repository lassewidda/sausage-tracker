import { NextResponse } from 'next/server'
import { getAllPlayerGoals, getGoalStreaks, getWeekKey, getSlackUserId } from '@/lib/db'
import { generateWeeklyRecapDM } from '@/lib/claude'
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

  try {
    const goals = await getAllPlayerGoals()
    const streaks = await getGoalStreaks()
    const weekKey = getWeekKey()
    const testNames = new Set(['test3', 'lars2'])
    const realGoals = goals.filter(g => !testNames.has(g.playerName) && (g.cardioTarget > 0 || g.strengthTarget > 0))

    const sql = getDb()

    // Get this week's stats per player
    const weekStats = await sql`
      SELECT player_name,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE exercise_type = 'cardio')::int AS cardio,
        COUNT(*) FILTER (WHERE exercise_type = 'strength')::int AS strength
      FROM meals WHERE week_key = ${weekKey}
      GROUP BY player_name
      ORDER BY total DESC
    `

    // Get recent workout descriptions per player
    const descriptions = await sql`
      SELECT player_name, ai_description, exercise_type
      FROM meals
      WHERE week_key = ${weekKey} AND ai_description IS NOT NULL AND ai_description != ''
      ORDER BY created_at DESC
    `
    await sql.end()

    // Build lookup maps
    const statsMap = new Map(weekStats.map(r => [r.player_name as string, {
      total: r.total as number,
      cardio: r.cardio as number,
      strength: r.strength as number,
    }]))

    const descMap = new Map<string, string[]>()
    for (const r of descriptions) {
      const name = r.player_name as string
      if (!descMap.has(name)) descMap.set(name, [])
      const list = descMap.get(name)!
      if (list.length < 4) list.push(`${r.ai_description} (${r.exercise_type})`)
    }

    const streakMap = new Map(streaks.map(s => [s.playerName, s.streakWeeks]))

    // Build ranked list
    const ranked = realGoals
      .map(g => ({ ...g, total: statsMap.get(g.playerName)?.total ?? 0 }))
      .sort((a, b) => b.total - a.total)

    let sent = 0
    const errors: string[] = []

    // Send recap to each player (sequentially to avoid rate limits)
    for (let i = 0; i < ranked.length; i++) {
      const player = ranked[i]
      try {
        const slackId = await getSlackUserId(player.playerName)
        if (!slackId) continue

        const stats = statsMap.get(player.playerName) ?? { total: 0, cardio: 0, strength: 0 }
        const goalMet = stats.cardio >= player.cardioTarget && stats.strength >= player.strengthTarget

        const message = await generateWeeklyRecapDM({
          playerName: player.playerName,
          cardio: stats.cardio,
          strength: stats.strength,
          total: stats.total,
          cardioTarget: player.cardioTarget,
          strengthTarget: player.strengthTarget,
          goalMet,
          streakWeeks: streakMap.get(player.playerName) ?? 0,
          rank: i + 1,
          totalPlayers: ranked.length,
          recentDescriptions: descMap.get(player.playerName) ?? [],
        })

        await sendSlackDM(slackId, message)
        sent++
      } catch (err) {
        errors.push(`${player.playerName}: ${String(err)}`)
      }
    }

    return NextResponse.json({ ok: true, sent, total: ranked.length, errors: errors.length, weekKey })
  } catch (error) {
    console.error('Weekly recap cron error:', error)
    return NextResponse.json({ error: 'Failed', details: String(error) }, { status: 500 })
  }
}
