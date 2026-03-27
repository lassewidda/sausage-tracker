import { getMealsPaginated, getAvailableWeeks, getWeeklySummaries, getAllWeeklySummaries, formatWeekLabel } from '@/lib/db'
import { Window } from '@/components/amiga/Window'
import { FeedCard } from '@/components/feed/FeedCard'
import { WeeklySummaryCard } from '@/components/feed/WeeklySummaryCard'
import Link from 'next/link'
import { Button } from '@/components/amiga/Button'
import type { Meal, WeeklySummary } from '@/types'
import theme from '@/theme'

export const dynamic = 'force-dynamic'

export default async function FeedPage({ searchParams }: { searchParams: { page?: string; week?: string } }) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const weekFilter = searchParams.week || undefined
  const perPage = 20

  let meals: Meal[] = []
  let total = 0
  let availableWeeks: string[] = []
  let summaries: WeeklySummary[] = []

  try {
    const [paginatedResult, weeks, sums] = await Promise.all([
      getMealsPaginated({ page, perPage, weekKey: weekFilter }),
      getAvailableWeeks(),
      weekFilter ? getWeeklySummaries(weekFilter) : (page === 1 ? getAllWeeklySummaries() : Promise.resolve([])),
    ])
    meals = paginatedResult.meals
    total = paginatedResult.total
    availableWeeks = weeks
    summaries = sums
  } catch (err) {
    console.error('Feed fetch error:', err)
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  function buildUrl(params: { page?: number; week?: string }) {
    const parts: string[] = []
    if (params.week) parts.push(`week=${encodeURIComponent(params.week)}`)
    if (params.page && params.page > 1) parts.push(`page=${params.page}`)
    return parts.length > 0 ? `/feed?${parts.join('&')}` : '/feed'
  }

  return (
    <main className="page-content">
      <Window title={theme.strings.feedTitle}>
        <div className="stack">
          <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
            <Link href="/"><Button>{theme.strings.feedAddButton}</Button></Link>
            <Link href="/highscore"><Button variant="primary">HIGHSCORE</Button></Link>
          </div>

          {/* Week filter */}
          {availableWeeks.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '4px',
              flexWrap: 'wrap',
              overflowX: 'auto',
              padding: '4px 0',
            }}>
              <Link href="/feed">
                <Button variant={!weekFilter ? 'primary' : undefined}>
                  ALL WEEKS
                </Button>
              </Link>
              {availableWeeks.map((wk) => (
                <Link key={wk} href={buildUrl({ week: wk })}>
                  <Button variant={weekFilter === wk ? 'primary' : undefined}>
                    {formatWeekLabel(wk).toUpperCase()}
                  </Button>
                </Link>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', fontSize: '10px', opacity: 0.8 }}>
            {total} {total === 1 ? 'SESSION' : 'SESSIONS'}{weekFilter ? ` IN ${formatWeekLabel(weekFilter).toUpperCase()}` : ' TOTAL'}
          </div>

          {/* Weekly summaries */}
          {summaries.length > 0 && (
            <div className="stack" style={{ gap: '12px' }}>
              {summaries.map((summary) => (
                <WeeklySummaryCard key={summary.id} summary={summary} />
              ))}
            </div>
          )}

          {meals.length === 0 ? (
            <div className="amiga-info" style={{ textAlign: 'center' }}>
              {theme.strings.feedEmpty}
            </div>
          ) : (
            <div className="stack" style={{ gap: '12px' }}>
              {meals.map((meal) => (
                <FeedCard key={meal.id} meal={meal} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 0',
            }}>
              {page > 1 ? (
                <Link href={buildUrl({ week: weekFilter, page: page - 1 })}>
                  <Button>&lt; PREV</Button>
                </Link>
              ) : (
                <Button style={{ opacity: 0.3, pointerEvents: 'none' }}>&lt; PREV</Button>
              )}

              <span style={{ fontSize: '10px' }}>
                PAGE {page} OF {totalPages}
              </span>

              {page < totalPages ? (
                <Link href={buildUrl({ week: weekFilter, page: page + 1 })}>
                  <Button>NEXT &gt;</Button>
                </Link>
              ) : (
                <Button style={{ opacity: 0.3, pointerEvents: 'none' }}>NEXT &gt;</Button>
              )}
            </div>
          )}
        </div>
      </Window>
    </main>
  )
}
