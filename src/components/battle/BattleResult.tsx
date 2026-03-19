'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { BattleTurn } from '@/types'

interface Props {
  winner: string | null
  playerName: string
  battleId: string
  turns: BattleTurn[]
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

const VICTORY_MESSAGES = [
  'YOUR SAUSAGES REIGN SUPREME!',
  'THE WURST IS YET TO COME... FOR THEM!',
  'FRANKTASTIC VICTORY!',
  'THEY\'VE BEEN THOROUGHLY GRILLED!',
  'ABSOLUTE BANGER OF A WIN!',
  'MUSTARD-CLASS DOMINANCE!',
  'YOU REALLY LINKED THOSE COMBOS!',
  'EXTRA CRISPY VICTORY!',
  'THEY GOT SMOKED!',
  'BRATWURST BRILLIANCE!',
]

const DEFEAT_MESSAGES = [
  'YOUR LINKS HAVE BEEN SEVERED!',
  'ROASTED... LITERALLY.',
  'YOU\'VE BEEN WURST\'D!',
  'BACK TO THE FRIDGE WITH YOU!',
  'OVERCOOKED AND OUTMATCHED!',
  'YOUR CASING HAS BEEN BUSTED!',
  'SERVED WITH A SIDE OF DEFEAT!',
  'THAT WAS RARE... MEDIUM RARE... WELL DONE.',
  'KETCHUP ON YOUR GRAVE!',
  'TIME TO RECONSIDER YOUR CONDIMENTS!',
]

const DRAW_MESSAGES = [
  'MUTUAL DESTRUCTION... RESPECT.',
  'BOTH SIDES WELL DONE.',
  'A TIE? HOW UNAPPETIZING!',
  'NOBODY GETS THE LAST SAUSAGE!',
]

function VictoryParticles({ seed }: { seed: number }) {
  const particles = Array.from({ length: 35 }, (_, i) => {
    const h = hash(`${seed}-${i}`)
    const emoji = ['🌭', '🎉', '🟡', '🔥', '⭐', '🏆', '💥'][h % 7]
    return {
      emoji,
      left: `${(h * 7 + i * 13) % 100}%`,
      delay: `${(i * 0.08)}s`,
      duration: `${1.5 + (h % 10) * 0.1}s`,
      size: 10 + (h % 14),
      angle: (h * 37 + i * 73) % 360,
    }
  })

  return (
    <>
      {particles.map((p, i) => (
        <span key={i} style={{
          position: 'absolute',
          left: p.left,
          top: '50%',
          fontSize: `${p.size}px`,
          animation: `confetti-pop ${p.duration} ease-out ${p.delay} forwards`,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 10,
          '--angle': `${p.angle}deg`,
        } as React.CSSProperties}>
          {p.emoji}
        </span>
      ))}
      {/* Mustard squirts */}
      {Array.from({ length: 8 }, (_, i) => {
        const h2 = hash(`squirt-${seed}-${i}`)
        return (
          <div key={`s${i}`} style={{
            position: 'absolute',
            left: `${15 + (h2 % 70)}%`,
            bottom: '0',
            width: `${6 + (h2 % 8)}px`,
            height: `${20 + (h2 % 30)}px`,
            background: `linear-gradient(180deg, #FFDD00 0%, #FFAA00 100%)`,
            borderRadius: '50% 50% 0 0',
            animation: `mustard-squirt ${1.2 + (i * 0.15)}s ease-out ${i * 0.1}s forwards`,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 5,
          }} />
        )
      })}
    </>
  )
}

function DefeatParticles({ seed }: { seed: number }) {
  return (
    <>
      {/* Ketchup drips */}
      {Array.from({ length: 12 }, (_, i) => {
        const h = hash(`drip-${seed}-${i}`)
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${(h * 7) % 100}%`,
            top: '0',
            width: `${4 + (h % 6)}px`,
            height: `${15 + (h % 25)}px`,
            background: `linear-gradient(180deg, #CC2200 0%, #FF4444 50%, #CC2200aa 100%)`,
            borderRadius: '0 0 50% 50%',
            animation: `ketchup-drip ${1.5 + (i * 0.1)}s ease-in ${i * 0.12}s forwards`,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 5,
          }} />
        )
      })}
      {/* Falling card fragments */}
      {Array.from({ length: 6 }, (_, i) => {
        const h = hash(`frag-${seed}-${i}`)
        return (
          <div key={`f${i}`} style={{
            position: 'absolute',
            left: `${20 + (h % 60)}%`,
            top: '30%',
            width: `${6 + (h % 8)}px`,
            height: `${6 + (h % 8)}px`,
            background: '#666',
            border: '1px solid #888',
            animation: `fragment-fall ${1.2 + (i * 0.2)}s ease-in ${0.3 + i * 0.15}s forwards`,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 5,
          }} />
        )
      })}
    </>
  )
}

