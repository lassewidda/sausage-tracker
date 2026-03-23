'use client'

import type { BattleDeckCard } from '@/types'
import { PixelAvatar, getTypeTheme } from '@/components/player/HeroCardDisplay'

interface Props {
  deckCards: BattleDeckCard[]
  onSwitch?: (deckCardId: string) => void
  isSelecting?: boolean
}

export function BenchStrip({ deckCards, onSwitch, isSelecting }: Props) {
  return (
    <div className="bench-strip">
      {deckCards.map(dc => {
        const card = dc.card
        if (!card) return null

        const hpPct = Math.max(0, Math.round((dc.currentHp / card.hp) * 100))
        const hpColor = hpPct > 50 ? '#44CC44' : hpPct > 25 ? '#FFDD00' : '#FF4444'
        const theme = getTypeTheme(card.heroType)
        const canSelect = isSelecting && !dc.isKnockedOut && !dc.isActive && onSwitch

        let className = 'bench-card'
        if (dc.isActive) className += ' bench-card--active'
        if (dc.isKnockedOut) className += ' bench-card--ko'
        if (canSelect) className += ' bench-card--selectable'

        return (
          <div
            key={dc.id}
            className={className}
            style={{ borderColor: dc.isActive ? theme.border : undefined }}
            onClick={() => canSelect && onSwitch(dc.id)}
            title={card.heroTitle}
          >
            {dc.isKnockedOut && <span className="bench-card__ko-x">✕</span>}
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
