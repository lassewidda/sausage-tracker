'use client'

import { useState } from 'react'
import { useName } from '@/lib/useName'

interface Props {
  profileName: string
}

export function ChangeNameButton({ profileName }: Props) {
  const { name, setName } = useName()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  // Only show on your own profile
  if (!name || name.toLowerCase() !== profileName.toLowerCase()) return null

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px 0' }}>
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draft.trim()) {
              setName(draft.trim())
              setEditing(false)
              window.location.href = `/player/${encodeURIComponent(draft.trim().toLowerCase())}`
            }
            if (e.key === 'Escape') setEditing(false)
          }}
          maxLength={20}
          placeholder="NEW NAME"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            textTransform: 'uppercase',
            background: '#0a0a0a',
            color: 'var(--crt-amber)',
            border: '1px solid var(--crt-amber)',
            padding: '4px 8px',
            width: '140px',
            outline: 'none',
          }}
        />
        <button
          onClick={() => {
            if (draft.trim()) {
              setName(draft.trim())
              setEditing(false)
              window.location.href = `/player/${encodeURIComponent(draft.trim().toLowerCase())}`
            }
          }}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            background: 'var(--amiga-orange, #FF8800)',
            color: '#fff',
            border: 'none',
            padding: '4px 8px',
            cursor: 'pointer',
          }}
        >
          SAVE
        </button>
        <button
          onClick={() => setEditing(false)}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            background: 'transparent',
            color: '#666',
            border: '1px solid #444',
            padding: '4px 8px',
            cursor: 'pointer',
          }}
        >
          CANCEL
        </button>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center', padding: '4px 0' }}>
      <button
        onClick={() => { setDraft(name); setEditing(true) }}
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          background: 'transparent',
          border: 'none',
          color: '#666',
          cursor: 'pointer',
        }}
      >
        ✎ CHANGE NAME
      </button>
    </div>
  )
}
