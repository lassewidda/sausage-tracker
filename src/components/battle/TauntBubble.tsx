'use client'

import { useState, useEffect, useRef } from 'react'
import type { BattleTaunt } from '@/types'

interface Props {
  taunts: BattleTaunt[]
  playerName: string
  challengerName: string
}

interface VisibleTaunt extends BattleTaunt {
  fadeOut: boolean
}

export function TauntBubble({ taunts, playerName, challengerName }: Props) {
  const [visible, setVisible] = useState<VisibleTaunt[]>([])
  const seenIds = useRef(new Set<string>())

  useEffect(() => {
    // Add new taunts we haven't seen yet
    const newTaunts = taunts.filter(t => !seenIds.current.has(t.id))
    if (newTaunts.length === 0) return

    for (const t of newTaunts) {
      seenIds.current.add(t.id)
    }

    setVisible(prev => [
      ...prev,
      ...newTaunts.map(t => ({ ...t, fadeOut: false })),
    ])

    // Start fade out after 4 seconds, remove after 5
    const fadeTimer = setTimeout(() => {
      setVisible(prev =>
        prev.map(v =>
          newTaunts.some(n => n.id === v.id) ? { ...v, fadeOut: true } : v
        )
      )
    }, 4000)

    const removeTimer = setTimeout(() => {
      const ids = new Set(newTaunts.map(n => n.id))
      setVisible(prev => prev.filter(v => !ids.has(v.id)))
    }, 5000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [taunts])

  if (visible.length === 0) return null

  return (
    <>
      {visible.map(taunt => {
        const isMe = taunt.playerName === playerName
        const isChallenger = taunt.playerName === challengerName
        // Position: challenger/left side, opponent/right side
        const side = isChallenger ? 'left' : 'right'

        return (
          <div
            key={taunt.id}
            style={{
              position: 'absolute',
              [side]: '8px',
              top: '-8px',
              zIndex: 10,
              animation: taunt.fadeOut ? 'taunt-fade 1s forwards' : 'taunt-pop 0.3s steps(4)',
              maxWidth: '140px',
            }}
          >
            <div style={{
              background: isMe ? '#FF8800' : '#44AAFF',
              color: '#000',
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              padding: '6px 8px',
              borderRadius: '8px',
              position: 'relative',
              boxShadow: `0 0 8px ${isMe ? 'rgba(255,136,0,0.4)' : 'rgba(68,170,255,0.4)'}`,
              wordBreak: 'break-word',
            }}>
              <div style={{
                fontSize: '6px',
                fontWeight: 'bold',
                marginBottom: '2px',
                textTransform: 'uppercase',
                opacity: 0.7,
              }}>
                {taunt.playerName}
              </div>
              {taunt.message}
              {/* Speech bubble tail */}
              <div style={{
                position: 'absolute',
                bottom: '-6px',
                [side === 'left' ? 'left' : 'right']: '12px',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: `6px solid ${isMe ? '#FF8800' : '#44AAFF'}`,
              }} />
            </div>
          </div>
        )
      })}
    </>
  )
}
