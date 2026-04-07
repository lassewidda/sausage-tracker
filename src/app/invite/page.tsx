'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useName } from '@/lib/useName'

const IS_EXERCISE = process.env.NEXT_PUBLIC_THEME === 'exercise'

function ExerciseTransformationScene() {
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

    </div>
  )
}

function SausageTransformationScene() {
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
        {/* Raw → Grilled */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/char-raw-sausage.svg" alt="Raw sausage" style={{ height: '80px', imageRendering: 'pixelated' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/arrow-right.svg" alt="→" style={{ height: '16px', margin: '0 2px' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/char-grilled-sausage.svg" alt="Grilled sausage" style={{ height: '100px', imageRendering: 'pixelated' }} />
        </div>

        {/* Plain → Bratwurst King */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/char-plain-sausage.svg" alt="Plain sausage" style={{ height: '75px', imageRendering: 'pixelated' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/arrow-right.svg" alt="→" style={{ height: '16px', margin: '0 2px' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/char-bratwurst-king.svg" alt="Bratwurst King" style={{ height: '100px', imageRendering: 'pixelated' }} />
        </div>
      </div>

      {/* Hot dog mascot on its own row */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/char-hotdog.svg" alt="Hot dog" style={{ height: '80px', imageRendering: 'pixelated' }} />
    </div>
  )
}

function InviteBanner() {
  if (IS_EXERCISE) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #1A2744, #0D1520)',
        border: '2px solid rgba(74, 144, 217, 0.35)',
        borderRadius: '12px',
        padding: '24px 16px',
        textAlign: 'center',
        overflow: 'hidden',
        maxWidth: '100%',
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/char-mushroom.svg" alt="PowerUp mushroom" style={{ height: '80px', imageRendering: 'pixelated', margin: '8px 0' }} />
        <ExerciseTransformationScene />
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

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0055AA, #003366)',
      border: '2px solid rgba(255, 136, 0, 0.4)',
      borderRadius: '12px',
      padding: '24px 16px',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontFamily: "'Press Start 2P', 'Courier New', monospace",
        fontSize: 'clamp(22px, 6vw, 40px)',
        color: '#FF8800',
        textShadow: '0 0 10px rgba(255, 136, 0, 0.2)',
        margin: '0 0 8px',
        letterSpacing: '4px',
      }}>
        SAUSAGE TRACKER
      </h1>
      <div style={{
        fontFamily: "'Press Start 2P', 'Courier New', monospace",
        fontSize: 'clamp(8px, 2.5vw, 13px)',
        color: '#FFFFFF',
        letterSpacing: '3px',
        marginBottom: '8px',
      }}>
        THE ULTIMATE MEAT CHALLENGE
      </div>
      <SausageTransformationScene />
      <div style={{
        fontFamily: "'Press Start 2P', 'Courier New', monospace",
        fontSize: 'clamp(9px, 2.5vw, 14px)',
        color: '#FFFFFF',
        letterSpacing: '1px',
        lineHeight: '2.2',
      }}>
        Log meals · Count sausages · Become legend
      </div>
    </div>
  )
}

const ACCENT = IS_EXERCISE ? '#DD2222' : '#FF8800'
const CTA_RETURN = IS_EXERCISE ? 'LOG A WORKOUT' : 'LOG A MEAL'
const CTA_JOIN = IS_EXERCISE ? 'JOIN POWERUP!' : 'JOIN THE TRACKER!'
const CHECKBOX_TEXT = IS_EXERCISE ? "I'M READY TO POWERUP MY BOD!" : "I'M READY TO COUNT SOME SAUSAGES!"

export default function InvitePage() {
  const { name, setName, loaded } = useName()
  const router = useRouter()
  const [draft, setDraft] = useState('')
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState('')
  const [justJoined, setJustJoined] = useState(false)

  if (loaded && name) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        overflow: 'hidden',
        maxWidth: '100vw',
      }}>
        <InviteBanner />

        {justJoined && (
          <div style={{
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: 'clamp(11px, 3vw, 16px)',
            color: '#44CC44',
            marginTop: '24px',
            textAlign: 'center',
            letterSpacing: '2px',
            textShadow: '0 0 10px rgba(68, 204, 68, 0.4)',
          }}>
            🎉 YOU&apos;RE IN, {name.toUpperCase()}!
          </div>
        )}

        {!justJoined && (
          <div style={{
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: 'clamp(10px, 3vw, 14px)',
            color: 'var(--crt-amber)',
            marginTop: '24px',
            textAlign: 'center',
          }}>
            WELCOME BACK, {name.toUpperCase()}!
          </div>
        )}

        <div style={{
          fontFamily: "'Press Start 2P', 'Courier New', monospace",
          fontSize: 'clamp(8px, 2vw, 10px)',
          color: 'var(--amiga-dark-grey)',
          marginTop: '8px',
          textAlign: 'center',
          lineHeight: '2',
        }}>
          {justJoined ? 'SET UP YOUR PROFILE TO GET READY' : 'SET YOUR GOALS AND CONNECT SLACK'}
        </div>

        <button
          onClick={() => router.push(`/player/${encodeURIComponent(name)}`)}
          style={{
            fontFamily: "'Press Start 2P', 'Courier New', monospace",
            fontSize: 'clamp(12px, 3.5vw, 16px)',
            marginTop: '20px',
            padding: '18px 40px',
            background: ACCENT,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            letterSpacing: '3px',
            boxShadow: `0 0 20px ${ACCENT}66`,
          }}
        >
          GO TO MY PROFILE
        </button>
      </div>
    )
  }

  const handleJoin = () => {
    const trimmed = draft.trim()
    if (!trimmed) { setError('ENTER YOUR NAME!'); return }
    if (!checked) { setError('YOU MUST CHECK THE BOX!'); return }
    setName(trimmed)
    setJustJoined(true)
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
            style={{ width: '20px', height: '20px', accentColor: ACCENT, cursor: 'pointer' }}
          />
          {CHECKBOX_TEXT}
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
            background: checked && draft.trim() ? ACCENT : '#444',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '25px',
            cursor: checked && draft.trim() ? 'pointer' : 'not-allowed',
            letterSpacing: '3px',
            width: '100%',
            maxWidth: '320px',
          }}
        >
          {CTA_JOIN}
        </button>
      </div>
    </div>
  )
}
