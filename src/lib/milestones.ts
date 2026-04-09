import postgres from 'postgres'
import { getSlackUserId, getWeekKey } from './db'
import { sendSlackDM } from './slack'

function getDb() {
  return postgres(process.env.DATABASE_URL!, {
    max: 5,
    ssl: { rejectUnauthorized: false },
    idle_timeout: 20,
    connect_timeout: 10,
  })
}

interface MilestoneContext {
  playerName: string
  exerciseType: string
}

// Checks milestones after a workout and sends at most ONE DM (highest priority match)
export async function checkMilestones(ctx: MilestoneContext): Promise<void> {
  const { playerName, exerciseType } = ctx
  const name = playerName.toLowerCase()

  try {
    const slackId = await getSlackUserId(name)
    if (!slackId) return

    const sql = getDb()
    const weekKey = getWeekKey()

    try {
      // Gather all data in parallel
      const [totalResult, weekResult, historyResult, leaderboardResult, gapResult] = await Promise.all([
        // Total meal count (all time)
        sql`SELECT COUNT(*)::int AS count FROM meals WHERE player_name = ${name}`,
        // This week's count
        sql`SELECT COUNT(*)::int AS count FROM meals WHERE player_name = ${name} AND week_key = ${weekKey}`,
        // Historical weekly totals
        sql`SELECT week_key, COUNT(*)::int AS total FROM meals WHERE player_name = ${name} GROUP BY week_key ORDER BY week_key`,
        // This week's leaderboard (all players)
        sql`SELECT player_name, COUNT(*)::int AS total FROM meals WHERE week_key = ${weekKey} GROUP BY player_name ORDER BY total DESC`,
        // Days since previous workout (before today)
        sql`SELECT created_at FROM meals WHERE player_name = ${name} ORDER BY created_at DESC OFFSET 1 LIMIT 1`,
      ])

      await sql.end()

      const totalCount = totalResult[0].count as number
      const weekCount = weekResult[0].count as number
      const history = historyResult.map(r => ({ weekKey: r.week_key as string, total: r.total as number }))
      const leaderboard = leaderboardResult.map(r => ({ playerName: r.player_name as string, total: r.total as number }))

      // Skip first workout (handled separately by generateFirstWorkoutMessage)
      if (totalCount <= 1) return

      // Check milestones in priority order — send only the first match
      const message =
        checkTotalMilestone(playerName, totalCount) ??
        checkWeeklyPersonalBest(playerName, weekCount, history, weekKey) ??
        checkLeaderboardTop3(playerName, name, leaderboard) ??
        checkGoalPace(playerName, weekCount, weekKey) ??
        checkComeback(playerName, gapResult, exerciseType)

      if (message) {
        sendSlackDM(slackId, message).catch(() => {})
      }
    } catch {
      await sql.end().catch(() => {})
    }
  } catch { /* silent */ }
}

function checkTotalMilestone(playerName: string, totalCount: number): string | null {
  const milestones = [50, 25, 10]
  for (const m of milestones) {
    if (totalCount === m) {
      return `🏅 ${playerName.toUpperCase()}, you just logged your ${m}th workout! That's serious dedication — keep it going!`
    }
  }
  return null
}

function checkWeeklyPersonalBest(playerName: string, weekCount: number, history: { weekKey: string; total: number }[], currentWeekKey: string): string | null {
  // Need at least 1 completed previous week to compare
  const previousWeeks = history.filter(h => h.weekKey !== currentWeekKey)
  if (previousWeeks.length === 0) return null

  const previousBest = Math.max(...previousWeeks.map(w => w.total))
  if (weekCount > previousBest && weekCount >= 3) {
    return `🔥 ${playerName.toUpperCase()}, ${weekCount} workouts this week — that's a new personal best! Your previous record was ${previousBest}. You're on fire!`
  }
  return null
}

function checkLeaderboardTop3(playerName: string, normalizedName: string, leaderboard: { playerName: string; total: number }[]): string | null {
  const position = leaderboard.findIndex(e => e.playerName === normalizedName)
  if (position === -1) return null

  // Only trigger if they just entered top 3 (position 0, 1, or 2) and there are at least 4 players
  if (position <= 2 && leaderboard.length >= 4) {
    const labels = ['1st', '2nd', '3rd']
    return `📊 ${playerName.toUpperCase()}, you just moved into ${labels[position]} place on this week's leaderboard with ${leaderboard[position].total} workouts! Keep pushing!`
  }
  return null
}

function checkGoalPace(playerName: string, weekCount: number, weekKey: string): string | null {
  // Check if it's early in the week (Mon-Wed) and they're already ahead of pace
  const dayOfWeek = new Date().getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const isEarlyWeek = dayOfWeek >= 1 && dayOfWeek <= 3

  if (isEarlyWeek && weekCount >= 4) {
    return `⚡ ${playerName.toUpperCase()}, ${weekCount} workouts and it's only ${['Sunday','Monday','Tuesday','Wednesday'][dayOfWeek]}! You're way ahead of schedule this week.`
  }
  return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkComeback(playerName: string, gapResult: any[], exerciseType: string): string | null {
  if (gapResult.length === 0) return null

  const prevDate = new Date(gapResult[0].created_at)
  const now = new Date()
  const daysSince = Math.floor((now.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

  if (daysSince >= 7) {
    return `💪 Welcome back, ${playerName.toUpperCase()}! It's been ${daysSince} days — great to see you back with a ${exerciseType} session. Every workout counts!`
  }
  return null
}
