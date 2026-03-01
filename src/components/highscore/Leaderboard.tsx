import type { LeaderboardEntry } from '@/types'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  title: string
  emptyMessage?: string
}

const MEDALS = ['🥇', '🥈', '🥉']
const BAR_COLORS = ['#FF8800', '#AAAAAA', '#CC7700']

export function Leaderboard({ entries, title, emptyMessage = 'NO SCORES YET' }: LeaderboardProps) {
  const max = entries[0]?.totalSausages ?? 1

  return (
    <div className="amiga-window">
      <div className="amiga-window__titlebar">
        <div className="amiga-window__gadget" />
        <span className="amiga-window__title">{title}</span>
        <div className="amiga-window__gadget" />
      </div>
      <div className="amiga-window__body">
        {entries.length === 0 ? (
          <div className="amiga-info" style={{ textAlign: 'center' }}>{emptyMessage}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {entries.map((entry) => {
              const barWidth = Math.round((entry.totalSausages / max) * 100)
              const color = BAR_COLORS[entry.rank - 1] ?? 'var(--amiga-dark-grey)'
              const medal = MEDALS[entry.rank - 1] ?? `#${entry.rank}`

              return (
                <div key={entry.playerName} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {/* Name row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '14px', lineHeight: 1 }}>{medal}</span>
                      <span style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '8px',
                        textTransform: 'uppercase',
                        color: entry.rank === 1 ? 'var(--amiga-orange)' : 'var(--amiga-black)',
                        letterSpacing: '1px',
                      }}>
                        {entry.playerName}
                      </span>
                    </div>
                    <div className="amiga-gauge amiga-gauge--small">
                      {entry.totalSausages}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{
                    height: '8px',
                    background: 'var(--amiga-dark-grey)',
                    borderTop: '1px solid var(--bevel-shadow)',
                    borderLeft: '1px solid var(--bevel-shadow)',
                    borderRight: '1px solid var(--bevel-light)',
                    borderBottom: '1px solid var(--bevel-light)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${barWidth}%`,
                      background: color,
                      transition: 'width 0.3s steps(10)',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
