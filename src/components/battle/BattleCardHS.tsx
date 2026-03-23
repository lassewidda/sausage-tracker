'use client'

import type { BattleDeckCard, BattleEffect } from '@/types'
import { PixelAvatar, getTypeTheme } from '@/components/player/HeroCardDisplay'

interface Props {
  deckCard: BattleDeckCard
  side: 'top' | 'bottom'
  isAttacking?: boolean
  isHit?: boolean
  isKo?: boolean
  effects?: BattleEffect[]
}

export function BattleCardHS({ deckCard, side, isAttacking, isHit, isKo, effects = [] }: Props) {
  const card = deckCard.card
  if (!card) return null

  const theme = getTypeTheme(card.heroType)
  const hpPct = Math.max(0, Math.round((deckCard.currentHp / card.hp) * 100))
  const hpBarColor = hpPct > 50 ? '#44CC44' : hpPct > 25 ? '#FFDD00' : '#FF4444'
  const isLowHp = hpPct <= 25

  let animation = ''
  if (isKo) animation = 'ko-spin 0.6s steps(8) forwards'
  else if (isAttacking) animation = side === 'bottom' ? 'hs-attack-up 0.4s steps(4)' : 'hs-attack-down 0.4s steps(4)'
  else if (isHit) animation = 'hit-shake 0.3s steps(4)'

  return (
    <div style={{
      background: theme.gradient,
      border: `3px solid ${deckCard.isKnockedOut ? '#333' : theme.border}`,
      borderRadius: '8px',
      padding: '8px 12px',
      width: '100%',
      maxWidth: '320px',
      margin: '0 auto',
      opacity: deckCard.isKnockedOut ? 0.4 : 1,
      animation,
      transition: 'opacity 0.3s',
      boxShadow: deckCard.isKnockedOut ? 'none' : `0 0 16px ${theme.glow}`,
      position: 'relative' as const,
    }}>
      {/* Header: name + HP */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
      }}>
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '8px',
          color: theme.accent,
          textShadow: `0 0 6px ${theme.glow}`,
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {card.weekKey.startsWith('STARTER') && (
            <span style={{ color: '#ffd700', marginRight: '4px' }}>★</span>
          )}
          {card.heroTitle}
        </div>
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '9px',
          color: hpBarColor,
          marginLeft: '8px',
          whiteSpace: 'nowrap',
          textShadow: isLowHp ? `0 0 8px ${hpBarColor}` : 'none',
        }}>
          {deckCard.currentHp}/{card.hp}
        </div>
      </div>

      {/* Avatar + stats side by side */}
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center',
      }}>
        {/* Avatar */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '4px',
          overflow: 'hidden',
          border: `2px solid ${theme.border}44`,
          flexShrink: 0,
        }}>
          <PixelAvatar card={card} theme={theme} size={80} />
        </div>

        {/* Right side: type, stats, HP bar */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Type */}
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: theme.accent,
            textTransform: 'uppercase',
            opacity: 0.7,
            marginBottom: '4px',
          }}>
            {card.heroType}
          </div>

          {/* HP bar */}
          <div style={{ marginBottom: '6px' }}>
            <div style={{
              height: '10px',
              background: '#0a0a0a',
              border: `1px solid ${theme.border}44`,
              overflow: 'hidden',
              borderRadius: '2px',
              animation: isLowHp ? 'hp-pulse 1.5s infinite' : 'none',
            }}>
              <div style={{
                height: '100%',
                width: `${hpPct}%`,
                background: hpBarColor,
                transition: 'width 0.3s steps(10)',
                boxShadow: `0 0 6px ${hpBarColor}66`,
              }} />
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: '8px',
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: '#aaa',
          }}>
            <span style={{ color: '#FF8800' }}>ATK {card.attack}</span>
            <span style={{ color: '#4488FF' }}>DEF {card.defense}</span>
            <span style={{ color: '#FFDD00' }}>SPD {card.speed}</span>
          </div>

          {/* Effects */}
          {effects.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '4px',
              flexWrap: 'wrap',
              marginTop: '4px',
            }}>
              {effects.map(e => {
                const label = e.effectType.replace('buff_', '+').replace('debuff_', '-').toUpperCase()
                const isDebuff = e.effectType.startsWith('debuff')
                return (
                  <span key={e.id} style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '5px',
                    background: isDebuff ? '#442222' : '#224422',
                    color: isDebuff ? '#FF6666' : '#66FF66',
                    padding: '1px 3px',
                    border: `1px solid ${isDebuff ? '#663333' : '#336633'}`,
                    borderRadius: '2px',
                  }}>
                    {label} {e.effectValue} ({e.remainingTurns}t)
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
