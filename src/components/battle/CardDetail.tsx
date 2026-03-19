'use client'

import type { HeroCard } from '@/types'
import { PixelAvatar, getTypeTheme } from '@/components/player/HeroCardDisplay'
import { parseMoveDamage } from '@/lib/battleEngine'

interface Props {
  card: HeroCard
  onClose: () => void
}

export function CardDetail({ card, onClose }: Props) {
  const theme = getTypeTheme(card.heroType)
  const isStarter = card.weekKey.startsWith('STARTER')

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflowY: 'auto',
        padding: '24px 16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          width: '100%',
          maxWidth: '360px',
          animation: 'card-enter 0.3s steps(4)',
        }}
      >
        {/* Title */}
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '14px',
          color: theme.accent,
          textAlign: 'center',
          textShadow: `0 0 15px ${theme.glow}`,
        }}>
          {card.heroTitle.toUpperCase()}
        </div>

        {/* Type badge */}
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '10px',
          color: theme.accent,
          background: 'rgba(0,0,0,0.5)',
          padding: '6px 16px',
          borderRadius: '20px',
          border: `1px solid ${theme.border}`,
          textTransform: 'uppercase',
        }}>
          {isStarter ? `★ STARTER — ${card.heroType}` : card.heroType}
        </div>

        {/* Avatar */}
        <div style={{
          background: theme.gradient,
          border: `3px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '12px',
          boxShadow: `0 0 20px ${theme.glow}`,
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            <PixelAvatar card={card} theme={theme} size={120} />
          </div>
        </div>

        {/* Catchphrase */}
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '8px',
          color: 'var(--crt-amber)',
          textAlign: 'center',
          fontStyle: 'italic',
          padding: '0 16px',
        }}>
          &quot;{card.catchphrase}&quot;
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          width: '100%',
        }}>
          {[
            { label: 'HP', value: card.hp, color: '#FF4444', icon: '❤' },
            { label: 'ATK', value: card.attack, color: '#FF8800', icon: '⚔' },
            { label: 'DEF', value: card.defense, color: '#4488FF', icon: '🛡' },
            { label: 'SPD', value: card.speed, color: '#44DD44', icon: '⚡' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'rgba(0,0,0,0.4)',
              border: `2px solid ${stat.color}44`,
              borderRadius: '8px',
              padding: '10px 6px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>{stat.icon}</div>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '14px',
                color: stat.color,
                fontWeight: 'bold',
              }}>
                {stat.value}
              </div>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: '#888',
                marginTop: '2px',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Special moves */}
        <div style={{
          width: '100%',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          padding: '12px',
          border: `1px solid ${theme.border}33`,
        }}>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: theme.accent,
            marginBottom: '8px',
            textTransform: 'uppercase',
          }}>
            SPECIAL MOVES
          </div>
          {card.specialMoves.map((move, i) => {
            const parsed = parseMoveDamage(move)
            return (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                borderBottom: i < card.specialMoves.length - 1 ? '1px solid #333' : 'none',
              }}>
                <span style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '8px',
                  color: '#ccc',
                }}>
                  {parsed.name}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '7px',
                    color: '#FF8800',
                  }}>
                    {parsed.baseDamage} DMG
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '7px',
                    color: '#4488FF',
                  }}>
                    {parsed.maxPp} PP
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Weakness */}
        <div style={{
          width: '100%',
          background: 'rgba(255, 0, 0, 0.08)',
          borderRadius: '8px',
          padding: '10px 12px',
          border: '1px solid #FF444433',
        }}>
          <span style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: '#FF4444',
          }}>
            WEAKNESS:{' '}
          </span>
          <span style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: '#cc8888',
          }}>
            {card.weakness}
          </span>
        </div>

        {/* Flavor text */}
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '10px',
          lineHeight: '1.8',
          color: '#999',
          textAlign: 'center',
          fontStyle: 'italic',
          padding: '0 8px',
        }}>
          {card.flavorText}
        </div>

        {/* Close button */}
        <button
          className="amiga-btn amiga-btn--primary amiga-btn--large"
          onClick={onClose}
          style={{ fontSize: '10px', padding: '10px 32px', marginTop: '8px' }}
        >
          CLOSE
        </button>
      </div>
    </div>
  )
}
