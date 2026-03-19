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
      background: theme.gradient,
      border: `3px solid ${deckCard.isKnockedOut ? '#333' : theme.border}`,
      borderRadius: '8px',
      padding: '8px',
      width: '160px',
      position: 'relative' as const,
      opacity: deckCard.isKnockedOut ? 0.4 : 1,
      animation,
      transition: 'opacity 0.3s',
      boxShadow: deckCard.isKnockedOut ? 'none' : `0 0 12px ${theme.glow}`,
    }}>
      {/* Starter badge */}
      {card.weekKey.startsWith('STARTER') && (
        <div style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          background: '#555',
          color: '#ffd700',
          fontFamily: 'var(--font-pixel)',
          fontSize: '6px',
          padding: '2px 4px',
          borderRadius: '2px',
          zIndex: 2,
          lineHeight: 1,
        }}>
          ★
        </div>
      )}
      {/* Name */}
      <div style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '7px',
        color: theme.accent,
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: '4px',
        textShadow: `0 0 6px ${theme.glow}`,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
      title={card.heroTitle}>
        {card.heroTitle}
      </div>

      {/* Avatar */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '4px',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '4px',
        overflow: 'hidden',
        border: `1px solid ${theme.border}44`,
      }}>
        <PixelAvatar card={card} theme={theme} size={80} />
      </div>

      {/* Type */}
      <div style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '6px',
        color: theme.accent,
        textAlign: 'center',
        marginBottom: '4px',
        textTransform: 'uppercase',
        opacity: 0.7,
      }}>
        {card.heroType}
      </div>

      {/* HP bar */}
      <div style={{ marginBottom: '4px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          color: '#aaa',
          marginBottom: '2px',
        }}>
          <span>HP</span>
          <span>{deckCard.currentHp}/{card.hp}</span>
        </div>
        <div style={{
          height: '8px',
          background: '#0a0a0a',
          border: `1px solid ${theme.border}44`,
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
        fontFamily: 'var(--font-pixel)',
        fontSize: '6px',
        color: '#888',
        marginTop: '4px',
      }}>
        <span>ATK {card.attack}</span>
        <span>DEF {card.defense}</span>
        <span>SPD {card.speed}</span>
      </div>
    </div>
  )
}
