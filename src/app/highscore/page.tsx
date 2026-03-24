import { getLeaderboard, getChains } from '@/lib/db'
import { Leaderboard } from '@/components/highscore/Leaderboard'
import { ItemChain } from '@/components/highscore/ItemChain'
import { Window } from '@/components/amiga/Window'
import Link from 'next/link'
import { Button } from '@/components/amiga/Button'
import type { Leaderboard as ILeaderboard, ChainEntry } from '@/types'
import { formatWeekLabel } from '@/lib/db'
import theme from '@/theme'

export const dynamic = 'force-dynamic'

export default async function HighscorePage() {
  let data: ILeaderboard = { allTime: [], thisWeek: [], weekKey: '' }
  let chains: ChainEntry[] = []
  try {
    ;[data, chains] = await Promise.all([getLeaderboard(), getChains()])
  } catch (err) {
    console.error('Highscore fetch error:', err)
  }

  const weekLabel = data.weekKey ? formatWeekLabel(data.weekKey) : 'THIS WEEK'

  return (
    <main className="page-content">
      <Window title={theme.strings.highscoreTitle}>
        <div className="stack">
          {/* Trophy banner */}
          <div className="grand-total" style={{ fontSize: '11px', letterSpacing: '3px' }}>
            {theme.strings.highscoreBanner}
          </div>

          <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
            <Link href="/"><Button>+ ADD MEAL</Button></Link>
            <Link href="/feed"><Button>FEED</Button></Link>
          </div>

          {/* Weekly leaderboard */}
          <Leaderboard
            title={`THIS WEEK — ${weekLabel.toUpperCase()}`}
            entries={data.thisWeek}
            emptyMessage={theme.strings.noMealsThisWeek}
          />

          {/* All-time leaderboard */}
          <Leaderboard
            title="ALL TIME HIGHSCORE"
            entries={data.allTime}
            emptyMessage={theme.strings.noScoresYet}
          />

          {/* Sausage chain */}
          <ItemChain entries={chains} />
        </div>
      </Window>
    </main>
  )
}
