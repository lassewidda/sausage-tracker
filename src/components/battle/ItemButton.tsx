'use client'

import type { ItemDefinition } from '@/types'

const RARITY_COLORS: Record<string, string> = {
  common: '#888888',
  uncommon: '#4488FF',
  rare: '#FFD700',
}

interface Props {
  itemId: string
  definition: ItemDefinition
  disabled: boolean
  onUse: (itemId: string) => void
}

export function ItemButton({ itemId, definition, disabled, onUse }: Props) {
  const color = RARITY_COLORS[definition.rarity] ?? '#888'

  return (
    <button
      className="amiga-btn"
      disabled={disabled}
      onClick={() => onUse(itemId)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        fontSize: '8px',
        padding: '6px 10px',
        opacity: disabled ? 0.35 : 1,
        gap: '8px',
        borderColor: color,
        borderWidth: '2px',
      }}
    >
      <span style={{ flex: 1, textAlign: 'left', color }}>{definition.name}</span>
      <span style={{ color: '#aaa', fontSize: '7px', textAlign: 'right' }}>
        {definition.description}
      </span>
    </button>
  )
}
