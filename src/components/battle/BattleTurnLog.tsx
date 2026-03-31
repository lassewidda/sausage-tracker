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
        overflowX: 'hidden',
        fontSize: '8px',
        fontFamily: 'var(--font-pixel)',
        lineHeight: '2',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
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
          {turn.moveUsed === 'SWITCH' ? (
            <span style={{ color: '#FFDD00' }}> switched cards!</span>
          ) : turn.itemUsed ? (
            <>
              {' used '}
              <span style={{ color: '#44DDFF' }}>{turn.itemUsed.replace(/_/g, ' ')}</span>
              {'! '}
              <span style={{ color: '#88CCFF' }}>{turn.itemEffect}</span>
            </>
          ) : turn.isGuard ? (
            <>
              <span style={{ color: '#4488FF' }}> raises their guard!</span>
            </>
          ) : turn.isMiss ? (
            <>
              {' used '}
              <span style={{ color: 'var(--amiga-orange)' }}>{turn.moveUsed}</span>
              {' but '}
              <span style={{ color: '#FFDD00' }}>MISSED!</span>
            </>
          ) : (
            <>
              {' used '}
              <span style={{ color: 'var(--amiga-orange)' }}>{turn.moveUsed}</span>
              {'! '}
              <span style={{ color: turn.isCritical ? '#FF44FF' : '#FF4444' }}>{turn.damageDealt} dmg</span>
              {turn.isCritical && (
                <span style={{ color: '#FF44FF', textShadow: '0 0 6px rgba(255, 68, 255, 0.8)' }}> CRITICAL HIT!</span>
              )}
              {turn.typeMultiplier > 1 && (
                <span style={{ color: '#44CC44' }}> (super effective!)</span>
              )}
              {turn.typeMultiplier < 1 && (
                <span style={{ color: '#888' }}> (not very effective)</span>
              )}
            </>
          )}
          {turn.isKnockout && (
            <span style={{ color: '#FF4444' }}> KO!</span>
          )}
        </div>
      ))}
    </div>
  )
}
