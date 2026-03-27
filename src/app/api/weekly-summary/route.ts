import { NextResponse } from 'next/server'
import {
  getPlayerWeekData,
  getWeeklySummaries,
  insertWeeklySummary,
  getWeeksWithMeals,
  getSummarizedWeeks,
  getWeekKey,
  formatWeekLabel,
  getChallengeView,
} from '@/lib/db'
import { generateWeeklySummary } from '@/lib/claude'

// GET: fetch summaries, optionally auto-generate for past weeks
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const weekParam = searchParams.get('week')

  try {
    if (weekParam) {
      const summaries = await getWeeklySummaries(weekParam)
      return NextResponse.json({ summaries, weekKey: weekParam })
    }

    // Return all existing summaries grouped by week
    const allWeeks = await getWeeksWithMeals()
    const summarizedWeeks = new Set(await getSummarizedWeeks())
    const currentWeek = getWeekKey()

    // Find past weeks missing summaries (don't auto-generate for current week)
    const missingWeeks = allWeeks.filter(w => w !== currentWeek && !summarizedWeeks.has(w))

    return NextResponse.json({
      missingWeeks,
      summarizedWeeks: Array.from(summarizedWeeks),
    })
  } catch (error) {
    console.error('GET /api/weekly-summary error:', error)
    return NextResponse.json({ error: 'Failed to fetch summaries', details: String(error) }, { status: 500 })
  }
}

// POST: generate summaries for a specific week
export async function POST(request: Request): Promise<NextResponse> {
  let weekKey: string

  try {
    const body = await request.json()
    weekKey = body.weekKey
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!weekKey || typeof weekKey !== 'string') {
    return NextResponse.json({ error: 'weekKey is required' }, { status: 400 })
  }

  try {
    const playerData = await getPlayerWeekData(weekKey)
    if (playerData.length === 0) {
      return NextResponse.json({ error: 'No meals found for this week' }, { status: 404 })
    }

    const weekLabel = formatWeekLabel(weekKey)

    // Get challenge data for this week
    let challengeView: Awaited<ReturnType<typeof getChallengeView>> | null = null
    try {
      challengeView = await getChallengeView(weekKey)
    } catch { /* no challenge table yet */ }

    const challengeDesc = challengeView?.challenge
      ? `${challengeView.challenge.bingoItems.join(', ')} + exercise requirements`
      : undefined

    const summaries = await Promise.all(
      playerData.map(async (pd) => {
        const participant = challengeView?.participants?.find(p => p.playerName === pd.playerName)
        const summaryText = await generateWeeklySummary({
          playerName: pd.playerName,
          weekLabel,
          meals: pd.meals,
          totalItems: pd.totalItems,
          totalGrams: pd.totalGrams,
          chainLength: pd.chainLength,
          prevWeekItems: pd.prevWeekItems,
          challengeCompleted: participant?.isComplete ?? false,
          challengeDescription: challengeDesc,
        })

        return insertWeeklySummary({
          playerName: pd.playerName,
          weekKey,
          summaryText,
          totalItems: pd.totalItems,
          totalGrams: pd.totalGrams,
          mealCount: pd.meals.length,
          chainLength: pd.chainLength,
        })
      })
    )

    return NextResponse.json({ summaries }, { status: 201 })
  } catch (error) {
    console.error('POST /api/weekly-summary error:', error)
    return NextResponse.json({ error: 'Failed to generate summaries', details: String(error) }, { status: 500 })
  }
}