function TrophySvg() {
  return (
    <svg width="96" height="96" viewBox="0 0 32 32" style={{ imageRendering: 'pixelated', animation: 'trophy-bounce 1s ease-out' }}>
      <rect x="6" y="4" width="20" height="14" fill="#FFCC00" />
      <rect x="4" y="4" width="2" height="10" fill="#FFAA00" />
      <rect x="26" y="4" width="2" height="10" fill="#FFAA00" />
      <rect x="2" y="6" width="2" height="6" fill="#FFAA00" />
      <rect x="28" y="6" width="2" height="6" fill="#FFAA00" />
      <rect x="8" y="6" width="16" height="10" fill="#FFE044" />
      {/* Sausage emblem */}
      <rect x="11" y="9" width="10" height="3" fill="#C03A18" />
      <rect x="10" y="9" width="1" height="3" fill="#8C2508" />
      <rect x="21" y="9" width="1" height="3" fill="#8C2508" />
      {/* Stem */}
      <rect x="13" y="18" width="6" height="4" fill="#DDAA00" />
      {/* Base */}
      <rect x="8" y="22" width="16" height="3" fill="#FFCC00" />
      <rect x="10" y="25" width="12" height="2" fill="#DDAA00" />
      <rect x="6" y="27" width="20" height="3" fill="#FFCC00" />
    </svg>
  )
}

function SadSausageSvg() {
  return (
    <svg width="96" height="96" viewBox="0 0 32 32" style={{ imageRendering: 'pixelated', animation: 'defeat-wobble 2s ease-in-out infinite' }}>
      {/* Broken sausage */}
      <rect x="4" y="12" width="10" height="6" fill="#C03A18" />
      <rect x="3" y="12" width="1" height="6" fill="#8C2508" />
      <rect x="14" y="13" width="2" height="4" fill="#8C2508" opacity="0.5" />
      <rect x="18" y="14" width="10" height="6" fill="#C03A18" />
      <rect x="28" y="14" width="1" height="6" fill="#8C2508" />
      <rect x="16" y="15" width="2" height="4" fill="#8C2508" opacity="0.5" />
      {/* X eyes on left piece */}
      <rect x="6" y="14" width="1" height="1" fill="#000" />
      <rect x="8" y="14" width="1" height="1" fill="#000" />
      <rect x="7" y="15" width="1" height="1" fill="#000" />
      <rect x="6" y="16" width="1" height="1" fill="#000" />
      <rect x="8" y="16" width="1" height="1" fill="#000" />
      {/* Sad mouth */}
      <rect x="10" y="16" width="3" height="1" fill="#000" />
      <rect x="11" y="15" width="1" height="1" fill="#000" />
      {/* Crack marks */}
      <rect x="14" y="11" width="1" height="2" fill="#666" />
      <rect x="15" y="12" width="1" height="2" fill="#666" />
      <rect x="16" y="11" width="1" height="3" fill="#666" />
      <rect x="17" y="13" width="1" height="2" fill="#666" />
      {/* Ketchup tears */}
      <rect x="6" y="18" width="1" height="3" fill="#FF4444" />
      <rect x="8" y="18" width="1" height="4" fill="#FF4444" />
    </svg>
  )
}

