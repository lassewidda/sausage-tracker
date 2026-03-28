'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useName } from '@/lib/useName'

export function NameSetter() {
  const { name, setName, loaded } = useName()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const router = useRouter()

  if (!loaded) return null

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draft.trim()) {
              setName(draft.trim())
              setEditing(false)
            }
            if (e.key === 'Escape') setEditing(false)
          }}
          maxLength={20}
          placeholder="YOUR NAME"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            textTransform: 'uppercase',
            background: 'var(--amiga-black)',
            color: 'var(--crt-amber)',
            border: '1px solid var(--crt-amber)',
            padding: '2px 6px',
            width: '120px',
            outline: 'none',
          }}
        />
        <button
          onClick={() => {
            if (draft.trim()) { setName(draft.trim()); setEditing(false) }
          }}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            background: 'var(--amiga-orange)',
            color: 'var(--amiga-white)',
            border: 'none',
            padding: '2px 6px',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          OK
        </button>
      </div>
    )
  }

  if (!name) {
    return (
      <button
        onClick={() => { setDraft(''); setEditing(true) }}
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          textTransform: 'uppercase',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#AA0000',
          padding: '0',
          letterSpacing: '1px',
          whiteSpace: 'nowrap',
        }}
      >
        [ SET NAME ]
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
      <button
        onClick={() => router.push(`/player/${encodeURIComponent(name)}`)}
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          textTransform: 'uppercase',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--crt-amber)',
          padding: '0',
          letterSpacing: '1px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '120px',
        }}
      >
        PLAYER: {name}
      </button>
      <button
        onClick={() => { setDraft(name); setEditing(true) }}
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--crt-amber)',
          padding: '0',
          opacity: 0.5,
        }}
        title="Change name"
      >
        ✎
      </button>
    </div>
  )
}
