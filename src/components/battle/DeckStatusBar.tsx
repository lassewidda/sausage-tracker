'use client'

import type { BattleDeckCard, HeroCard } from '@/types'
import { getTypeTheme, PixelAvatar } from '@/components/player/HeroCardDisplay'
import { getTypeMatchupMultiplier } from '@/lib/battleEngine'

interface Props {
  deck: BattleDeckCard[]
  align?: 'left' | 'right'
  opponentCard?: HeroCard | null
}

const frameColor = '#D4B96B'
const frameDark = '#8B7435'

function getMatchupIndicator(card: HeroCard, opponentCard: HeroCard): { color: string; symbol: string } | null {
  const myMult = getTypeMatchupMultiplier(card.heroType, opponentCard.heroType)
  if (myMult >= 1.5) return { color: '#44FF44', symbol: '▲' }
  if (myMult > 1.0) return { color: '#88CC44', symbol: '▲' }
  if (myMult < 0.75) return { color: '#FF4444', symbol: '▼' }
  if (myMult < 1.0) return { color: '#FF8844', symbol: '▼' }
  return null
}

export function DeckStatusBar({ deck, align = 'left', opponentCard }: Props) {
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
        const matchup = !isKo && !isActive && opponentCard && dc.card
          ? getMatchupIndicator(dc.card, opponentCard)
          : null

        return (
          <div key={dc.id} style={{
            width: '36px',
            background: `linear-gradient(135deg, ${isKo ? '#333' : frameDark}, ${isKo ? '#444' : frameColor}, ${isKo ? '#333' : frameDark})`,
            borderRadius: '4px',
            padding: '2px',
            opacity: isKo ? 0.4 : 1,
            border: isActive ? '2px solid #FFD700' : matchup ? `2px solid ${matchup.color}` : '2px solid transparent',
            boxShadow: isActive ? '0 0 6px rgba(255, 215, 0, 0.4)' : matchup ? `0 0 4px ${matchup.color}44` : 'none',
            position: 'relative',
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
            {matchup && (
              <div style={{
                position: 'absolute',
                top: '-6px',
                right: '-4px',
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                color: matchup.color,
                textShadow: '0 0 3px rgba(0,0,0,0.8)',
                lineHeight: 1,
              }}>
                {matchup.symbol}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
