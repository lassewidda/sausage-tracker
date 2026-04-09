import postgres from 'postgres'
import { getSlackUserId, getWeekKey } from './db'
import { generateMilestoneMessage } from './claude'
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
  workoutDescription?: string | null
}

interface MilestoneMatch {
  type: 'total' | 'weekly_pb' | 'leaderboard' | 'pace' | 'comeback'
  context: string
}

// Checks milestones after a workout and sends at most ONE DM (highest priority match)
export async function checkMilestones(ctx: MilestoneContext): Promise<void> {
  const { playerName, exerciseType, workoutDescription } = ctx
  const name = playerName.toLowerCase()

  try {
    const slackId = await getSlackUserId(name)
    if (!slackId) return

    const sql = getDb()
    const weekKey = getWeekKey()

    try {
      // Gather all data in parallel
      const [totalResult, weekResult, historyResult, leaderboardResult, gapResult, descResult] = await Promise.all([
        sql`SELECT COUNT(*)::int AS count FROM meals WHERE player_name = ${name}`,
        sql`SELECT COUNT(*)::int AS count FROM meals WHERE player_name = ${name} AND week_key = ${weekKey}`,
        sql`SELECT week_key, COUNT(*)::int AS total FROM meals WHERE player_name = ${name} GROUP BY week_key ORDER BY week_key`,
        sql`SELECT player_name, COUNT(*)::int AS total FROM meals WHERE week_key = ${weekKey} GROUP BY player_name ORDER BY total DESC`,
        sql`SELECT created_at FROM meals WHERE player_name = ${name} ORDER BY created_at DESC OFFSET 1 LIMIT 1`,
        // Get latest workout description for this player
        sql`SELECT ai_description FROM meals WHERE player_name = ${name} ORDER BY created_at DESC LIMIT 1`,
      ])

      await sql.end()

      const totalCount = totalResult[0].count as number
      const weekCount = weekResult[0].count as number
      const history = historyResult.map(r => ({ weekKey: r.week_key as string, total: r.total as number }))
      const leaderboard = leaderboardResult.map(r => ({ playerName: r.player_name as string, total: r.total as number }))
      const latestDescription = workoutDescription || (descResult[0]?.ai_description as string | null) || null

      // Skip first workout (handled separately by generateFirstWorkoutMessage)
      if (totalCount <= 1) return

      // Check milestones in priority order — send only the first match
      const milestone =
        checkTotalMilestone(totalCount) ??
        checkWeeklyPersonalBest(weekCount, history, weekKey) ??
        checkLeaderboardTop3(name, leaderboard) ??
        checkGoalPace(weekCount) ??
        checkComeback(gapResult, exerciseType)

      if (milestone) {
        const message = await generateMilestoneMessage({
          playerName,
          milestoneType: milestone.type,
          context: milestone.context,
          workoutDescription: latestDescription,
        })
        sendSlackDM(slackId, message).catch(() => {})
      }
    } catch {
      await sql.end().catch(() => {})
    }
  } catch { /* silent */ }
}

function checkTotalMilestone(totalCount: number): MilestoneMatch | null {
  const milestones = [50, 25, 10]
  for (const m of milestones) {
    if (totalCount === m) {
      return { type: 'total', context: `just logged their ${m}th workout overall` }
    }
  }
  return null
}

function checkWeeklyPersonalBest(weekCount: number, history: { weekKey: string; total: number }[], currentWeekKey: string): MilestoneMatch | null {
  const previousWeeks = history.filter(h => h.weekKey !== currentWeekKey)
  if (previousWeeks.length === 0) return null

  const previousBest = Math.max(...previousWeeks.map(w => w.total))
  if (weekCount > previousBest && weekCount >= 3) {
    return { type: 'weekly_pb', context: `${weekCount} workouts this week — a new personal best (previous record: ${previousBest})` }
  }
  return null
}

function checkLeaderboardTop3(normalizedName: string, leaderboard: { playerName: string; total: number }[]): MilestoneMatch | null {
  const position = leaderboard.findIndex(e => e.playerName === normalizedName)
  if (position === -1) return null

  if (position <= 2 && leaderboard.length >= 4) {
    const labels = ['1st', '2nd', '3rd']
    return { type: 'leaderboard', context: `moved into ${labels[position]} place on this week's leaderboard with ${leaderboard[position].total} workouts` }
  }
  return null
}

function checkGoalPace(weekCount: number): MilestoneMatch | null {
  const dayOfWeek = new Date().getDay()
  const isEarlyWeek = dayOfWeek >= 1 && dayOfWeek <= 3

  if (isEarlyWeek && weekCount >= 4) {
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday'][dayOfWeek]
    return { type: 'pace', context: `${weekCount} workouts and it's only ${dayName} — way ahead of schedule` }
  }
  return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkComeback(gapResult: any[], exerciseType: string): MilestoneMatch | null {
  if (gapResult.length === 0) return null

  const prevDate = new Date(gapResult[0].created_at)
  const now = new Date()
  const daysSince = Math.floor((now.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

  if (daysSince >= 7) {
    return { type: 'comeback', context: `back after ${daysSince} days away with a ${exerciseType} session` }
  }
  return null
}
