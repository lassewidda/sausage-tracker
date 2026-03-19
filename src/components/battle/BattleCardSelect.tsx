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
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: '8px',
      }}>
        {sortedDeck.map((card) => {
          const isSelected = selected.includes(card.id)
          const order = selected.indexOf(card.id)
          const theme = getTypeTheme(card.heroType)
          const isStarter = card.weekKey.startsWith('STARTER')

          return (
            <button
              key={card.id}
              onClick={() => toggleCard(card.id)}
              disabled={isReady}
              style={{
                background: isSelected
                  ? theme.gradient
                  : 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
                border: `2px solid ${isSelected ? theme.border : isStarter ? '#666' : '#333'}`,
                borderRadius: '6px',
                padding: '8px',
                cursor: isReady ? 'default' : 'pointer',
                textAlign: 'left',
                position: 'relative',
                opacity: isReady ? 0.7 : 1,
                boxShadow: isSelected ? `0 0 10px ${theme.glow}` : 'none',
              }}
            >
              {/* Starter badge */}
              {isStarter && (
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
                  borderRadius: '2px',
                  fontWeight: 'bold',
                  zIndex: 2,
                }}>
                  #{order + 1}
                </div>
              )}

              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: theme.accent,
                textTransform: 'uppercase',
                marginBottom: '4px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                paddingRight: isSelected ? '30px' : 0,
                paddingLeft: isStarter ? '16px' : 0,
                textShadow: `0 0 6px ${theme.glow}`,
              }}>
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
                border: `1px solid ${theme.border}33`,
              }}>
                <PixelAvatar card={card} theme={theme} size={64} />
              </div>

              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: theme.accent,
                textTransform: 'uppercase',
                marginBottom: '4px',
                opacity: 0.7,
              }}>
                {card.heroType}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: '#aaa',
              }}>
                <span style={{ color: '#FF4444' }}>HP {card.hp}</span>
                <span>ATK {card.attack}</span>
                <span>DEF {card.defense}</span>
                <span>SPD {card.speed}</span>
              </div>

              <div style={{
                marginTop: '4px',
                fontFamily: 'var(--font-pixel)',
                fontSize: '5px',
                color: '#666',
              }}>
                {card.specialMoves.map((m, i) => (
                  <div key={i} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m}
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
