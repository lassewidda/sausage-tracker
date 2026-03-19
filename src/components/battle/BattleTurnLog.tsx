'use client'

import { useRef, useEffect } from 'react'
import type { BattleTurn } from '@/types'

interface Props {
  turns: BattleTurn[]
}

export function BattleTurnLog({ turns }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [turns.length])

  return (
    <div
      ref={scrollRef}
      className="amiga-inset"
      style={{
        maxHeight: '150px',
        overflowY: 'auto',
        fontSize: '8px',
        fontFamily: 'var(--font-pixel)',
        lineHeight: '2',
      }}
    >
      {turns.length === 0 && (
        <div style={{ color: 'var(--amiga-grey)', textAlign: 'center' }}>
          BATTLE LOG...
        </div>
      )}
      {turns.map((turn) => (
        <div key={turn.id} style={{ color: 'var(--amiga-white)' }}>
          <span style={{ color: 'var(--crt-amber)' }}>{turn.attacker}</span>
          {' used '}
          <span style={{ color: 'var(--amiga-orange)' }}>{turn.moveUsed}</span>
          {'! '}
          <span style={{ color: '#FF4444' }}>{turn.damageDealt} dmg</span>
          {turn.typeMultiplier > 1 && (
            <span style={{ color: '#44CC44' }}> (super effective!)</span>
          )}
          {turn.typeMultiplier < 1 && (
            <span style={{ color: '#888' }}> (not very effective)</span>
          )}
          {turn.isKnockout && (
            <span style={{ color: '#FF4444' }}> KO!</span>
          )}
        </div>
      ))}
    </div>
  )
}