export function BattleResult({ winner, playerName, battleId, turns }: Props) {
  const isWinner = winner === playerName
  const isDraw = winner === 'draw'
  const seed = hash(battleId)
  const [summary, setSummary] = useState<string | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(true)

  useEffect(() => {
    fetch(`/api/battle/${battleId}/summary`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.summary) setSummary(data.summary) })
      .catch(() => {})
      .finally(() => setLoadingSummary(false))
  }, [battleId])

  // Pick deterministic message
  const messages = isDraw ? DRAW_MESSAGES : isWinner ? VICTORY_MESSAGES : DEFEAT_MESSAGES
  const message = messages[seed % messages.length]

  // Battle stats
  const myDamage = turns
    .filter(t => t.attacker === playerName)
    .reduce((sum, t) => sum + t.damageDealt, 0)
  const myKos = turns.filter(t => t.attacker === playerName && t.isKnockout).length
  const totalTurns = turns.length

  return (
    <div style={{
      textAlign: 'center',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '400px',
    }}>
      {/* Particle effects */}
      {isWinner && <VictoryParticles seed={seed} />}
      {!isWinner && !isDraw && <DefeatParticles seed={seed} />}

      {/* Trophy or sad sausage */}
      <div style={{ position: 'relative', zIndex: 20, marginTop: '16px' }}>
        {isWinner && <TrophySvg />}
        {!isWinner && !isDraw && <SadSausageSvg />}
        {isDraw && (
          <div style={{ fontSize: '64px', animation: 'defeat-wobble 3s ease-in-out infinite' }}>
            🤝
          </div>
        )}
      </div>

      {/* Result text */}
      <div style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '20px',
        color: isDraw ? 'var(--amiga-orange)' : isWinner ? '#44CC44' : '#FF4444',
        textTransform: 'uppercase',
        textShadow: isDraw
          ? '0 0 20px rgba(255, 136, 0, 0.6)'
          : isWinner
            ? '0 0 20px rgba(68, 204, 68, 0.6), 0 0 40px rgba(68, 204, 68, 0.3)'
            : '0 0 20px rgba(255, 68, 68, 0.6)',
        animation: isWinner ? 'victory-pulse 1s ease-in-out infinite' : 'none',
        position: 'relative',
        zIndex: 20,
      }}>
        {isDraw ? 'DRAW!' : isWinner ? 'VICTORY!' : 'DEFEAT!'}
      </div>

      {/* Funny message */}
      <div style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '9px',
        color: 'var(--amiga-white)',
        position: 'relative',
        zIndex: 20,
        maxWidth: '300px',
        lineHeight: '1.8',
      }}>
        {message}
      </div>

      {/* Battle stats summary */}
      <div style={{
        display: 'flex',
        gap: '16px',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 20,
        marginTop: '8px',
      }}>
        <div className="amiga-badge">
          {totalTurns} TURNS
        </div>
        <div className="amiga-badge">
          {myDamage} DMG DEALT
        </div>
        <div className="amiga-badge">
          {myKos} KOs
        </div>
      </div>

      {/* AI Battle Summary */}
      <div style={{
        position: 'relative',
        zIndex: 20,
        width: '100%',
        maxWidth: '360px',
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '8px',
        padding: '14px',
        border: '1px solid #44444466',
        marginTop: '8px',
      }}>
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '8px',
          color: 'var(--crt-amber)',
          marginBottom: '8px',
          textTransform: 'uppercase',
        }}>
          BATTLE RECAP
        </div>
        {loadingSummary ? (
          <div className="amiga-blink" style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: '#888',
          }}>
            GENERATING RECAP...
          </div>
        ) : summary ? (
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            lineHeight: '2',
            color: '#ccc',
          }}>
            {summary}
          </div>
        ) : (
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: '#666',
          }}>
            RECAP UNAVAILABLE
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', position: 'relative', zIndex: 20 }}>
        <Link href="/battle" className="amiga-btn amiga-btn--primary">
          BACK TO LOBBY
        </Link>
        <Link href="/battle/leaderboard" className="amiga-btn">
          LEADERBOARD
        </Link>
      </div>
    </div>
  )
}
