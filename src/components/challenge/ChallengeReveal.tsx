'use client'

import { useState, useEffect } from 'react'
import type { WeeklyChallenge } from '@/types'

const IS_EXERCISE = process.env.NEXT_PUBLIC_THEME === 'exercise'
const TYPE_LABELS: Record<string, string> = { cardio: 'CARDIO', strength: 'STRENGTH' }

interface ChallengeRevealProps {
  challenge: WeeklyChallenge
  onDismiss: () => void
}

/* Pixel-art treasure chest SVG */
function ChestSVG({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 120 100"
      width="240"
      height="200"
      style={{ imageRendering: 'pixelated', display: 'block' }}
    >
      {/* Chest body */}
      <rect x="10" y="45" width="100" height="50" fill="#8B4513" />
      <rect x="12" y="47" width="96" height="46" fill="#A0522D" />
      {/* Wood grain lines */}
      <line x1="12" y1="60" x2="108" y2="60" stroke="#8B4513" strokeWidth="1" />
      <line x1="12" y1="75" x2="108" y2="75" stroke="#8B4513" strokeWidth="1" />
      {/* Gold trim on body */}
      <rect x="10" y="43" width="100" height="4" fill="#DAA520" />
      <rect x="10" y="93" width="100" height="4" fill="#DAA520" />
      <rect x="8" y="43" width="4" height="54" fill="#DAA520" />
      <rect x="108" y="43" width="4" height="54" fill="#DAA520" />
      {/* Center lock plate */}
      <rect x="50" y="55" width="20" height="24" rx="2" fill="#DAA520" />
      <rect x="52" y="57" width="16" height="20" rx="1" fill="#FFD700" />
      <circle cx="60" cy="67" r="4" fill="#DAA520" />
      <circle cx="60" cy="67" r="2" fill="#1a1a1a" />

      {/* Lid group - transforms from hinge at top */}
      <g
        style={{
          transformOrigin: '60px 45px',
          transform: open ? 'rotateX(110deg)' : 'rotateX(0deg)',
          transition: 'transform 0.6s steps(8)',
        }}
      >
        {/* Dark interior (visible when open) */}
        {open && (
          <rect x="12" y="20" width="96" height="25" fill="#1a1a1a" />
        )}
        {/* Lid shape */}
        <rect x="10" y="15" width="100" height="30" rx="4" fill="#8B4513" />
        <rect x="12" y="17" width="96" height="26" rx="3" fill="#A0522D" />
        {/* Gold trim on lid */}
        <rect x="10" y="13" width="100" height="4" fill="#DAA520" />
        <rect x="8" y="13" width="4" height="34" fill="#DAA520" />
        <rect x="108" y="13" width="4" height="34" fill="#DAA520" />
        {/* Lid center decoration */}
        <rect x="45" y="22" width="30" height="12" rx="2" fill="#DAA520" />
        <rect x="47" y="24" width="26" height="8" rx="1" fill="#FFD700" />
      </g>

      {/* Feet */}
      <rect x="14" y="95" width="12" height="5" fill="#DAA520" rx="1" />
      <rect x="94" y="95" width="12" height="5" fill="#DAA520" rx="1" />
    </svg>
  )
}

