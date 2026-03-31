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

const frameColor = '#D4B96B'
const frameDark = '#8B7435'

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
      background: deckCard.isKnockedOut
        ? 'linear-gradient(135deg, #555, #666, #555, #444)'
        : `linear-gradient(135deg, ${frameColor}, #F0E68C, ${frameColor}, ${frameDark})`,
      borderRadius: '10px',
      padding: '4px',
      width: '100%',
      maxWidth: '340px',
      margin: '0 auto',
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
        padding: '8px 10px',
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
            color: '#FFFFFF',
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Avatar in picture frame */}
          <div style={{
            padding: '3px',
            background: `linear-gradient(135deg, ${frameDark}, ${frameColor}, ${frameDark})`,
            borderRadius: '4px',
            flexShrink: 0,
          }}>
            <div style={{
              background: theme.gradient,
              borderRadius: '3px',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
            }}>
              <PixelAvatar card={card} theme={theme} size={80} />
            </div>
          </div>

          {/* Right side: type, HP bar, stats */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Type */}
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: frameColor,
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}>
              {card.heroType}
            </div>

            {/* HP bar */}
            <div style={{ marginBottom: '6px' }}>
              <div style={{
                height: '10px',
                background: '#0a0a0a',
                border: '1px solid #333',
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
              gap: '10px',
              background: '#111122',
              borderRadius: '3px',
              padding: '4px 8px',
              border: '1px solid #333',
            }}>
              {[
                { label: 'ATK', value: card.attack, color: '#FF4444' },
                { label: 'DEF', value: card.defense, color: '#4488FF' },
                { label: 'SPD', value: card.speed, color: '#44CC44' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: s.color }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: '#FFFFFF' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Effects */}
            {effects.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
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
    </div>
  )
}
