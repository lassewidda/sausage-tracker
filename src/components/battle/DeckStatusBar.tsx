'use client'

import type { BattleDeckCard } from '@/types'
import { getTypeTheme, PixelAvatar } from '@/components/player/HeroCardDisplay'

interface Props {
  deck: BattleDeckCard[]
  align?: 'left' | 'right'
}

const frameColor = '#D4B96B'
const frameDark = '#8B7435'

export function DeckStatusBar({ deck, align = 'left' }: Props) {
  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      flexWrap: 'wrap',
    }}>
      {deck.map(dc => {
        if (!dc.card) return null
        const theme = getTypeTheme(dc.card.heroType)
        const isKo = dc.isKnockedOut
        const isActive = dc.isActive

        return (
          <div key={dc.id} style={{
            width: '36px',
            background: `linear-gradient(135deg, ${isKo ? '#333' : frameDark}, ${isKo ? '#444' : frameColor}, ${isKo ? '#333' : frameDark})`,
            borderRadius: '4px',
            padding: '2px',
            opacity: isKo ? 0.4 : 1,
            border: isActive ? '2px solid #FFD700' : '2px solid transparent',
            boxShadow: isActive ? '0 0 6px rgba(255, 215, 0, 0.4)' : 'none',
          }}>
            <div style={{
              background: isKo ? '#222' : theme.gradient,
              borderRadius: '2px',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <PixelAvatar card={dc.card} theme={theme} size={32} />
              {isKo && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.5)',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '10px',
                  color: '#FF4444',
                }}>
                  ✕
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
