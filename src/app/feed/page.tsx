import { getAllMeals, getAllWeeklySummaries, getWeeksWithMeals, getSummarizedWeeks, getWeekKey, formatWeekLabel } from '@/lib/db'
import { Window } from '@/components/amiga/Window'
import { FeedCard } from '@/components/feed/FeedCard'
import { WeeklySummaryCard } from '@/components/feed/WeeklySummaryCard'
import { GenerateSummaries } from '@/components/feed/GenerateSummaries'
import Link from 'next/link'
import { Button } from '@/components/amiga/Button'
import type { Meal, WeeklySummary } from '@/types'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  let meals: Meal[] = []
  let summaries: WeeklySummary[] = []
  let missingWeeks: string[] = []

  try {
    const [allMeals, allSummaries, weeksWithMeals, summarizedWeeks] = await Promise.all([
      getAllMeals(),
      getAllWeeklySummaries(),
      getWeeksWithMeals(),
      getSummarizedWeeks(),
    ])
    meals = allMeals
    summaries = allSummaries

    const currentWeek = getWeekKey()
    const summarizedSet = new Set(summarizedWeeks)
    missingWeeks = weeksWithMeals.filter(w => w !== currentWeek && !summarizedSet.has(w))
  } catch (err) {
    console.error('Feed fetch error:', err)
  }

  const grandTotal = meals.reduce((sum, m) => sum + m.sausageCount, 0)

  // Group meals by week
  const mealsByWeek = new Map<string, Meal[]>()
  for (const meal of meals) {
    const existing = mealsByWeek.get(meal.weekKey) ?? []
    existing.push(meal)
    mealsByWeek.set(meal.weekKey, existing)
  }

  // Group summaries by week
  const summariesByWeek = new Map<string, WeeklySummary[]>()
  for (const s of summaries) {
    const existing = summariesByWeek.get(s.weekKey) ?? []
    existing.push(s)
    summariesByWeek.set(s.weekKey, existing)
  }

  // All weeks sorted desc
  const allWeekKeys = Array.from(new Set([
    ...Array.from(mealsByWeek.keys()),
    ...Array.from(summariesByWeek.keys()),
  ])).sort((a, b) => b.localeCompare(a))

  return (
    <main className="page-content">
      <Window title="SAUSAGE FEED — ALL MEALS">
        <div className="stack">
          <div className="grand-total">
            COMMUNITY SAUSAGE COUNT: {String(grandTotal).padStart(4, '0')} 🌭
          </div>

          <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
            <Link href="/"><Button>+ ADD MEAL</Button></Link>
            <Link href="/highscore"><Button variant="primary">HIGHSCORE</Button></Link>
          </div>

          {/* Generate missing reports */}
          <GenerateSummaries missingWeeks={missingWeeks} />

          {allWeekKeys.length === 0 ? (
            <div className="amiga-info" style={{ textAlign: 'center' }}>
              NO MEALS YET. BE THE FIRST TO LOG A SAUSAGE!
            </div>
          ) : (
            <div className="stack" style={{ gap: '16px' }}>
              {allWeekKeys.map((weekKey) => {
                const weekMeals = mealsByWeek.get(weekKey) ?? []
                const weekSummaries = summariesByWeek.get(weekKey) ?? []

                return (
                  <div key={weekKey} className="stack" style={{ gap: '12px' }}>
                    {/* Week header */}
                    <div className="week-group__header">
                      <span>{formatWeekLabel(weekKey).toUpperCase()}</span>
                      <span style={{ fontSize: '9px' }}>
                        {weekMeals.reduce((s, m) => s + m.sausageCount, 0)} PTS
                      </span>
                    </div>

                    {/* Weekly summaries for this week */}
                    {weekSummaries.length > 0 && (
                      <div className="stack" style={{ gap: '8px' }}>
                        {weekSummaries.map((s) => (
                          <WeeklySummaryCard key={s.id} summary={s} />
                        ))}
                      </div>
                    )}

                    {/* Meals */}
                    {weekMeals.map((meal) => (
                      <FeedCard key={meal.id} meal={meal} />
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </Window>
    </main>
  )
}
