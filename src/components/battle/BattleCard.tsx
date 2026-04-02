'use client'

import type { BattleDeckCard } from '@/types'
import { PixelAvatar, getTypeTheme } from '@/components/player/HeroCardDisplay'

interface Props {
  deckCard: BattleDeckCard
  isAttacking?: boolean
  isHit?: boolean
  isKo?: boolean
  side: 'left' | 'right'
}

const frameColor = '#D4B96B'
const frameDark = '#8B7435'

export function BattleCard({ deckCard, isAttacking, isHit, isKo, side }: Props) {
  const card = deckCard.card
  if (!card) return null

  const theme = getTypeTheme(card.heroType)
  const hpPct = Math.max(0, Math.round((deckCard.currentHp / card.hp) * 100))
  const hpBarColor = hpPct > 50 ? '#44CC44' : hpPct > 25 ? '#FFDD00' : '#FF4444'

  let animation = ''
  if (isKo) animation = 'ko-spin 0.6s steps(8) forwards'
  else if (isAttacking) animation = side === 'left' ? 'attack-lunge 0.4s steps(4)' : 'attack-lunge-left 0.4s steps(4)'
  else if (isHit) animation = 'hit-shake 0.3s steps(4)'

  return (
    <div style={{
      background: deckCard.isKnockedOut
        ? 'linear-gradient(135deg, #555, #666, #555, #444)'
        : `linear-gradient(135deg, ${frameColor}, #F0E68C, ${frameColor}, ${frameDark})`,
      borderRadius: '10px',
      padding: '4px',
      width: 'clamp(130px, 42vw, 170px)',
      opacity: deckCard.isKnockedOut ? 0.6 : 1,
      filter: deckCard.isKnockedOut ? 'grayscale(0.7)' : 'none',
      animation,
      transition: 'opacity 0.3s',
      boxShadow: deckCard.isKnockedOut ? 'none' : `0 2px 12px rgba(0,0,0,0.5), 0 0 8px ${theme.glow}`,
      position: 'relative',
    }}>
      {deckCard.isKnockedOut && !isKo && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          pointerEvents: 'none',
        }}>
          <span style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '32px',
            color: '#FF2222',
            textShadow: '0 0 10px rgba(255, 0, 0, 0.6), 2px 2px 0 #000',
            letterSpacing: '4px',
          }}>
            K.O.
          </span>
        </div>
      )}
      <div style={{
        background: '#1a1a2e',
        borderRadius: '7px',
        overflow: 'hidden',
        padding: '6px',
      }}>
        {/* Name */}
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          color: '#FFFFFF',
          textAlign: 'center',
          marginBottom: '4px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          position: 'relative',
        }} title={card.heroTitle}>
          {card.weekKey.startsWith('STARTER') && (
            <span style={{ color: '#ffd700', marginRight: '3px' }}>★</span>
          )}
          {card.heroTitle}
        </div>

        {/* Avatar in picture frame */}
        <div style={{
          padding: '3px',
          background: `linear-gradient(135deg, ${frameDark}, ${frameColor}, ${frameDark})`,
          borderRadius: '4px',
          marginBottom: '6px',
        }}>
          <div style={{
            background: theme.gradient,
            borderRadius: '3px',
            display: 'flex',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <PixelAvatar card={card} theme={theme} size={80} />
          </div>
        </div>

        {/* Type */}
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '6px',
          color: frameColor,
          textAlign: 'center',
          marginBottom: '4px',
          textTransform: 'uppercase',
        }}>
          {card.heroType}
        </div>

        {/* HP bar */}
        <div style={{ marginBottom: '6px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            marginBottom: '2px',
          }}>
            <span style={{ color: '#FFFFFF' }}>HP</span>
            <span style={{ color: hpBarColor }}>{deckCard.currentHp}/{card.hp}</span>
          </div>
          <div style={{
            height: '8px',
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${hpPct}%`,
              background: hpBarColor,
              transition: 'width 0.3s steps(10)',
              boxShadow: `0 0 4px ${hpBarColor}66`,
            }} />
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          background: '#111122',
          borderRadius: '3px',
          padding: '4px 2px',
          border: '1px solid #333',
        }}>
          {[
            { label: 'ATK', value: card.attack, color: '#FF4444' },
            { label: 'DEF', value: card.defense, color: '#4488FF' },
            { label: 'SPD', value: card.speed, color: '#44CC44' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: s.color }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: '#FFFFFF' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
