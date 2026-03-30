'use client'

import { parseMoveDamage } from '@/lib/battleEngine'

interface Props {
  move: string
  index: number
  disabled: boolean
  remainingPp: number
  onCooldown: boolean
  onUse: (index: number) => void
}

export function MoveButton({ move, index, disabled, remainingPp, onCooldown, onUse }: Props) {
  const { name, baseDamage, maxPp } = parseMoveDamage(move)
  const outOfPp = remainingPp <= 0
  const isDisabled = disabled || outOfPp || onCooldown

  const accuracyPct = baseDamage >= 40 ? 75 : baseDamage >= 25 ? 90 : 100
  const accuracyColor = baseDamage >= 40 ? '#FF4444' : baseDamage >= 25 ? '#FFDD00' : '#44FF44'

  return (
    <button
      className="amiga-btn"
      disabled={isDisabled}
      onClick={() => onUse(index)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        fontSize: '8px',
        padding: '6px 10px',
        opacity: isDisabled ? 0.35 : 1,
        gap: '8px',
      }}
    >
      <span style={{ flex: 1, textAlign: 'left' }}>{name}</span>
      <span style={{ color: 'var(--crt-amber)', minWidth: '24px', textAlign: 'center' }}>
        {baseDamage}
      </span>
      <span style={{ color: accuracyColor, minWidth: '28px', textAlign: 'center', fontSize: '7px' }}>
        {accuracyPct}%
      </span>
      <span style={{
        color: onCooldown ? '#FF4444' : outOfPp ? '#FF4444' : remainingPp <= 2 ? '#FFDD00' : '#888',
        minWidth: '40px',
        textAlign: 'right',
        fontSize: '7px',
      }}>
        {onCooldown ? '⏳ CD' : `PP ${remainingPp}/${maxPp}`}
      </span>
    </button>
  )
}
