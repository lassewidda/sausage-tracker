import type { SausageChainEntry } from '@/types'

interface Props {
  entries: SausageChainEntry[]
}

const MEDALS = ['🥇', '🥈', '🥉']
const MAX_DISPLAY = 52 // cap at 1 year visually

function SausageLink({ index }: { index: number }) {
  // Alternate slight shade for visual rhythm
  const body = index % 2 === 0 ? '#C03A18' : '#B83010'
  const cap = index % 2 === 0 ? '#8C2508' : '#7A1E04'
  const highlight = '#E06040'

  return (
    <svg
      width="36"
      height="18"
      viewBox="0 0 36 18"
      style={{ display: 'block', imageRendering: 'pixelated' }}
    >
      {/* left cap */}
      <ellipse cx="8" cy="9" rx="8" ry="7" fill={cap} />
      {/* body */}
      <rect x="8" y="2" width="20" height="14" fill={body} />
      {/* right cap */}
      <ellipse cx="28" cy="9" rx="8" ry="7" fill={cap} />
      {/* highlight stripe */}
      <rect x="8" y="4" width="20" height="3" fill={highlight} opacity="0.45" />
      <ellipse cx="8" cy="5" rx="5" ry="2.5" fill={highlight} opacity="0.3" />
      {/* skin crinkle lines */}
      <line x1="14" y1="2" x2="14" y2="16" stroke={cap} strokeWidth="1" opacity="0.4" />
      <line x1="22" y1="2" x2="22" y2="16" stroke={cap} strokeWidth="1" opacity="0.4" />
    </svg>
  )
}

function ChainConnector() {
  return (
    <svg
      width="10"
      height="18"
      viewBox="0 0 10 18"
      style={{ display: 'block', imageRendering: 'pixelated' }}
    >
      {/* top link */}
      <ellipse cx="5" cy="4" rx="3.5" ry="3" fill="none" stroke="#7A5C30" strokeWidth="2" />
      {/* bottom link */}
      <ellipse cx="5" cy="14" rx="3.5" ry="3" fill="none" stroke="#7A5C30" strokeWidth="2" />
      {/* connecting bar */}
      <line x1="5" y1="7" x2="5" y2="11" stroke="#7A5C30" strokeWidth="2" />
    </svg>
  )
}

function ChainRow({ count, offset = 0 }: { count: number; offset?: number }) {
  const links = Array.from({ length: count }, (_, i) => offset + i)
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'nowrap' }}>
      {links.map((idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
          <SausageLink index={idx} />
          {idx < offset + count - 1 && <ChainConnector />}
        </div>
      ))}
    </div>
  )
}

function ChainViz({ weeks }: { weeks: number }) {
  if (weeks === 0) {
    return (
      <div style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '9px',
        color: 'var(--amiga-dark-grey)',
        padding: '6px 0',
        textTransform: 'uppercase',
      }}>
        — NO CHAIN YET —
      </div>
    )
  }

  const display = Math.min(weeks, MAX_DISPLAY)
  const ROW_SIZE = 10

  // Split into rows of ROW_SIZE
  const rows: { count: number; offset: number }[] = []
  let remaining = display
  let offset = 0
  while (remaining > 0) {
    const count = Math.min(remaining, ROW_SIZE)
    rows.push({ count, offset })
    offset += count
    remaining -= count
  }

  return (
    <div style={{
      background: 'var(--amiga-dark-grey)',
      border: '2px solid var(--bevel-shadow)',
      padding: '8px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      alignItems: 'flex-start',
      overflowX: 'auto',
      maxWidth: '100%',
    }}>
      {rows.map((row, i) => (
        <ChainRow key={i} count={row.count} offset={row.offset} />
      ))}
      {weeks > MAX_DISPLAY && (
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '8px',
          color: 'var(--crt-amber)',
          paddingTop: '4px',
        }}>
          +{weeks - MAX_DISPLAY} MORE WEEKS
        </div>
      )}
    </div>
  )
}

export function SausageChain({ entries }: Props) {
  return (
    <div className="amiga-window">
      <div className="amiga-window__titlebar">
        <div className="amiga-window__gadget" />
        <span className="amiga-window__title">🌭 THE SAUSAGE CHAIN 🌭</span>
        <div className="amiga-window__gadget" />
      </div>
      <div className="amiga-window__body">
        <div style={{ marginBottom: '10px' }}>
          <div className="amiga-info">
            EACH LINK = 1 WEEK WITH 3+ SAUSAGES. MISS A WEEK AND YOUR CHAIN BREAKS!
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="amiga-info" style={{ textAlign: 'center' }}>
            NO CHAINS YET — LOG 3+ SAUSAGES IN A WEEK TO START YOURS!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {entries.map((entry, i) => (
              <div key={entry.playerName}>
                {/* Player header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', lineHeight: 1 }}>
                      {MEDALS[i] ?? `#${i + 1}`}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      color: 'var(--amiga-black)',
                      letterSpacing: '1px',
                    }}>
                      {entry.playerName}
                    </span>
                  </div>
                  <div style={{
                    background: entry.streakWeeks > 0 ? 'var(--amiga-black)' : 'var(--amiga-dark-grey)',
                    color: entry.streakWeeks > 0 ? 'var(--crt-amber)' : 'var(--amiga-grey)',
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '9px',
                    padding: '4px 8px',
                    textShadow: entry.streakWeeks > 0 ? '0 0 4px var(--crt-amber)' : 'none',
                  }}>
                    {entry.streakWeeks} WEEK{entry.streakWeeks !== 1 ? 'S' : ''} 🔗
                  </div>
                </div>

                <ChainViz weeks={entry.streakWeeks} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
