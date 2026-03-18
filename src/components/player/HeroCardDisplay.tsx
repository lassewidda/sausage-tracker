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

// Deterministic hash from a string → number
function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

interface TypeTheme {
  bg: string
  gradient: string
  border: string
  glow: string
  accent: string
  bodyColor: string
  accentColor: string
  particle: string
}

function getTypeTheme(heroType: string): TypeTheme {
  const type1 = heroType.split('/')[0]?.trim().toUpperCase() ?? ''
  const themes: Record<string, TypeTheme> = {
    'FIRE': {
      bg: '#1a0505', gradient: 'linear-gradient(180deg, #2a0a0a 0%, #1a0505 40%, #331100 100%)',
      border: '#FF6600', glow: 'rgba(255, 102, 0, 0.4)', accent: '#FF6600',
      bodyColor: '#FF4400', accentColor: '#FFaa00', particle: '🔥',
    },
    'DARK': {
      bg: '#0d0520', gradient: 'linear-gradient(180deg, #1a0a30 0%, #0d0520 40%, #200040 100%)',
      border: '#9944FF', glow: 'rgba(153, 68, 255, 0.4)', accent: '#9944FF',
      bodyColor: '#7733CC', accentColor: '#CC88FF', particle: '🌑',
    },
    'ELECTRIC': {
      bg: '#1a1a00', gradient: 'linear-gradient(180deg, #2a2a00 0%, #1a1a00 40%, #333300 100%)',
      border: '#FFDD00', glow: 'rgba(255, 221, 0, 0.4)', accent: '#FFDD00',
      bodyColor: '#FFCC00', accentColor: '#FFFFFF', particle: '⚡',
    },
    'WATER': {
      bg: '#051520', gradient: 'linear-gradient(180deg, #0a2040 0%, #051520 40%, #002244 100%)',
      border: '#4499FF', glow: 'rgba(68, 153, 255, 0.4)', accent: '#4499FF',
      bodyColor: '#2288FF', accentColor: '#88CCFF', particle: '💧',
    },
    'GRASS': {
      bg: '#051a05', gradient: 'linear-gradient(180deg, #0a2a0a 0%, #051a05 40%, #003300 100%)',
      border: '#44DD44', glow: 'rgba(68, 221, 68, 0.4)', accent: '#44DD44',
      bodyColor: '#22AA22', accentColor: '#88FF44', particle: '🌿',
    },
    'ICE': {
      bg: '#0a1520', gradient: 'linear-gradient(180deg, #102030 0%, #0a1520 40%, #0a2535 100%)',
      border: '#88DDFF', glow: 'rgba(136, 221, 255, 0.5)', accent: '#88DDFF',
      bodyColor: '#66CCEE', accentColor: '#FFFFFF', particle: '❄️',
    },
    'STEEL': {
      bg: '#111118', gradient: 'linear-gradient(180deg, #1a1a22 0%, #111118 40%, #222233 100%)',
      border: '#8888BB', glow: 'rgba(136, 136, 187, 0.3)', accent: '#9999CC',
      bodyColor: '#7777AA', accentColor: '#CCCCEE', particle: '⚙️',
    },
    'POISON': {
      bg: '#150818', gradient: 'linear-gradient(180deg, #200a22 0%, #150818 40%, #2a0033 100%)',
      border: '#CC44CC', glow: 'rgba(204, 68, 204, 0.4)', accent: '#CC44CC',
      bodyColor: '#AA44AA', accentColor: '#FF88FF', particle: '☠️',
    },
    'NORMAL': {
      bg: '#151510', gradient: 'linear-gradient(180deg, #222218 0%, #151510 40%, #2a2a1a 100%)',
      border: '#CCAA66', glow: 'rgba(204, 170, 102, 0.3)', accent: '#CCAA66',
      bodyColor: '#AA8844', accentColor: '#DDCC88', particle: '⭐',
    },
    'SMOKED': {
      bg: '#1a1008', gradient: 'linear-gradient(180deg, #2a1a0a 0%, #1a1008 40%, #332200 100%)',
      border: '#CC8833', glow: 'rgba(204, 136, 51, 0.4)', accent: '#CC8833',
      bodyColor: '#BB7722', accentColor: '#FFBB55', particle: '💨',
    },
    'GRILLED': {
      bg: '#1a0a00', gradient: 'linear-gradient(180deg, #2a1500 0%, #1a0a00 40%, #331a00 100%)',
      border: '#FF8833', glow: 'rgba(255, 136, 51, 0.4)', accent: '#FF8833',
      bodyColor: '#DD6622', accentColor: '#FFAA55', particle: '🔥',
    },
    'MEAT': {
      bg: '#1a0808', gradient: 'linear-gradient(180deg, #2a1010 0%, #1a0808 40%, #330a0a 100%)',
      border: '#DD4444', glow: 'rgba(221, 68, 68, 0.4)', accent: '#DD4444',
      bodyColor: '#CC3333', accentColor: '#FF8888', particle: '🥩',
    },
  }
  return themes[type1] ?? {
    bg: '#1a1008', gradient: 'linear-gradient(180deg, #2a1a0a 0%, #1a1008 40%, #332200 100%)',
    border: '#FFaa00', glow: 'rgba(255, 170, 0, 0.3)', accent: '#FFaa00',
    bodyColor: '#CC6622', accentColor: '#FFAA44', particle: '🌭',
  }
}

