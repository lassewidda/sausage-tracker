import { getLeaderboard, getSausageChains } from '@/lib/db'
import { Leaderboard } from '@/components/highscore/Leaderboard'
import { SausageChain } from '@/components/highscore/SausageChain'
import { Window } from '@/components/amiga/Window'
import Link from 'next/link'
import { Button } from '@/components/amiga/Button'
import type { Leaderboard as ILeaderboard, SausageChainEntry } from '@/types'
import { formatWeekLabel } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function HighscorePage() {
  let data: ILeaderboard = { allTime: [], thisWeek: [], weekKey: '' }
  let chains: SausageChainEntry[] = []
  try {
    ;[data, chains] = await Promise.all([getLeaderboard(), getSausageChains()])
  } catch (err) {
    console.error('Highscore fetch error:', err)
  }

  const weekLabel = data.weekKey ? formatWeekLabel(data.weekKey) : 'THIS WEEK'

  return (
    <main className="page-content">
      <Window title="SAUSAGE HIGHSCORE">
        <div className="stack">
          {/* Trophy banner */}
          <div className="grand-total" style={{ fontSize: '11px', letterSpacing: '3px' }}>
            🏆 WHO ATE THE MOST SAUSAGES? 🏆
          </div>

          <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
            <Link href="/"><Button>+ ADD MEAL</Button></Link>
            <Link href="/feed"><Button>FEED</Button></Link>
          </div>

          {/* Weekly leaderboard */}
          <Leaderboard
            title={`THIS WEEK — ${weekLabel.toUpperCase()}`}
            entries={data.thisWeek}
            emptyMessage="NO MEALS THIS WEEK YET"
          />

          {/* All-time leaderboard */}
          <Leaderboard
            title="ALL TIME HIGHSCORE"
            entries={data.allTime}
            emptyMessage="NO SCORES YET — LOG A MEAL!"
          />

          {/* Sausage chain */}
          <SausageChain entries={chains} />
        </div>
      </Window>
    </main>
  )
}
