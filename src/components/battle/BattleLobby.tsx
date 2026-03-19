'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Battle, HeroCard } from '@/types'
import { useName } from '@/lib/useName'

export function BattleLobby() {
  const { name } = useName()
  const router = useRouter()
  const [openBattles, setOpenBattles] = useState<Battle[]>([])
  const [activeBattles, setActiveBattles] = useState<Battle[]>([])
  const [deck, setDeck] = useState<HeroCard[]>([])
  const [loading, setLoading] = useState(false)

  const fetchLobby = useCallback(async () => {
    if (!name) return
    try {
      const [lobbyRes, deckRes] = await Promise.all([
        fetch(`/api/battle?playerName=${encodeURIComponent(name)}`),
        fetch(`/api/hero-card?playerName=${encodeURIComponent(name)}`),
      ])
      const lobbyData = await lobbyRes.json()
      setOpenBattles(lobbyData.openBattles ?? [])
      setActiveBattles(lobbyData.activeBattles ?? [])

      const deckData = await deckRes.json()
      setDeck(Array.isArray(deckData) ? deckData : [])
    } catch { /* ignore */ }
  }, [name])

  useEffect(() => {
    fetchLobby()
    const interval = setInterval(fetchLobby, 3000)
    return () => clearInterval(interval)
  }, [fetchLobby])

  const createChallenge = async () => {
    if (!name || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name }),
      })
      const battle = await res.json()
      router.push(`/battle/${battle.id}`)
    } catch { /* ignore */ }
    setLoading(false)
  }

  const joinChallenge = async (battleId: string) => {
    if (!name || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/battle/${battleId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name }),
      })
      if (res.ok) {
        router.push(`/battle/${battleId}`)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  if (!name) {
    return (
      <div className="amiga-window" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="amiga-window__titlebar">
          <span className="amiga-window__gadget">&#9632;</span>
          <span className="amiga-window__title">BATTLE ARENA</span>
        </div>
        <div className="amiga-window__body" style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--amiga-black)' }}>
            SET YOUR PLAYER NAME IN THE MENU BAR TO ENTER THE ARENA
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Leaderboard link */}
      <div style={{ textAlign: 'right' }}>
        <Link
          href="/battle/leaderboard"
          className="amiga-btn"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', textDecoration: 'none' }}
        >
          LEADERBOARD
        </Link>
      </div>

      {/* Your deck collection */}
      <div className="amiga-window">
        <div className="amiga-window__titlebar">
          <span className="amiga-window__gadget">&#9632;</span>
          <span className="amiga-window__title">YOUR CARD COLLECTION ({deck.length} CARDS)</span>
        </div>
        <div className="amiga-window__body">
          {deck.length === 0 ? (
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '9px',
              color: 'var(--amiga-dark-grey)',
              textAlign: 'center',
              padding: '16px',
            }}>
              NO CARDS YET. LOG MEALS TO EARN WEEKLY CARDS!
              <br />STARTER CARDS WILL BE GIVEN WHEN YOU JOIN A BATTLE.
            </div>
          ) : (
            <div style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              padding: '4px',
            }}>
              {deck.map((card) => {
                const isStarter = card.weekKey.startsWith('STARTER')
                return (
                  <div key={card.id} style={{
                    background: '#1a1a1a',
                    border: '2px solid #333',
                    borderRadius: '4px',
                    padding: '6px',
                    minWidth: '100px',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '7px',
                      color: 'var(--amiga-orange)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {card.heroTitle}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '6px',
                      color: '#888',
                      marginTop: '2px',
                    }}>
                      {card.heroType}
                      {isStarter && ' (S)'}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '6px',
                      color: '#666',
                      marginTop: '4px',
                    }}>
                      HP:{card.hp} A:{card.attack} D:{card.defense} S:{card.speed}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create challenge */}
      <div style={{ textAlign: 'center' }}>
        <button
          className="amiga-btn amiga-btn--primary amiga-btn--large"
          onClick={createChallenge}
          disabled={loading}
        >
          CREATE CHALLENGE
        </button>
      </div>

      {/* Active battles */}
      {activeBattles.length > 0 && (
        <div className="amiga-window">
          <div className="amiga-window__titlebar">
            <span className="amiga-window__gadget">&#9632;</span>
            <span className="amiga-window__title">YOUR ACTIVE BATTLES</span>
          </div>
          <div className="amiga-window__body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {activeBattles.map((b) => {
                const opponent = b.challenger === name ? b.opponent : b.challenger
                return (
                  <div key={b.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px',
                    background: 'var(--amiga-dark-grey)',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '9px',
                      color: 'var(--amiga-white)',
                    }}>
                      VS {opponent?.toUpperCase()} — {b.status.toUpperCase()}
                    </span>
                    <button
                      className="amiga-btn"
                      onClick={() => router.push(`/battle/${b.id}`)}
                      style={{ fontSize: '8px' }}
                    >
                      CONTINUE
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Open challenges */}
      <div className="amiga-window">
        <div className="amiga-window__titlebar">
          <span className="amiga-window__gadget">&#9632;</span>
          <span className="amiga-window__title">OPEN CHALLENGES</span>
        </div>
        <div className="amiga-window__body">
          {openBattles.length === 0 ? (
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '9px',
              color: 'var(--amiga-dark-grey)',
              textAlign: 'center',
              padding: '16px',
            }}>
              NO OPEN CHALLENGES. CREATE ONE!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {openBattles.map((b) => (
                <div key={b.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px',
                  background: 'var(--amiga-dark-grey)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '9px',
                    color: 'var(--crt-amber)',
                  }}>
                    {b.challenger.toUpperCase()} WANTS TO BATTLE!
                  </span>
                  {b.challenger !== name && (
                    <button
                      className="amiga-btn amiga-btn--primary"
                      onClick={() => joinChallenge(b.id)}
                      disabled={loading}
                      style={{ fontSize: '8px' }}
                    >
                      JOIN
                    </button>
                  )}
                  {b.challenger === name && (
                    <span style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '8px',
                      color: 'var(--amiga-grey)',
                    }} className="amiga-blink">
                      WAITING...
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