function StatBar({ label, value, max, color, theme }: { label: string; value: number; max: number; color: string; theme: TypeTheme }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '8px',
        width: '36px',
        textTransform: 'uppercase',
        color: theme.accent,
        textAlign: 'right',
      }}>
        {label}
      </span>
      <div style={{
        flex: 1,
        height: '12px',
        background: '#0a0a0a',
        border: `1px solid ${theme.border}44`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          boxShadow: `0 0 6px ${color}66`,
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

function PixelAvatar({ card, stats, theme }: { card: HeroCard; stats: Props['stats']; theme: TypeTheme }) {
  const h = hash(card.playerName)
  const { bodyColor, accentColor } = theme

  // Vary body shape based on stats
  const isTank = card.defense > 60
  const isSpeedster = card.speed > 60
  const isBruiser = card.attack > 60

  // Vary head shape based on name hash
  const headVariant = h % 4 // 0=round, 1=horned, 2=crowned, 3=hooded
  // Accessory based on stats
  const hasCape = stats.chainLength >= 2
  const hasAura = stats.totalSausages >= 20
  const sausageCount = Math.min(4, Math.ceil(stats.maxInOneMeal / 2)) // how many sausages they hold

  // Body dimensions
  const bodyW = isTank ? 8 : isSpeedster ? 4 : 6
  const bodyX = 8 - Math.floor(bodyW / 2)
  const legSpread = isTank ? 3 : isSpeedster ? 1 : 2

  return (
    <svg width="128" height="128" viewBox="0 0 24 24" style={{ imageRendering: 'pixelated' }}>
      {/* Background with themed pattern */}
      <rect width="24" height="24" fill={theme.bg} />
      {/* Ground line */}
      <rect x="0" y="22" width="24" height="2" fill={`${bodyColor}33`} />

      {/* Aura glow for experienced players */}
      {hasAura && (
        <>
          <rect x={bodyX - 2} y="3" width={bodyW + 4} height="18" fill={`${theme.accent}11`} rx="2" />
          <rect x={bodyX - 1} y="4" width={bodyW + 2} height="16" fill={`${theme.accent}08`} rx="1" />
        </>
      )}

      {/* Cape for chain holders */}
      {hasCape && (
        <>
          <rect x={bodyX - 1} y="9" width="1" height="10" fill={accentColor} opacity="0.7" />
          <rect x={bodyX + bodyW} y="9" width="1" height="10" fill={accentColor} opacity="0.7" />
          <rect x={bodyX - 2} y="12" width="1" height="8" fill={accentColor} opacity="0.4" />
          <rect x={bodyX + bodyW + 1} y="12" width="1" height="8" fill={accentColor} opacity="0.4" />
        </>
      )}

      {/* Body */}
      <rect x={bodyX} y="10" width={bodyW} height={isTank ? 7 : 6} fill={bodyColor} />
      {/* Armor stripe for tank */}
      {isTank && <rect x={bodyX} y="12" width={bodyW} height="1" fill={accentColor} opacity="0.5" />}

      {/* Head */}
      <rect x="6" y="4" width="4" height="5" fill={bodyColor} />
      {/* Face details */}
      <rect x="7" y="5" width="1" height="1" fill={accentColor} />
      <rect x="9" y="5" width="1" height="1" fill={accentColor} />
      <rect x="7" y="6" width="1" height="1" fill="#000" />
      <rect x="9" y="6" width="1" height="1" fill="#000" />
      {/* Mouth varies */}
      {isBruiser ? (
        <rect x="7" y="7" width="2" height="1" fill="#000" opacity="0.6" />
      ) : (
        <rect x="8" y="7" width="1" height="1" fill="#000" opacity="0.4" />
      )}

      {/* Head variant accessories */}
      {headVariant === 0 && (
        // Ears/round
        <>
          <rect x="5" y="5" width="1" height="2" fill={bodyColor} />
          <rect x="10" y="5" width="1" height="2" fill={bodyColor} />
        </>
      )}
      {headVariant === 1 && (
        // Horns
        <>
          <rect x="5" y="3" width="1" height="2" fill={accentColor} />
          <rect x="10" y="3" width="1" height="2" fill={accentColor} />
          <rect x="5" y="2" width="1" height="1" fill={accentColor} />
          <rect x="10" y="2" width="1" height="1" fill={accentColor} />
        </>
      )}
      {headVariant === 2 && (
        // Crown
        <>
          <rect x="6" y="3" width="4" height="1" fill={accentColor} />
          <rect x="6" y="2" width="1" height="1" fill={accentColor} />
          <rect x="8" y="2" width="1" height="1" fill={accentColor} />
          <rect x="9" y="2" width="1" height="1" fill={accentColor} />
        </>
      )}
      {headVariant === 3 && (
        // Hood
        <>
          <rect x="5" y="3" width="6" height="2" fill={accentColor} opacity="0.7" />
          <rect x="6" y="2" width="4" height="1" fill={accentColor} opacity="0.7" />
        </>
      )}

      {/* Arms */}
      <rect x={bodyX - 2} y="11" width="2" height={isSpeedster ? 1 : 2} fill={bodyColor} />
      <rect x={bodyX + bodyW} y="11" width="2" height={isSpeedster ? 1 : 2} fill={bodyColor} />

      {/* Sausages! — varies by maxInOneMeal */}
      {sausageCount >= 1 && (
        <>
          <rect x={bodyX - 3} y="10" width="3" height="1" fill="#C03A18" />
          <rect x={bodyX - 4} y="10" width="1" height="1" fill="#8C2508" />
        </>
      )}
      {sausageCount >= 2 && (
        <>
          <rect x={bodyX + bodyW + 1} y="10" width="3" height="1" fill="#C03A18" />
          <rect x={bodyX + bodyW + 4} y="10" width="1" height="1" fill="#8C2508" />
        </>
      )}
      {sausageCount >= 3 && (
        <rect x={bodyX - 3} y="8" width="4" height="1" fill="#B83010" />
      )}
      {sausageCount >= 4 && (
        <rect x={bodyX + bodyW + 1} y="8" width="4" height="1" fill="#B83010" />
      )}

      {/* Legs — vary by type */}
      <rect x={8 - legSpread - 1} y="16" width="2" height={isSpeedster ? 4 : 3} fill={bodyColor} />
      <rect x={8 + legSpread - 1} y="16" width="2" height={isSpeedster ? 4 : 3} fill={bodyColor} />
      {/* Feet */}
      <rect x={8 - legSpread - 2} y={isSpeedster ? 20 : 19} width="3" height="1" fill={accentColor} />
      <rect x={8 + legSpread - 1} y={isSpeedster ? 20 : 19} width="3" height="1" fill={accentColor} />

      {/* Speed lines for speedsters */}
      {isSpeedster && (
        <>
          <rect x="1" y="12" width="2" height="1" fill={accentColor} opacity="0.3" />
          <rect x="0" y="14" width="3" height="1" fill={accentColor} opacity="0.2" />
          <rect x="1" y="16" width="2" height="1" fill={accentColor} opacity="0.15" />
        </>
      )}
    </svg>
  )
}

// Floating particle decoration
function Particles({ theme, name }: { theme: TypeTheme; name: string }) {
  const h = hash(name)
  const positions = Array.from({ length: 5 }, (_, i) => ({
    left: `${10 + ((h * (i + 1) * 7) % 80)}%`,
    top: `${5 + ((h * (i + 3) * 13) % 85)}%`,
    delay: `${(i * 0.8)}s`,
    size: 8 + (i % 3) * 4,
  }))

  return (
    <>
      {positions.map((p, i) => (
        <span key={i} style={{
          position: 'absolute',
          left: p.left,
          top: p.top,
          fontSize: `${p.size}px`,
          opacity: 0.15,
          pointerEvents: 'none',
          filter: 'blur(0.5px)',
        }}>
          {theme.particle}
        </span>
      ))}
    </>
  )
}

export function HeroCardDisplay({ card, stats }: Props) {
  const [type1, type2] = card.heroType.split('/')
  const theme = getTypeTheme(card.heroType)

  // Type badge colors — second type gets its own theme color
  const type2Theme = type2 ? getTypeTheme(type2.trim()) : null

  return (
    <div style={{
      background: theme.gradient,
      border: `4px solid ${theme.border}`,
      borderRadius: '12px',
      padding: '0',
      maxWidth: '400px',
      margin: '0 auto',
      overflow: 'hidden',
      boxShadow: `0 0 24px ${theme.glow}, inset 0 0 30px rgba(0, 0, 0, 0.6)`,
      position: 'relative',
    }}>
      {/* Background particles */}
      <Particles theme={theme} name={card.playerName} />

      {/* Card header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px 8px',
        borderBottom: `2px solid ${theme.border}`,
        position: 'relative',
        zIndex: 1,
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '12px',
            color: theme.accent,
            textTransform: 'uppercase',
            textShadow: `0 0 10px ${theme.glow}`,
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
          textShadow: '0 0 8px rgba(255, 68, 68, 0.6)',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '4px 8px',
          borderRadius: '4px',
        }}>
          HP {card.hp}
        </div>
      </div>

      {/* Avatar area */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.2)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          border: `3px solid ${theme.border}66`,
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: `0 0 16px ${theme.glow}`,
          background: theme.bg,
        }}>
          <PixelAvatar card={card} stats={stats} theme={theme} />
        </div>
      </div>

      {/* Type badges */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '0 16px 8px', position: 'relative', zIndex: 1 }}>
        <span style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '8px',
          background: theme.border,
          color: '#000',
          padding: '3px 10px',
          borderRadius: '2px',
          textTransform: 'uppercase',
          fontWeight: 'bold',
        }}>
          {type1?.trim()}
        </span>
        {type2 && (
          <span style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            background: type2Theme?.border ?? '#666',
            color: '#000',
            padding: '3px 10px',
            borderRadius: '2px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
          }}>
            {type2.trim()}
          </span>
        )}
      </div>

      {/* Stats */}
      <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: '5px', position: 'relative', zIndex: 1 }}>
        <StatBar label="ATK" value={card.attack} max={99} color="#FF4444" theme={theme} />
        <StatBar label="DEF" value={card.defense} max={99} color="#4488FF" theme={theme} />
        <StatBar label="SPD" value={card.speed} max={99} color="#44CC44" theme={theme} />
      </div>

      {/* Special moves */}
      <div style={{ padding: '8px 16px', position: 'relative', zIndex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '8px',
          color: theme.accent,
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
              background: `${theme.border}11`,
              padding: '5px 8px',
              borderLeft: `3px solid ${theme.border}`,
            }}>
              ⚡ {move}
            </div>
          ))}
        </div>
      </div>

      {/* Weakness */}
      <div style={{ padding: '4px 16px', position: 'relative', zIndex: 1 }}>
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
        borderTop: `1px solid ${theme.border}44`,
        marginTop: '8px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: '12px',
          color: theme.accent,
          fontStyle: 'italic',
          textAlign: 'center',
          lineHeight: 1.4,
          textShadow: `0 0 6px ${theme.glow}`,
        }}>
          &ldquo;{card.catchphrase}&rdquo;
        </div>
      </div>

      {/* Flavor text */}
      <div style={{
        padding: '8px 16px 12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 1,
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
        borderTop: `2px solid ${theme.border}`,
        background: 'rgba(0, 0, 0, 0.4)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: theme.accent }}>
            {stats.totalSausages}
          </div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--amiga-grey)' }}>
            SAUSAGES
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: theme.accent }}>
            {stats.totalGrams}g
          </div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--amiga-grey)' }}>
            CONSUMED
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: theme.accent }}>
            {stats.mealCount}
          </div>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--amiga-grey)' }}>
            MEALS
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: theme.accent }}>
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
