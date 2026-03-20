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
  usedAt?: string | null
}

function getCooldownLabel(usedAt: string): string | null {
  const used = new Date(usedAt).getTime()
  const available = used + 3 * 24 * 60 * 60 * 1000
  const remaining = available - Date.now()
  if (remaining <= 0) return null
  const hours = Math.ceil(remaining / (60 * 60 * 1000))
  if (hours >= 24) {
    const days = Math.ceil(hours / 24)
    return `${days}d`
  }
  return `${hours}h`
}

export function ItemButton({ itemId, definition, disabled, onUse, usedAt }: Props) {
  const color = RARITY_COLORS[definition.rarity] ?? '#888'
  const cooldown = usedAt ? getCooldownLabel(usedAt) : null
  const onCooldown = cooldown !== null

  return (
    <button
      className="amiga-btn"
      disabled={disabled || onCooldown}
      onClick={() => onUse(itemId)}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        fontSize: '8px',
        padding: '4px 8px',
        opacity: (disabled || onCooldown) ? 0.35 : 1,
        gap: '8px',
        borderColor: onCooldown ? '#555' : color,
        borderWidth: '2px',
        flexWrap: 'wrap',
      }}
    >
      <ItemIcon itemKey={definition.itemKey} rarity={definition.rarity} size={28} />
      <span style={{ flex: 1, textAlign: 'left', color: onCooldown ? '#555' : color, minWidth: 0, overflowWrap: 'anywhere' }}>
        {definition.name}
      </span>
      {onCooldown ? (
        <span style={{ color: '#FF6666', fontSize: '7px', textAlign: 'right', flexShrink: 0 }}>
          COOLDOWN {cooldown}
        </span>
      ) : (
        <span style={{ color: '#aaa', fontSize: '7px', width: '100%', paddingLeft: '36px' }}>
          {definition.description}
        </span>
      )}
    </button>
  )
}
