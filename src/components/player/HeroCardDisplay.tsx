import type { HeroCard } from '@/types'

interface Props {
  card: HeroCard
  stats: {
    totalSausages: number
    totalGrams: number
    mealCount: number
    maxInOneMeal: number
    activeWeeks: number
    chainLength: number
  }
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '8px',
        width: '36px',
        textTransform: 'uppercase',
        color: 'var(--amiga-white)',
        textAlign: 'right',
      }}>
        {label}
      </span>
      <div style={{
        flex: 1,
        height: '10px',
        background: '#1a1a1a',
        border: '1px solid #555',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          transition: 'width 0.5s steps(10)',
        }} />
      </div>
      <span style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '8px',
        width: '24px',
        color: 'var(--amiga-white)',
      }}>
        {value}
      </span>
    </div>
  )
}

function PixelAvatar({ heroType }: { heroType: string }) {
  // Pick colors based on hero type
  const type1 = heroType.split('/')[0]?.trim().toUpperCase() ?? 'FIRE'
  const colorMap: Record<string, { bg: string; body: string; accent: string }> = {
    'FIRE': { bg: '#4A1010', body: '#FF4400', accent: '#FFaa00' },
    'DARK': { bg: '#1a0a2e', body: '#6B2FA0', accent: '#BB66FF' },
    'ELECTRIC': { bg: '#2A2A00', body: '#FFcc00', accent: '#FFFFFF' },
    'WATER': { bg: '#0A1A3A', body: '#2288FF', accent: '#88CCFF' },
    'GRASS': { bg: '#0A2A0A', body: '#22AA22', accent: '#88FF44' },
    'ICE': { bg: '#0A2A3A', body: '#66CCEE', accent: '#FFFFFF' },
    'STEEL': { bg: '#1A1A2A', body: '#8888AA', accent: '#CCCCEE' },
    'POISON': { bg: '#2A0A2A', body: '#AA44AA', accent: '#FF66FF' },
  }
  const colors = colorMap[type1] ?? { bg: '#2A1000', body: '#CC6622', accent: '#FFAA44' }

  return (
    <svg width="96" height="96" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      <rect width="16" height="16" fill={colors.bg} />
      {/* Body */}
      <rect x="5" y="8" width="6" height="5" fill={colors.body} />
      {/* Head */}
      <rect x="5" y="4" width="6" height="5" fill={colors.body} />
      {/* Eyes */}
      <rect x="6" y="5" width="2" height="2" fill={colors.accent} />
      <rect x="10" y="5" width="2" height="2" fill={colors.accent} />
      <rect x="7" y="6" width="1" height="1" fill="#000" />
      <rect x="10" y="6" width="1" height="1" fill="#000" />
      {/* Crown / horns */}
      <rect x="5" y="3" width="2" height="1" fill={colors.accent} />
      <rect x="9" y="3" width="2" height="1" fill={colors.accent} />
      <rect x="7" y="2" width="2" height="2" fill={colors.accent} />
      {/* Arms holding sausages */}
      <rect x="3" y="9" width="2" height="1" fill={colors.body} />
      <rect x="11" y="9" width="2" height="1" fill={colors.body} />
      {/* Sausages in hands */}
      <rect x="1" y="8" width="3" height="1" fill="#C03A18" />
      <rect x="0" y="8" width="1" height="1" fill="#8C2508" />
      <rect x="12" y="8" width="3" height="1" fill="#C03A18" />
      <rect x="15" y="8" width="1" height="1" fill="#8C2508" />
      {/* Legs */}
      <rect x="5" y="13" width="2" height="2" fill={colors.body} />
      <rect x="9" y="13" width="2" height="2" fill={colors.body} />
      {/* Feet */}
      <rect x="4" y="15" width="3" height="1" fill={colors.accent} />
      <rect x="9" y="15" width="3" height="1" fill={colors.accent} />
    </svg>
  )
}

