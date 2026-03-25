'use client'

import { useState, useCallback } from 'react'
import theme from '@/theme'

const PRESET_TAUNTS = theme.strings.tauntPresets

interface Props {
  battleId: string
  playerName: string
}

export function TauntBar({ battleId, playerName }: Props) {
  const [text, setText] = useState('')
  const [cooldown, setCooldown] = useState(false)
  const [expanded, setExpanded] = useState(false)

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
      background: 'rgba(0,0,0,0.2)',
      borderRadius: '4px',
      border: '1px solid #333',
      overflow: 'hidden',
    }}>
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '6px 8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          color: '#888',
        }}
      >
        <span>TAUNT</span>
        <span style={{ fontSize: '8px' }}>{expanded ? '\u25B2' : '\u25BC'}</span>
      </button>

      {expanded && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          padding: '0 8px 8px',
        }}>
          {/* Preset taunts */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
          }}>
            {PRESET_TAUNTS.map((t) => (
              <button
                key={t.label}
                disabled={cooldown}
                onClick={() => send(t.text)}
                style={{
                  background: cooldown ? '#1a1a1a' : '#2a2a2a',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  minWidth: '40px',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: cooldown ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '10px',
                  color: cooldown ? '#555' : '#ccc',
                  opacity: cooldown ? 0.5 : 1,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Custom text input */}
          <div style={{ display: 'flex', gap: '6px' }}>
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
                borderRadius: '6px',
                padding: '8px 10px',
                fontFamily: 'var(--font-pixel)',
                fontSize: '10px',
                color: '#ccc',
                outline: 'none',
                minHeight: '40px',
              }}
            />
            <button
              disabled={cooldown || !text.trim()}
              onClick={() => send(text)}
              className="amiga-btn"
              style={{ fontSize: '10px', padding: '8px 12px', minHeight: '40px' }}
            >
              SEND
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
