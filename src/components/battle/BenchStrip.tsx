'use client'

import type { BattleDeckCard, HeroCard } from '@/types'
import { PixelAvatar, getTypeTheme } from '@/components/player/HeroCardDisplay'
import { getTypeMatchupMultiplier } from '@/lib/battleEngine'

interface Props {
  deckCards: BattleDeckCard[]
  onSwitch?: (deckCardId: string) => void
  onInspect?: (card: HeroCard) => void
  isSelecting?: boolean
  opponentCard?: HeroCard | null
}

export function BenchStrip({ deckCards, onSwitch, onInspect, isSelecting, opponentCard }: Props) {
  return (
    <div className="bench-strip">
      {deckCards.map(dc => {
        const card = dc.card
        if (!card) return null

        const hpPct = Math.max(0, Math.round((dc.currentHp / card.hp) * 100))
        const hpColor = hpPct > 50 ? '#44CC44' : hpPct > 25 ? '#FFDD00' : '#FF4444'
        const theme = getTypeTheme(card.heroType)
        const canSelect = isSelecting && !dc.isKnockedOut && !dc.isActive && onSwitch

        // Type advantage indicator
        const matchup = !dc.isKnockedOut && !dc.isActive && opponentCard && card
          ? getTypeMatchupMultiplier(card.heroType, opponentCard.heroType) : null
        const matchupColor = matchup !== null
          ? (matchup >= 1.5 ? '#44FF44' : matchup > 1.0 ? '#88CC44' : matchup < 0.75 ? '#FF4444' : matchup < 1.0 ? '#FF8844' : null)
          : null

        let className = 'bench-card'
        if (dc.isActive) className += ' bench-card--active'
        if (dc.isKnockedOut) className += ' bench-card--ko'
        if (canSelect) className += ' bench-card--selectable'
        if (onInspect && !canSelect) className += ' bench-card--selectable'

        return (
          <div
            key={dc.id}
            className={className}
            style={{ borderColor: dc.isActive ? theme.border : matchupColor ?? undefined, boxShadow: matchupColor ? `0 0 4px ${matchupColor}44` : undefined }}
            onClick={() => {
              if (canSelect) { onSwitch(dc.id) }
              else if (onInspect) { onInspect(card) }
            }}
            title={card.heroTitle}
          >
            {dc.isKnockedOut && <span className="bench-card__ko-x">✕</span>}
            {matchupColor && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-3px',
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: matchupColor,
                textShadow: '0 0 3px rgba(0,0,0,0.8)',
                zIndex: 2,
                lineHeight: 1,
              }}>
                {matchup! >= 1.0 ? '▲' : '▼'}
              </span>
            )}
            <PixelAvatar card={card} theme={theme} size={28} />
            <div className="bench-card__hp-bar">
              <div
                className="bench-card__hp-fill"
                style={{ width: `${hpPct}%`, background: hpColor }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
