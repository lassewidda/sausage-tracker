'use client'

import { useState, useEffect, useRef } from 'react'
import type { BattleTurn } from '@/types'

interface Props {
  turns: BattleTurn[]
}

export function CriticalHitOverlay({ turns }: Props) {
  const [visible, setVisible] = useState(false)
  const [attacker, setAttacker] = useState('')
  const [animKey, setAnimKey] = useState(0)
  const seenCount = useRef(0)

  useEffect(() => {
    if (turns.length > seenCount.current) {
      const newTurns = turns.slice(seenCount.current)
      seenCount.current = turns.length

      const critTurn = newTurns.find(t => t.isCritical)
      if (critTurn) {
        setAttacker(critTurn.attacker)
        setAnimKey(k => k + 1)
        setVisible(true)
        const timer = setTimeout(() => setVisible(false), 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [turns])

  if (!visible) return null

  return (
    <div key={animKey} style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      animation: 'crit-flash 1.5s steps(1) forwards',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        animation: 'crit-text-enter 1.5s ease-out forwards',
      }}>
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '28px',
          color: '#FF44FF',
          textShadow: '0 0 20px rgba(255, 68, 255, 0.9), 0 0 40px rgba(255, 68, 255, 0.5), 2px 2px 0 #000',
          textTransform: 'uppercase',
          letterSpacing: '4px',
          animation: 'crit-shake 0.15s steps(2) 4',
        }}>
          CRITICAL HIT!
        </div>
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '10px',
          color: '#FFaaFF',
          textShadow: '0 0 8px rgba(255, 68, 255, 0.6), 1px 1px 0 #000',
          textTransform: 'uppercase',
        }}>
          {attacker} lands a devastating blow!
        </div>
      </div>
    </div>
  )
}
