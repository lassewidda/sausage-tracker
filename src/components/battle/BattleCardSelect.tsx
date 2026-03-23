'use client'

import { useState } from 'react'
import type { HeroCard } from '@/types'
import { PixelAvatar, getTypeTheme } from '@/components/player/HeroCardDisplay'

const DECK_SIZE = 4

interface Props {
  deck: HeroCard[]
  onSubmit: (cardIds: string[]) => void
  isReady: boolean
}

export function BattleCardSelect({ deck, onSubmit, isReady }: Props) {
  const [selected, setSelected] = useState<string[]>([])

  const starterIds = new Set(deck.filter(c => c.weekKey.startsWith('STARTER')).map(c => c.id))
  const hasStarter = selected.some(id => starterIds.has(id))
  const canSubmit = selected.length === DECK_SIZE && hasStarter

  const toggleCard = (id: string) => {
    if (isReady) return
    if (selected.includes(id)) {
      setSelected(selected.filter(s => s !== id))
    } else if (selected.length < DECK_SIZE) {
      setSelected([...selected, id])
    }
  }

  // Sort: non-starters first, then starters
  const sortedDeck = [...deck].sort((a, b) => {
    const aStarter = a.weekKey.startsWith('STARTER') ? 1 : 0
    const bStarter = b.weekKey.startsWith('STARTER') ? 1 : 0
    return aStarter - bStarter
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '10px',
        color: 'var(--amiga-orange)',
        textAlign: 'center',
      }}>
        {isReady ? 'WAITING FOR OPPONENT...' : `SELECT ${DECK_SIZE} CARDS (${selected.length}/${DECK_SIZE})`}
      </div>

      {!isReady && (
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          textAlign: 'center',
          color: hasStarter || selected.length === 0 ? '#888' : '#FF4444',
        }}>
          {hasStarter
            ? 'MUST INCLUDE AT LEAST 1 STARTER CARD \u2713'
            : 'MUST INCLUDE AT LEAST 1 STARTER CARD \u2717'}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
        gap: '10px',
      }}>
        {sortedDeck.map((card) => {
          const isSelected = selected.includes(card.id)
          const order = selected.indexOf(card.id)
          const theme = getTypeTheme(card.heroType)
          const isStarter = card.weekKey.startsWith('STARTER')
          const types = card.heroType.split('/')

          return (
            <button
              key={card.id}
              onClick={() => toggleCard(card.id)}
              disabled={isReady}
              style={{
                background: isSelected
                  ? theme.gradient
                  : 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 50%, #111 100%)',
                border: `3px solid ${isSelected ? theme.border : isStarter ? '#8B7355' : '#444'}`,
                borderRadius: '10px',
                padding: '0',
                cursor: isReady ? 'default' : 'pointer',
                textAlign: 'left',
                position: 'relative',
                opacity: isReady ? 0.7 : 1,
                boxShadow: isSelected
                  ? `0 0 16px ${theme.glow}, inset 0 0 20px rgba(0,0,0,0.3)`
                  : 'inset 0 0 20px rgba(0,0,0,0.3)',
                overflow: 'hidden',
              }}
            >
              {/* Card top bar: name + HP */}
              <div style={{
                background: isSelected ? `${theme.border}33` : 'rgba(0,0,0,0.4)',
                padding: '6px 8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: `2px solid ${isSelected ? theme.border : '#333'}`,
              }}>
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '6px',
                  color: isSelected ? theme.accent : '#ccc',
                  textTransform: 'uppercase',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingRight: isSelected ? '24px' : 0,
                  textShadow: isSelected ? `0 0 6px ${theme.glow}` : 'none',
                }}>
                  {card.heroTitle}
                </div>
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color: '#FF4444',
                  whiteSpace: 'nowrap',
                  marginLeft: '4px',
                }}>
                  HP {card.hp}
                </div>
              </div>

              {/* Selection badge */}
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: theme.border,
                  color: '#000',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '8px',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  zIndex: 2,
                }}>
                  #{order + 1}
                </div>
              )}

              {/* Starter badge */}
              {isStarter && (
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  background: '#8B7355',
                  color: '#ffd700',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '5px',
                  padding: '2px 4px',
                  borderRadius: '8px',
                  zIndex: 2,
                }}>
                  ★
                </div>
              )}

              {/* Avatar frame — the main card art window */}
              <div style={{
                margin: '6px 8px',
                background: 'rgba(0,0,0,0.5)',
                border: `2px solid ${isSelected ? theme.border : '#333'}`,
                borderRadius: '4px',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                padding: '4px 0',
              }}>
                <PixelAvatar card={card} theme={theme} size={90} />
              </div>

              {/* Type badges */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '4px',
                marginBottom: '6px',
                padding: '0 8px',
              }}>
                {types.map((t, i) => {
                  const tTheme = getTypeTheme(t.trim())
                  return (
                    <span key={i} style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '5px',
                      color: tTheme.accent,
                      background: `${tTheme.border}22`,
                      border: `1px solid ${tTheme.border}55`,
                      borderRadius: '8px',
                      padding: '2px 6px',
                      textTransform: 'uppercase',
                    }}>
                      {t.trim()}
                    </span>
                  )
                })}
              </div>

              {/* Stats bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                padding: '4px 6px',
                margin: '0 8px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '4px',
                border: '1px solid #222',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: '#FF8800' }}>{card.attack}</div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#888' }}>ATK</div>
                </div>
                <div style={{ width: '1px', background: '#333' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: '#4488FF' }}>{card.defense}</div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#888' }}>DEF</div>
                </div>
                <div style={{ width: '1px', background: '#333' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: '#FFDD00' }}>{card.speed}</div>
                  <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '5px', color: '#888' }}>SPD</div>
                </div>
              </div>

              {/* Moves list */}
              <div style={{
                padding: '6px 8px 8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}>
                {card.specialMoves.map((m, i) => (
                  <div key={i} style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '5px',
                    color: '#999',
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '2px 4px',
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}>
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}>{m}</span>
                  </div>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {!isReady && (
        <button
          className="amiga-btn amiga-btn--primary amiga-btn--large"
          disabled={!canSubmit}
          onClick={() => onSubmit(selected)}
          style={{ alignSelf: 'center' }}
        >
          READY FOR BATTLE!
        </button>
      )}

      {isReady && (
        <div className="amiga-blink" style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '10px',
          color: 'var(--crt-amber)',
          textAlign: 'center',
        }}>
          WAITING FOR OPPONENT TO SELECT CARDS...
        </div>
      )}
    </div>
  )
}
