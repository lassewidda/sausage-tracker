import Link from 'next/link'
import { getAllMeals, groupByWeek } from '@/lib/db'
import { Window } from '@/components/amiga/Window'
import { WeekGroup } from '@/components/gallery/WeekGroup'
import { Button } from '@/components/amiga/Button'
import type { Meal, WeekGroup as IWeekGroup } from '@/types'

export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  let meals: Meal[] = []
  let weeks: IWeekGroup[] = []
  let grandTotal = 0

  try {
    meals = await getAllMeals()
    weeks = groupByWeek(meals)
    grandTotal = meals.reduce((sum, m) => sum + m.sausageCount, 0)
  } catch (err) {
    console.error('Gallery fetch error:', err)
  }

  return (
    <main className="page-content">
      <Window title="WEEKLY SAUSAGE LOG">
        <div className="stack">
          {/* Grand total */}
          <div className="grand-total">
            LIFETIME SAUSAGE SCORE: {String(grandTotal).padStart(4, '0')} POINTS
          </div>

          {/* Add meal button */}
          <div className="row">
            <Link href="/">
              <Button variant="primary">+ ADD NEW MEAL</Button>
            </Link>
          </div>

          {/* Week groups */}
          {weeks.length === 0 ? (
            <div className="amiga-info" style={{ textAlign: 'center' }}>
              NO MEALS RECORDED YET.
              <br />
              UPLOAD YOUR FIRST MEAL TO GET STARTED!
            </div>
          ) : (
            <div className="stack" style={{ gap: '20px' }}>
              {weeks.map((week) => (
                <WeekGroup key={week.weekKey} group={week} />
              ))}
            </div>
          )}
        </div>
      </Window>
    </main>
  )
}
