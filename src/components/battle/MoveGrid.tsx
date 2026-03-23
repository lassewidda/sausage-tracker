'use client'

import { parseMoveDamage } from '@/lib/battleEngine'

interface Props {
  moves: string[]
  disabled: boolean
  getRemainingPp: (index: number) => number
  onMove: (index: number) => void
  onSwitchClick?: () => void
  allMovesEmpty: boolean
  showSwitch: boolean
}

function PpDots({ remaining, max }: { remaining: number; max: number }) {
  // Show max 8 dots, scale down for larger PP values
  const displayMax = Math.min(max, 8)
  const displayFilled = max <= 8 ? remaining : Math.round((remaining / max) * displayMax)

  return (
    <span className="move-cell__pp">
      {Array.from({ length: displayMax }, (_, i) => (
        <span key={i} className={`pp-dot${i >= displayFilled ? ' pp-dot--empty' : ''}`} />
      ))}
      <span style={{ marginLeft: '3px' }}>{remaining}/{max}</span>
    </span>
  )
}

export function MoveGrid({ moves, disabled, getRemainingPp, onMove, onSwitchClick, allMovesEmpty, showSwitch }: Props) {
  if (allMovesEmpty) {
    return (
      <div className="move-grid">
        <button
          className="move-cell"
          style={{ gridColumn: '1 / -1' }}
          disabled={disabled}
          onClick={() => onMove(0)}
        >
          <span className="move-cell__name">STRUGGLE</span>
          <span className="move-cell__damage" style={{ color: '#FF4444' }}>10 dmg (recoil!)</span>
        </button>
      </div>
    )
  }

  return (
    <div className="move-grid">
      {moves.map((move, i) => {
        const { name, baseDamage, maxPp } = parseMoveDamage(move)
        const remaining = getRemainingPp(i)
        const outOfPp = remaining <= 0
        const isDisabled = disabled || outOfPp

        return (
          <button
            key={i}
            className={`move-cell${isDisabled ? ' move-cell--disabled' : ''}`}
            disabled={isDisabled}
            onClick={() => onMove(i)}
          >
            <span className="move-cell__name">{name}</span>
            <span className="move-cell__damage">{baseDamage} dmg</span>
            <PpDots remaining={remaining} max={maxPp} />
          </button>
        )
      })}
      {showSwitch && (
        <button
          className="move-cell"
          disabled={disabled}
          onClick={onSwitchClick}
        >
          <span className="move-cell__name" style={{ fontSize: '8px' }}>⟳</span>
          <span className="move-cell__name">SWITCH</span>
          <span className="move-cell__pp" style={{ fontSize: '6px', color: '#888' }}>CARD</span>
        </button>
      )}
    </div>
  )
}
