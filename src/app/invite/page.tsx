'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useName } from '@/lib/useName'

function TransformationScene() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      padding: '16px 0',
    }}>
      {/* Transformations row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        {/* Skinny → Arnold */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/char-skinny.svg" alt="Before" style={{ height: '80px', imageRendering: 'pixelated' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/arrow-right.svg" alt="→" style={{ height: '16px', margin: '0 2px' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/char-arnold.svg" alt="After - muscle" style={{ height: '100px', imageRendering: 'pixelated' }} />
        </div>

        {/* Sleepy → Runner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/char-sleepy.svg" alt="Before" style={{ height: '75px', imageRendering: 'pixelated' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/arrow-right.svg" alt="→" style={{ height: '16px', margin: '0 2px' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/char-runner.svg" alt="After - runner" style={{ height: '90px', imageRendering: 'pixelated' }} />
        </div>
      </div>

      {/* Mushroom on its own row */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/char-mushroom.svg" alt="PowerUp mushroom" style={{ height: '80px', imageRendering: 'pixelated' }} />
    </div>
  )
}

function InviteBanner() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #1A2744, #0D1520)',
      border: '2px solid rgba(74, 144, 217, 0.35)',
      borderRadius: '12px',
      padding: '24px 16px',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontFamily: "'Press Start 2P', 'Courier New', monospace",
        fontSize: 'clamp(28px, 8vw, 48px)',
        color: '#FFD700',
        textShadow: '0 0 10px rgba(255, 215, 0, 0.2)',
        margin: '0 0 8px',
        letterSpacing: '4px',
      }}>
        POWERUP
      </h1>
      <div style={{
        fontFamily: "'Press Start 2P', 'Courier New', monospace",
        fontSize: 'clamp(8px, 2.5vw, 13px)',
        color: '#5AA0E8',
        letterSpacing: '3px',
        marginBottom: '8px',
      }}>
        EXERCISE CHALLENGE
      </div>

      <TransformationScene />

      <div style={{
        fontFamily: "'Press Start 2P', 'Courier New', monospace",
        fontSize: 'clamp(9px, 2.5vw, 14px)',
        color: '#CCDDEE',
        letterSpacing: '1px',
        lineHeight: '2.2',
      }}>
        Log workouts &gt; Complete challenges &gt; PowerUp!
      </div>
    </div>
  )
}

export default function InvitePage() {
  const { name, setName, loaded } = useName()
  const router = useRouter()
  const [draft, setDraft] = useState('')
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState('')

  if (loaded && name) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
      }}>
        <InviteBanner />
        <div style={{
          fontFamily: "'Press Start 2P', 'Courier New', monospace",
          fontSize: 'clamp(10px, 3vw, 14px)',
          color: 'var(--crt-amber)',
          marginTop: '24px',
          textAlign: 'center',
        }}>
          WELCOME BACK, {name.toUpperCase()}!
        </div>
        <button
          onClick={() => router.push('/')}
          style={{
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: 'clamp(11px, 3vw, 14px)',
            marginTop: '16px',
            padding: '16px 32px',
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
    if (!trimmed) { setError('ENTER YOUR NAME!'); return }
    if (!checked) { setError('YOU MUST CHECK THE BOX!'); return }
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
      <InviteBanner />

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
          fontFamily: "'Press Start 2P', 'Courier New', monospace",
          fontSize: 'clamp(10px, 3vw, 14px)',
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
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
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
          fontFamily: "'Press Start 2P', 'Courier New', monospace",
          fontSize: 'clamp(8px, 2vw, 10px)',
          color: checked ? '#FFD700' : 'var(--crt-amber)',
        }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => { setChecked(e.target.checked); setError('') }}
            style={{ width: '20px', height: '20px', accentColor: '#DD2222', cursor: 'pointer' }}
          />
          I&apos;M READY TO POWERUP MY BOD!
        </label>

        {error && (
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
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
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: 'clamp(11px, 3vw, 14px)',
            padding: '16px 40px',
            background: checked && draft.trim() ? '#DD2222' : '#444',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '25px',
            cursor: checked && draft.trim() ? 'pointer' : 'not-allowed',
            letterSpacing: '3px',
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
