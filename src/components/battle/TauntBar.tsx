'use client'

import { useState, useCallback } from 'react'

const PRESET_TAUNTS = [
  { label: '🌭', text: '🌭' },
  { label: '🔥', text: '🔥🔥🔥' },
  { label: '💀', text: '💀' },
  { label: '😂', text: '😂' },
  { label: '🍖', text: '🍖' },
  { label: '💩', text: '💩' },
  { label: 'GG', text: 'GG!' },
  { label: 'RIP', text: 'R.I.P. your sausage' },
  { label: 'WOW', text: 'WOW what a move!' },
  { label: 'OOF', text: 'OOF that hurt...' },
  { label: '???', text: 'What are you doing?!' },
  { label: 'YUM', text: 'Mmm tasty sausage!' },
]

interface Props {
  battleId: string
  playerName: string
}

export function TauntBar({ battleId, playerName }: Props) {
  const [text, setText] = useState('')
  const [cooldown, setCooldown] = useState(false)

  const send = useCallback(async (message: string) => {
    if (cooldown || !message.trim()) return
    setCooldown(true)
    setText('')
    try {
      await fetch(`/api/battle/${battleId}/taunt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, message: message.trim() }),
      })
    } catch { /* ignore */ }
    setTimeout(() => setCooldown(false), 2500)
  }, [battleId, playerName, cooldown])

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: '8px',
      background: 'rgba(0,0,0,0.2)',
      borderRadius: '4px',
      border: '1px solid #333',
    }}>
      {/* Preset taunts */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
      }}>
        {PRESET_TAUNTS.map((t) => (
          <button
            key={t.label}
            disabled={cooldown}
            onClick={() => send(t.text)}
            style={{
              background: cooldown ? '#1a1a1a' : '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '4px',
              padding: '3px 6px',
              cursor: cooldown ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: cooldown ? '#555' : '#ccc',
              opacity: cooldown ? 0.5 : 1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Custom text input */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 80))}
          onKeyDown={(e) => { if (e.key === 'Enter') send(text) }}
          placeholder="TYPE A TAUNT..."
          disabled={cooldown}
          style={{
            flex: 1,
            background: '#0a0a0a',
            border: '1px solid #444',
            borderRadius: '4px',
            padding: '4px 8px',
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: '#ccc',
            outline: 'none',
          }}
        />
        <button
          disabled={cooldown || !text.trim()}
          onClick={() => send(text)}
          className="amiga-btn"
          style={{ fontSize: '7px', padding: '4px 8px' }}
        >
          SEND
        </button>
      </div>
    </div>
  )
}
