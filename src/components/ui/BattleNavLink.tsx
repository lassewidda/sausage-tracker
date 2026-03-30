'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useName } from '@/lib/useName'

function getCurrentWeekKey(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  const weekNum =
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    ) + 1
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

export function BattleNavLink() {
  const { name } = useName()
  const [showDot, setShowDot] = useState(false)

  useEffect(() => {
    if (!name) return
    let cancelled = false

    async function check() {
      try {
        const res = await fetch(`/api/hero-card?playerName=${encodeURIComponent(name)}`)
        if (!res.ok || cancelled) return
        const cards = await res.json()
        if (cancelled || !Array.isArray(cards)) return

        const hasNonStarter = cards.some((c: { weekKey: string }) => !c.weekKey.startsWith('STARTER'))
        const hasCurrentWeek = cards.some((c: { weekKey: string }) => c.weekKey === getCurrentWeekKey())

        setShowDot(hasNonStarter && !hasCurrentWeek)
      } catch { /* silent */ }
    }

    check()
    const interval = setInterval(check, 60000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [name])

  return (
    <Link href="/battle" className="amiga-menubar__item desktop-nav" style={{ position: 'relative' }}>
      BATTLE
      {showDot && (
        <span
          className="amiga-blink"
          style={{
            position: 'absolute',
            top: '-2px',
            right: '-6px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#FF0000',
            boxShadow: '0 0 4px #FF0000',
          }}
        />
      )}
    </Link>
  )
}
