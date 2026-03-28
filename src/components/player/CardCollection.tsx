'use client'

import { useState } from 'react'
import type { HeroCard } from '@/types'
import { PixelAvatar, getTypeTheme } from './HeroCardDisplay'
import { CardDetail } from '@/components/battle/CardDetail'

const frameColor = '#D4B96B'
const frameDark = '#8B7435'

function MiniCard({ card, onClick }: { card: HeroCard; onClick: () => void }) {
  const theme = getTypeTheme(card.heroType)

  return (
    <button
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${frameColor}, #F0E68C, ${frameColor}, ${frameDark})`,
        borderRadius: '8px',
        padding: '3px',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'transform 0.1s',
      }}
    >
      <div style={{
        background: '#1a1a2e',
        borderRadius: '6px',
        overflow: 'hidden',
        padding: '6px',
        width: '130px',
      }}>
        {/* Name */}
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '6px',
          color: '#FFFFFF',
          textAlign: 'center',
          marginBottom: '4px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }} title={card.heroTitle}>
          {card.weekKey.startsWith('STARTER') && (
            <span style={{ color: '#ffd700', marginRight: '2px' }}>★</span>
          )}
          {card.heroTitle}
        </div>

        {/* Avatar in frame */}
        <div style={{
          padding: '2px',
          background: `linear-gradient(135deg, ${frameDark}, ${frameColor}, ${frameDark})`,
          borderRadius: '3px',
          marginBottom: '4px',
        }}>
          <div style={{
            background: theme.gradient,
            borderRadius: '2px',
            display: 'flex',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            <PixelAvatar card={card} theme={theme} size={60} />
          </div>
        </div>

        {/* Type */}
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '5px',
          color: frameColor,
          textAlign: 'center',
          marginBottom: '3px',
          textTransform: 'uppercase',
        }}>
          {card.heroType}
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          background: '#111122',
          borderRadius: '2px',
          padding: '3px 2px',
          border: '1px solid #333',
        }}>
          {[
            { label: 'HP', value: card.hp, color: '#FF4444' },
            { label: 'ATK', value: card.attack, color: '#FF8800' },
            { label: 'DEF', value: card.defense, color: '#4488FF' },
            { label: 'SPD', value: card.speed, color: '#44CC44' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '4px', color: s.color }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#FFFFFF' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </button>
  )
}

interface Props {
  cards: HeroCard[]
}

export function CardCollection({ cards }: Props) {
  const [selectedCard, setSelectedCard] = useState<HeroCard | null>(null)

  if (cards.length === 0) {
    return (
      <div style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '9px',
        color: '#666',
        textAlign: 'center',
        padding: '16px',
      }}>
        NO CARDS YET
      </div>
    )
  }

  return (
    <>
      {selectedCard && (
        <CardDetail card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '8px',
        justifyContent: 'center',
      }}>
        {cards.map(card => (
          <MiniCard key={card.id} card={card} onClick={() => setSelectedCard(card)} />
        ))}
      </div>
    </>
  )
}
