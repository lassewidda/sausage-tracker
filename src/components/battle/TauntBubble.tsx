'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [current, setCurrent] = useState<VisibleTaunt | null>(null)
  const seenIds = useRef(new Set<string>())
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const removeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showTaunt = useCallback((taunt: BattleTaunt) => {
    // Clear any existing timers
    if (fadeTimer.current) clearTimeout(fadeTimer.current)
    if (removeTimer.current) clearTimeout(removeTimer.current)

    setCurrent({ ...taunt, fadeOut: false })

    fadeTimer.current = setTimeout(() => {
      setCurrent(prev => prev?.id === taunt.id ? { ...prev, fadeOut: true } : prev)
    }, 8000)

    removeTimer.current = setTimeout(() => {
      setCurrent(prev => prev?.id === taunt.id ? null : prev)
    }, 10000)
  }, [])

  useEffect(() => {
    // Find the newest taunt we haven't shown yet
    const newest = taunts.find(t => !seenIds.current.has(t.id))
    if (!newest) return

    // Mark all current taunts as seen
    for (const t of taunts) seenIds.current.add(t.id)

    showTaunt(newest)
  }, [taunts, showTaunt])

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current)
      if (removeTimer.current) clearTimeout(removeTimer.current)
    }
  }, [])

  if (!current) return null

  const isMe = current.playerName === playerName
  const isChallenger = current.playerName === challengerName
  const side = isChallenger ? 'left' : 'right'
  const isEmojiOnly = !/[a-zA-Z0-9]/.test(current.message) && current.message.trim().length > 0

  return (
    <div
      key={current.id}
      style={{
        position: 'absolute',
        [side]: '8px',
        top: '-8px',
        zIndex: 10,
        animation: current.fadeOut ? 'taunt-fade 2s forwards' : 'taunt-pop 0.3s steps(4)',
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
          {current.playerName}
        </div>
        <span style={isEmojiOnly ? { fontSize: '24px', lineHeight: '1.2' } : undefined}>{current.message}</span>
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
}
