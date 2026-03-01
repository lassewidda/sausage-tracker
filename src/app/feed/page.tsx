import { getAllMeals } from '@/lib/db'
import { Window } from '@/components/amiga/Window'
import { FeedCard } from '@/components/feed/FeedCard'
import Link from 'next/link'
import { Button } from '@/components/amiga/Button'
import type { Meal } from '@/types'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  let meals: Meal[] = []
  try {
    meals = await getAllMeals()
  } catch (err) {
    console.error('Feed fetch error:', err)
  }

  const grandTotal = meals.reduce((sum, m) => sum + m.sausageCount, 0)

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

          {meals.length === 0 ? (
            <div className="amiga-info" style={{ textAlign: 'center' }}>
              NO MEALS YET. BE THE FIRST TO LOG A SAUSAGE!
            </div>
          ) : (
            <div className="stack" style={{ gap: '12px' }}>
              {meals.map((meal) => (
                <FeedCard key={meal.id} meal={meal} />
              ))}
            </div>
          )}
        </div>
      </Window>
    </main>
  )
}
