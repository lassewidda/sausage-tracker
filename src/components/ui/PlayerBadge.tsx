'use client'

import { useName } from '@/lib/useName'

export function PlayerBadge() {
  const { name, loaded } = useName()
  if (!loaded || !name) return null

  return (
    <span style={{
      fontFamily: 'var(--font-pixel)',
      fontSize: '8px',
      color: 'var(--crt-amber)',
    }}>
      PLAYER: {name.toUpperCase()}
    </span>
  )
}
