'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useName } from '@/lib/useName'

export default function InvitePage() {
  const { name, setName, loaded } = useName()
  const router = useRouter()
  const [draft, setDraft] = useState('')
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState('')

  // Already has a name — show welcome back
  if (loaded && name) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/powerup-invite.svg"
          alt="PowerUp Exercise Challenge"
          onClick={() => router.push('/')}
          style={{
            width: '100%',
            cursor: 'pointer',
            borderRadius: '12px',
          }}
        />
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '11px',
          color: 'var(--crt-amber)',
          marginTop: '20px',
          textAlign: 'center',
        }}>
          WELCOME BACK, {name.toUpperCase()}!
        </div>
        <button
          onClick={() => router.push('/')}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '12px',
            marginTop: '16px',
            padding: '14px 32px',
            background: '#DD2222',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            letterSpacing: '2px',
          }}
        >
          LOG A WORKOUT
        </button>
      </div>
    )
  }

  const handleJoin = () => {
    const trimmed = draft.trim()
    if (!trimmed) {
      setError('ENTER YOUR NAME!')
      return
    }
    if (!checked) {
      setError('YOU MUST CHECK THE BOX!')
      return
    }
    setName(trimmed)
    router.push('/')
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '16px',
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/powerup-invite.svg"
        alt="PowerUp Exercise Challenge"
        style={{
          width: '100%',
          borderRadius: '12px',
        }}
      />

      {/* Join form */}
      <div style={{
        marginTop: '24px',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '12px',
          color: 'var(--crt-amber)',
          textAlign: 'center',
          letterSpacing: '2px',
        }}>
          ENTER YOUR NAME TO JOIN
        </div>

        <input
          type="text"
          value={draft}
          onChange={(e) => { setDraft(e.target.value); setError('') }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleJoin() }}
          maxLength={20}
          placeholder="YOUR NAME"
          autoFocus
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '14px',
            textTransform: 'uppercase',
            background: '#0a0a0a',
            color: 'var(--crt-amber)',
            border: '2px solid var(--crt-amber)',
            padding: '12px 16px',
            width: '100%',
            outline: 'none',
            textAlign: 'center',
            borderRadius: '6px',
            letterSpacing: '2px',
          }}
        />

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          fontFamily: 'var(--font-pixel)',
          fontSize: '9px',
          color: checked ? '#FFD700' : 'var(--crt-amber)',
        }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => { setChecked(e.target.checked); setError('') }}
            style={{
              width: '20px',
              height: '20px',
              accentColor: '#DD2222',
              cursor: 'pointer',
            }}
          />
          I&apos;M READY TO POWERUP MY BOD!
        </label>

        {error && (
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            color: '#FF4444',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <button
          onClick={handleJoin}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '14px',
            padding: '14px 40px',
            background: checked && draft.trim() ? '#DD2222' : '#444',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '25px',
            cursor: checked && draft.trim() ? 'pointer' : 'not-allowed',
            letterSpacing: '3px',
            transition: 'background 0.2s',
            width: '100%',
            maxWidth: '320px',
          }}
        >
          JOIN POWERUP!
        </button>
      </div>
    </div>
  )
}
