'use client'

import type { ItemDefinition } from '@/types'
import { ItemIcon } from './ItemIcon'

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
        alignItems: 'center',
        width: '100%',
        fontSize: '8px',
        padding: '4px 8px',
        opacity: disabled ? 0.35 : 1,
        gap: '8px',
        borderColor: color,
        borderWidth: '2px',
      }}
    >
      <ItemIcon itemKey={definition.itemKey} rarity={definition.rarity} size={28} />
      <span style={{ flex: 1, textAlign: 'left', color }}>{definition.name}</span>
      <span style={{ color: '#aaa', fontSize: '7px', textAlign: 'right' }}>
        {definition.description}
      </span>
    </button>
  )
}
