'use client'

import { parseMoveDamage } from '@/lib/battleEngine'

interface Props {
  move: string
  index: number
  disabled: boolean
  onUse: (index: number) => void
}

export function MoveButton({ move, index, disabled, onUse }: Props) {
  const { name, baseDamage } = parseMoveDamage(move)

  return (
    <button
      className="amiga-btn"
      disabled={disabled}
      onClick={() => onUse(index)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        fontSize: '8px',
        padding: '6px 10px',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span>{name}</span>
      <span style={{ color: 'var(--crt-amber)' }}>{baseDamage}</span>
    </button>
  )
}
