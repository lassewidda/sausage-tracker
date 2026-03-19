'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useName } from '@/lib/useName'
import { PixelAvatar, getTypeTheme } from '@/components/player/HeroCardDisplay'
import type { HeroCard } from '@/types'
import { parseMoveDamage } from '@/lib/battleEngine'

type Phase = 'intro' | 'opening' | 'glow' | 'reveal' | 'stats'

export default function NewCardPage() {
  const { name, loaded } = useName()
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('intro')
  const [card, setCard] = useState<HeroCard | null>(null)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)

  const generate = async () => {
    if (!name || generating) return
    setGenerating(true)
    setPhase('opening')

    try {
      const res = await fetch('/api/hero-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name }),
      })
      const data = await res.json()

      if (res.status === 429 && data.card) {
        setCard(data.card)
        setTimeout(() => setPhase('glow'), 2000)
        setTimeout(() => setPhase('reveal'), 3500)
        setTimeout(() => setPhase('stats'), 5000)
        return
      }

      if (!res.ok) {
        setError(data.error || 'Failed to generate card')
        setPhase('intro')
        setGenerating(false)
        return
      }

      setCard(data)
      setTimeout(() => setPhase('glow'), 2000)
      setTimeout(() => setPhase('reveal'), 3500)
      setTimeout(() => setPhase('stats'), 5000)
    } catch {
      setError('Something went wrong...')
      setPhase('intro')
      setGenerating(false)
    }
  }

  useEffect(() => {
    if (loaded && !name) router.push('/battle')
  }, [loaded, name, router])

  if (!loaded || !name) return null

  const theme = card ? getTypeTheme(card.heroType) : null

  return (
    <div className="page-content" style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        padding: '24px 16px',
      }}>

        {/* INTRO: The chest */}
        {phase === 'intro' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            animation: 'card-enter 0.5s steps(6)',
          }}>
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '12px',
              color: 'var(--crt-amber)',
              textAlign: 'center',
              textShadow: '0 0 10px rgba(255, 170, 0, 0.4)',
            }}>
              A MYSTERIOUS SAUSAGE CRATE APPEARS...
            </div>

            {/* Pixel art chest */}
            <svg viewBox="0 0 64 64" width="160" height="160" style={{
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 0 20px rgba(255, 170, 0, 0.3))',
            }}>
              {/* Chest body */}
              <rect x="8" y="28" width="48" height="28" fill="#8B4513" />
              <rect x="10" y="30" width="44" height="24" fill="#A0522D" />
              <rect x="12" y="32" width="40" height="20" fill="#8B4513" />
              {/* Chest lid */}
              <rect x="6" y="20" width="52" height="12" fill="#A0522D" />
              <rect x="8" y="22" width="48" height="8" fill="#CD853F" />
              {/* Lock/clasp */}
              <rect x="28" y="30" width="8" height="10" fill="#FFD700" />
              <rect x="30" y="32" width="4" height="6" fill="#DAA520" />
              {/* Metal bands */}
              <rect x="8" y="28" width="48" height="2" fill="#DAA520" />
              <rect x="8" y="42" width="48" height="2" fill="#DAA520" />
              {/* Highlight */}
              <rect x="12" y="24" width="20" height="2" fill="#DEB887" opacity="0.5" />
              {/* Sparkles */}
              <rect x="4" y="16" width="2" height="2" fill="#FFD700" className="chest-sparkle-1" />
              <rect x="56" y="12" width="2" height="2" fill="#FFD700" className="chest-sparkle-2" />
              <rect x="30" y="8" width="2" height="2" fill="#FFD700" className="chest-sparkle-3" />
            </svg>

            <button
              className="amiga-btn amiga-btn--primary amiga-btn--large"
              onClick={generate}
              style={{
                fontSize: '12px',
                padding: '12px 32px',
                animation: 'victory-pulse 1.5s infinite',
              }}
            >
              OPEN THE CRATE!
            </button>

            {error && (
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                color: '#FF4444',
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* OPENING: Chest shaking */}
        {phase === 'opening' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
          }}>
            <div className="amiga-blink" style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              color: 'var(--crt-amber)',
              textAlign: 'center',
            }}>
              FORGING YOUR DESTINY...
            </div>

            <svg viewBox="0 0 64 64" width="160" height="160" style={{
              imageRendering: 'pixelated',
              animation: 'hit-shake 0.3s steps(4) infinite',
              filter: 'drop-shadow(0 0 30px rgba(255, 170, 0, 0.6))',
            }}>
              <rect x="8" y="28" width="48" height="28" fill="#8B4513" />
              <rect x="10" y="30" width="44" height="24" fill="#A0522D" />
              <rect x="12" y="32" width="40" height="20" fill="#8B4513" />
              <rect x="6" y="20" width="52" height="12" fill="#A0522D" />
              <rect x="8" y="22" width="48" height="8" fill="#CD853F" />
              <rect x="28" y="30" width="8" height="10" fill="#FFD700" />
              <rect x="30" y="32" width="4" height="6" fill="#DAA520" />
              <rect x="8" y="28" width="48" height="2" fill="#DAA520" />
              <rect x="8" y="42" width="48" height="2" fill="#DAA520" />
              {/* More sparkles */}
              <rect x="2" y="10" width="3" height="3" fill="#FFD700" opacity="0.8" />
              <rect x="58" y="8" width="3" height="3" fill="#FFD700" opacity="0.8" />
              <rect x="30" y="4" width="3" height="3" fill="#FFD700" opacity="0.8" />
              <rect x="14" y="6" width="2" height="2" fill="#FFA500" opacity="0.6" />
              <rect x="48" y="14" width="2" height="2" fill="#FFA500" opacity="0.6" />
            </svg>
          </div>
        )}

        {/* GLOW: Bright flash */}
        {phase === 'glow' && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            animation: 'chest-flash 1.5s forwards',
          }}>
            <div style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,136,0,0.3) 50%, transparent 70%)',
              animation: 'victory-pulse 0.5s infinite',
            }} />
          </div>
        )}

        {/* REVEAL: Card appears */}
        {phase === 'reveal' && card && theme && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            animation: 'card-enter 0.5s steps(6)',
          }}>
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}>
              YOU FOUND A...
            </div>

            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '14px',
              color: theme.accent,
              textAlign: 'center',
              textShadow: `0 0 15px ${theme.glow}`,
              animation: 'victory-pulse 2s infinite',
            }}>
              {card.heroTitle.toUpperCase()}
            </div>

            <div style={{
              background: theme.gradient,
              border: `3px solid ${theme.border}`,
              borderRadius: '12px',
              padding: '16px',
              width: '200px',
              boxShadow: `0 0 30px ${theme.glow}`,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                overflow: 'hidden',
                border: `1px solid ${theme.border}44`,
              }}>
                <PixelAvatar card={card} theme={theme} size={140} />
              </div>
            </div>

            <div className="amiga-blink" style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: 'var(--crt-amber)',
            }}>
              LOADING STATS...
            </div>
          </div>
        )}

        {/* STATS: Full card details */}
        {phase === 'stats' && card && theme && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            width: '100%',
            animation: 'card-enter 0.3s steps(4)',
          }}>
            {/* Title */}
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '14px',
              color: theme.accent,
              textAlign: 'center',
              textShadow: `0 0 15px ${theme.glow}`,
            }}>
              {card.heroTitle.toUpperCase()}
            </div>

            {/* Type badge */}
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              color: theme.accent,
              background: 'rgba(0,0,0,0.5)',
              padding: '6px 16px',
              borderRadius: '20px',
              border: `1px solid ${theme.border}`,
              textTransform: 'uppercase',
            }}>
              {card.heroType}
            </div>

            {/* Avatar */}
            <div style={{
              background: theme.gradient,
              border: `3px solid ${theme.border}`,
              borderRadius: '12px',
              padding: '12px',
              boxShadow: `0 0 20px ${theme.glow}`,
            }}>
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                overflow: 'hidden',
              }}>
                <PixelAvatar card={card} theme={theme} size={120} />
              </div>
            </div>

            {/* Catchphrase */}
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: 'var(--crt-amber)',
              textAlign: 'center',
              fontStyle: 'italic',
              padding: '0 16px',
            }}>
              &quot;{card.catchphrase}&quot;
            </div>

            {/* Stats grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              width: '100%',
              maxWidth: '360px',
            }}>
              {[
                { label: 'HP', value: card.hp, color: '#FF4444', icon: '❤' },
                { label: 'ATK', value: card.attack, color: '#FF8800', icon: '⚔' },
                { label: 'DEF', value: card.defense, color: '#4488FF', icon: '🛡' },
                { label: 'SPD', value: card.speed, color: '#44DD44', icon: '⚡' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: `2px solid ${stat.color}44`,
                  borderRadius: '8px',
                  padding: '10px 6px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>{stat.icon}</div>
                  <div style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '14px',
                    color: stat.color,
                    fontWeight: 'bold',
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '7px',
                    color: '#888',
                    marginTop: '2px',
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Special moves */}
            <div style={{
              width: '100%',
              maxWidth: '360px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              padding: '12px',
              border: `1px solid ${theme.border}33`,
            }}>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                color: theme.accent,
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}>
                SPECIAL MOVES
              </div>
              {card.specialMoves.map((move, i) => {
                const parsed = parseMoveDamage(move)
                return (
                  <div key={i} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: i < card.specialMoves.length - 1 ? '1px solid #333' : 'none',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '8px',
                      color: '#ccc',
                    }}>
                      {parsed.name}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '7px',
                        color: '#FF8800',
                      }}>
                        {parsed.baseDamage} DMG
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '7px',
                        color: '#4488FF',
                      }}>
                        {parsed.maxPp} PP
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Weakness */}
            <div style={{
              width: '100%',
              maxWidth: '360px',
              background: 'rgba(255, 0, 0, 0.08)',
              borderRadius: '8px',
              padding: '10px 12px',
              border: '1px solid #FF444433',
            }}>
              <span style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: '#FF4444',
              }}>
                WEAKNESS:{' '}
              </span>
              <span style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: '#cc8888',
              }}>
                {card.weakness}
              </span>
            </div>

            {/* Flavor text */}
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: '#666',
              textAlign: 'center',
              fontStyle: 'italic',
              padding: '0 16px',
              maxWidth: '360px',
            }}>
              {card.flavorText}
            </div>

            {/* Back button */}
            <button
              className="amiga-btn amiga-btn--primary amiga-btn--large"
              onClick={() => router.push('/battle')}
              style={{ fontSize: '10px', padding: '10px 32px', marginTop: '8px' }}
            >
              ADD TO DECK
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
