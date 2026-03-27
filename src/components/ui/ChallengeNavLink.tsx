'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useName } from '@/lib/useName'

export function ChallengeNavLink() {
  const { name } = useName()
  const [showDot, setShowDot] = useState(false)

  useEffect(() => {
    if (!name) return
    let cancelled = false

    async function check() {
      try {
        const res = await fetch('/api/challenge')
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (cancelled) return

        // No active challenge = no dot
        if (!data.challenge) { setShowDot(false); return }

        // Find this player in participants
        const me = data.participants?.find(
          (p: { playerName: string }) => p.playerName === name.toLowerCase()
        )

        // Show dot if challenge exists and player hasn't completed it
        setShowDot(!me?.isComplete)
      } catch { /* silent */ }
    }

    check()
    const interval = setInterval(check, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [name])

  return (
    <Link href="/challenge" className="amiga-menubar__item" style={{ position: 'relative' }}>
      CHALLENGE
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
