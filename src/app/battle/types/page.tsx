import { Window } from '@/components/amiga/Window'
import Link from 'next/link'
import { Button } from '@/components/amiga/Button'
import theme from '@/theme'

// Get types from the theme's type chart instead of hardcoding
const TYPES = Object.keys(theme.typeChart)

function getEmoji(type: string): string {
  const t = theme.typeThemes[type]
  return t?.particle ?? '⚡'
}

function getColor(type: string): string {
  const t = theme.typeThemes[type]
  return t?.accent ?? '#FF8800'
}

function formatName(type: string): string {
  return type.replace(/_/g, ' ')
}

export default function TypeChartPage() {
  const chart = theme.typeChart

  // Build per-type strong/weak lists from the chart
  const typeInfo = TYPES.map(type => {
    const strongAgainst: string[] = []
    const weakAgainst: string[] = []
    const resistedBy: string[] = []
    const crushedBy: string[] = []

    const offenses = chart[type] ?? {}
    for (const [target, mult] of Object.entries(offenses)) {
      if (!TYPES.includes(target)) continue
      if (mult >= 1.5) strongAgainst.push(target)
      if (mult <= 0.66) weakAgainst.push(target)
    }

    for (const otherType of TYPES) {
      if (otherType === type) continue
      const otherOffenses = chart[otherType] ?? {}
      const mult = otherOffenses[type]
      if (mult && mult >= 1.5) crushedBy.push(otherType)
      if (mult && mult <= 0.66) resistedBy.push(otherType)
    }

    return { type, strongAgainst, weakAgainst, resistedBy, crushedBy }
  })

  return (
    <main className="page-content">
      <Window title="TYPE MATCHUP CHART">
        <div className="stack" style={{ gap: '4px' }}>
          <div style={{ textAlign: 'center', padding: '8px' }}>
            <Link href="/battle"><Button>&lt; BACK TO BATTLE</Button></Link>
          </div>

          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: 'var(--amiga-dark-grey)',
            textAlign: 'center',
            padding: '4px 8px',
          }}>
            1.5x = SUPER EFFECTIVE &nbsp;|&nbsp; 0.66x = NOT VERY EFFECTIVE
          </div>

          {typeInfo.map(({ type, strongAgainst, weakAgainst, crushedBy, resistedBy }) => (
            <div key={type} style={{
              border: `2px solid ${getColor(type)}`,
              background: 'var(--amiga-black)',
              padding: '8px 10px',
              margin: '0 4px',
            }}>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '10px',
                color: getColor(type),
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span>{getEmoji(type)}</span>
                <span>{formatName(type)}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                {strongAgainst.length > 0 && (
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px' }}>
                    <span style={{ color: '#44FF44' }}>STRONG VS: </span>
                    <span style={{ color: 'var(--amiga-white)' }}>
                      {strongAgainst.map(t => `${getEmoji(t)} ${formatName(t)}`).join(', ')}
                    </span>
                  </div>
                )}
                {weakAgainst.length > 0 && (
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px' }}>
                    <span style={{ color: '#FF4444' }}>WEAK VS: </span>
                    <span style={{ color: 'var(--amiga-white)' }}>
                      {weakAgainst.map(t => `${getEmoji(t)} ${formatName(t)}`).join(', ')}
                    </span>
                  </div>
                )}
                {crushedBy.length > 0 && (
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px' }}>
                    <span style={{ color: '#FF8844' }}>TAKES 1.5x FROM: </span>
                    <span style={{ color: 'var(--amiga-white)' }}>
                      {crushedBy.map(t => `${getEmoji(t)} ${formatName(t)}`).join(', ')}
                    </span>
                  </div>
                )}
                {resistedBy.length > 0 && (
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px' }}>
                    <span style={{ color: '#4488FF' }}>RESISTS: </span>
                    <span style={{ color: 'var(--amiga-white)' }}>
                      {resistedBy.map(t => `${getEmoji(t)} ${formatName(t)}`).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Window>
    </main>
  )
}