export function HeroCardDisplay({ card, stats }: Props) {
  const [type1, type2] = card.heroType.split('/')

  return (
    <div style={{
      background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      border: '4px solid #FFaa00',
      borderRadius: '12px',
      padding: '0',
      maxWidth: '400px',
      margin: '0 auto',
      overflow: 'hidden',
      boxShadow: '0 0 20px rgba(255, 170, 0, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px 8px',
        borderBottom: '2px solid #FFaa00',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '12px',
            color: '#FFaa00',
            textTransform: 'uppercase',
            textShadow: '0 0 8px rgba(255, 170, 0, 0.5)',
          }}>
            {card.heroTitle}
          </div>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: 'var(--amiga-grey)',
            marginTop: '2px',
          }}>
            {card.playerName.toUpperCase()}
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '14px',
          color: '#FF4444',
          textShadow: '0 0 6px rgba(255, 68, 68, 0.5)',
        }}>
          HP {card.hp}
        </div>
      </div>

      {/* Avatar area */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{
          border: '3px solid #555',
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: '0 0 12px rgba(255, 170, 0, 0.2)',
        }}>
          <PixelAvatar heroType={card.heroType} />
        </div>
      </div>

      {/* Type badges */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '0 16px 8px' }}>
        <span style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '8px',
          background: '#AA2200',
          color: '#fff',
          padding: '3px 8px',
          borderRadius: '2px',
          textTransform: 'uppercase',
        }}>
          {type1?.trim()}
        </span>
        {type2 && (
          <span style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            background: '#0066AA',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: '2px',
            textTransform: 'uppercase',
          }}>
            {type2.trim()}
          </span>
        )}
      </div>

      {/* Stats */}
      <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <StatBar label="ATK" value={card.attack} max={99} color="#FF4444" />
        <StatBar label="DEF" value={card.defense} max={99} color="#4488FF" />
        <StatBar label="SPD" value={card.speed} max={99} color="#44CC44" />
      </div>

      {/* Special moves */}
      <div style={{ padding: '8px 16px' }}>
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '8px',
          color: '#FFaa00',
          marginBottom: '6px',
          textTransform: 'uppercase',
        }}>
          SPECIAL MOVES
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {card.specialMoves.map((move, i) => (
            <div key={i} style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: 'var(--amiga-white)',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '4px 8px',
              borderLeft: '3px solid #FFaa00',
            }}>
              ⚡ {move}
            </div>
          ))}
        </div>
      </div>

      {/* Weakness */}
      <div style={{ padding: '4px 16px' }}>
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          color: '#AA6666',
          textTransform: 'uppercase',
        }}>
          WEAKNESS: {card.weakness}
        </div>
      </div>

      {/* Catchphrase */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid rgba(255, 170, 0, 0.3)',
        marginTop: '8px',
      }}>
        <div style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: '12px',
          color: '#FFcc44',
          fontStyle: 'italic',
          textAlign: 'center',
          lineHeight: 1.4,
        }}>
          &ldquo;{card.catchphrase}&rdquo;
        </div>
      </div>

      {/* Flavor text */}
      <div style={{
        padding: '8px 16px 12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: '10px',
          color: 'var(--amiga-grey)',
          fontStyle: 'italic',
          lineHeight: 1.5,
          textAlign: 'center',
        }}>
          {card.flavorText}
        </div>
      </div>

      {/* Lifetime stats footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 16px 12px',
        borderTop: '2px solid #FFaa00',
        background: 'rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: '#FFaa00' }}>
            {stats.totalSausages}
          </div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--amiga-grey)' }}>
            SAUSAGES
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: '#FFaa00' }}>
            {stats.totalGrams}g
          </div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--amiga-grey)' }}>
            CONSUMED
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: '#FFaa00' }}>
            {stats.mealCount}
          </div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--amiga-grey)' }}>
            MEALS
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: '#FFaa00' }}>
            {stats.chainLength}W
          </div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--amiga-grey)' }}>
            CHAIN
          </div>
        </div>
      </div>
    </div>
  )
}
