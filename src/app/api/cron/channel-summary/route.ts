import { NextResponse } from 'next/server'
import { getLeaderboard, getAllPlayerGoals, getGoalStreaks, getWeekKey } from '@/lib/db'
import { generateChannelSummary } from '@/lib/claude'
import { sendSlackChannel } from '@/lib/slack'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Verify cron secret (Vercel cron auth)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const leaderboard = await getLeaderboard()
    const goals = await getAllPlayerGoals()
    const streaks = await getGoalStreaks()
    const weekKey = getWeekKey()

    // Filter out test accounts
    const testNames = new Set(['test3', 'lars2'])
    const thisWeek = leaderboard.thisWeek.filter(e => !testNames.has(e.playerName))
    const allGoals = goals.filter(g => !testNames.has(g.playerName))

    const totalPlayers = allGoals.length
    const activePlayers = thisWeek.length
    const totalActivities = thisWeek.reduce((sum, e) => sum + e.totalItems, 0)

    // Goal completions this week
    const goalCompletions = thisWeek.filter(e => {
      const goal = allGoals.find(g => g.playerName === e.playerName)
      if (!goal) return false
      return (e.cardioCount ?? 0) >= goal.cardioTarget && (e.strengthCount ?? 0) >= goal.strengthTarget
    }).length

    // Find top streak
    const realStreaks = streaks.filter(s => !testNames.has(s.playerName) && s.totalGoalWeeks > 0)
    const topStreak = realStreaks.length > 0
      ? realStreaks.sort((a, b) => b.totalGoalWeeks - a.totalGoalWeeks)[0]
      : null

    // Build highlights
    const highlights: string[] = []

    // Players with most workouts this week
    const sorted = [...thisWeek].sort((a, b) => b.totalItems - a.totalItems)
    if (sorted.length > 0) {
      highlights.push(`${sorted[0].playerName.toUpperCase()} leads with ${sorted[0].totalItems} workouts this week`)
    }

    // Players who just completed their goal
    for (const entry of thisWeek) {
      const goal = allGoals.find(g => g.playerName === entry.playerName)
      if (!goal) continue
      const met = (entry.cardioCount ?? 0) >= goal.cardioTarget && (entry.strengthCount ?? 0) >= goal.strengthTarget
      if (met) {
        highlights.push(`${entry.playerName.toUpperCase()} has hit their weekly goal!`)
      }
    }

    // Players with high total counts (milestones)
    for (const entry of leaderboard.allTime.filter(e => !testNames.has(e.playerName))) {
      if (entry.totalItems >= 10 && entry.totalItems % 10 < 5) {
        highlights.push(`${entry.playerName.toUpperCase()} has logged ${entry.totalItems}+ workouts total`)
      }
    }

    // Determine day label
    const dayOfWeek = new Date().getDay()
    const dayLabel = dayOfWeek === 1 ? 'Monday' : dayOfWeek === 3 ? 'Wednesday' : dayOfWeek === 5 ? 'Friday' : 'mid-week'

    const message = await generateChannelSummary({
      dayLabel,
      totalActivities,
      activePlayers,
      totalPlayers,
      playerHighlights: highlights.slice(0, 6),
      goalCompletions,
      topStreak: topStreak ? { player: topStreak.playerName, weeks: topStreak.totalGoalWeeks } : null,
    })

    await sendSlackChannel(message)

    return NextResponse.json({ ok: true, message, weekKey })
  } catch (error) {
    console.error('Channel summary cron error:', error)
    return NextResponse.json({ error: 'Failed to generate summary', details: String(error) }, { status: 500 })
  }
}
