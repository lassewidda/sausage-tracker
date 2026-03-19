'use client'

import { parseMoveDamage } from '@/lib/battleEngine'

interface Props {
  move: string
  index: number
  disabled: boolean
  remainingPp: number
  onUse: (index: number) => void
}

export function MoveButton({ move, index, disabled, remainingPp, onUse }: Props) {
  const { name, baseDamage, maxPp } = parseMoveDamage(move)
  const outOfPp = remainingPp <= 0
  const isDisabled = disabled || outOfPp

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
      <span style={{
        color: outOfPp ? '#FF4444' : remainingPp <= 2 ? '#FFDD00' : '#888',
        minWidth: '40px',
        textAlign: 'right',
        fontSize: '7px',
      }}>
        PP {remainingPp}/{maxPp}
      </span>
    </button>
  )
}