/* Generate sparkle particles */
function Sparkles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: 10 + Math.random() * 80,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    size: 2 + Math.random() * 4,
  }))

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(p => (
        <div
          key={p.id}
          className="challenge-reveal-sparkle"
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            bottom: '20%',
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: p.id % 3 === 0 ? '#FFD700' : p.id % 3 === 1 ? '#FFF8DC' : '#FF8800',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

export function ChallengeReveal({ challenge, onDismiss }: ChallengeRevealProps) {
  const [phase, setPhase] = useState<'closed' | 'open'>('closed')

  // Auto-transition hint: user can also click
  useEffect(() => {
    // no auto-open; user must tap
  }, [])

  const handleOpen = () => {
    if (phase === 'closed') {
      setPhase('open')
    }
  }

  const reqs = challenge.exerciseRequirements
  const hasTypedReqs = IS_EXERCISE && reqs && Object.keys(reqs).length > 0
  const isGroup = challenge.challengeMode === 'group'

  // Format week key for display (e.g., "2026-W14" -> "WEEK 14")
  const weekLabel = challenge.weekKey.replace(/^\d{4}-W/, 'WEEK ')

  return (
    <div
      onClick={phase === 'closed' ? handleOpen : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(0, 0, 0, 0.92)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: phase === 'closed' ? 'pointer' : 'default',
        padding: '16px',
        overflow: 'auto',
      }}
    >
      <Sparkles />

      {/* Light burst when open */}
      {phase === 'open' && (
        <div
          className="challenge-reveal-lightburst"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 136, 0, 0.1) 40%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Challenge details (shown in phase 2) */}
      {phase === 'open' && (
        <div
          className="challenge-reveal-details"
          style={{
            textAlign: 'center',
            marginBottom: '16px',
            maxWidth: '400px',
            zIndex: 1,
          }}
        >
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '14px',
            color: '#FFD700',
            textShadow: '0 0 12px rgba(255, 215, 0, 0.6)',
            marginBottom: '16px',
          }}>
            {weekLabel} CHALLENGE
          </div>

          {/* Bingo items */}
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: 'var(--crt-amber)',
            marginBottom: '8px',
            letterSpacing: '1px',
          }}>
            PHOTO BINGO:
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            {challenge.bingoItems.map(item => (
              <div
                key={item}
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color: '#FFD700',
                  background: 'rgba(255, 215, 0, 0.1)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  padding: '4px 8px',
                  textTransform: 'uppercase',
                }}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Exercise goals */}
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: 'var(--crt-amber)',
            marginBottom: '8px',
            letterSpacing: '1px',
          }}>
            EXERCISE GOALS:
          </div>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: '#FFFFFF',
            marginBottom: '16px',
          }}>
            {hasTypedReqs ? (
              Object.entries(reqs!)
                .filter(([type]) => type === 'cardio' || type === 'strength')
                .map(([type, n], i, arr) => (
                  <span key={type}>
                    {n} {type === 'cardio' ? '🏃' : '💪'} {TYPE_LABELS[type] ?? type.toUpperCase()}
                    {i < arr.length - 1 && ' + '}
                  </span>
                ))
            ) : (
              <span>{challenge.exerciseMinimum}+ EXERCISES</span>
            )}
          </div>

          {/* Group mode badge */}
          {isGroup && (
            <div style={{ marginBottom: '12px' }}>
              <span style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '9px',
                color: '#FFFFFF',
                background: '#FF4444',
                padding: '4px 10px',
                letterSpacing: '1px',
              }}>
                GROUP CHALLENGE!
              </span>
              {challenge.teams && challenge.teams.length > 0 && (
                <div style={{
                  marginTop: '8px',
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}>
                  {challenge.teams.map(t => (
                    <span
                      key={t.name}
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '7px',
                        color: 'var(--crt-amber)',
                        background: 'rgba(255, 136, 0, 0.15)',
                        border: '1px solid rgba(255, 136, 0, 0.3)',
                        padding: '3px 6px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chest */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <ChestSVG open={phase === 'open'} />
      </div>

      {/* Phase 1 text */}
      {phase === 'closed' && (
        <div style={{ textAlign: 'center', zIndex: 1, marginTop: '20px' }}>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '11px',
            color: '#FFD700',
            textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
            marginBottom: '16px',
            animation: 'blink 1s steps(1) infinite',
          }}>
            A NEW CHALLENGE HAS APPEARED!
          </div>
          <div
            className="challenge-reveal-pulse-text"
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '9px',
              color: '#FFFFFF',
            }}
          >
            TAP TO OPEN
          </div>
        </div>
      )}

      {/* Phase 2 dismiss button */}
      {phase === 'open' && (
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss() }}
          className="challenge-reveal-details"
          style={{
            marginTop: '20px',
            fontFamily: 'var(--font-pixel)',
            fontSize: '12px',
            padding: '12px 32px',
            background: '#FFD700',
            color: '#000000',
            border: '3px solid #DAA520',
            borderTopColor: '#FFF8DC',
            borderLeftColor: '#FFF8DC',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            zIndex: 1,
          }}
        >
          LET&apos;S GO!
        </button>
      )}
    </div>
  )
}
