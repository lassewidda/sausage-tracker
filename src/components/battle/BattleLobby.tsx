'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Battle, HeroCard, PlayerItem, ItemDefinition } from '@/types'
import { useName } from '@/lib/useName'
import { CardDetail } from './CardDetail'
import { PixelAvatar, getTypeTheme } from '@/components/player/HeroCardDisplay'

function getCurrentWeekKey(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
  const week1 = new Date(d.getFullYear(), 0, 4)
  const weekNum =
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    ) + 1
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

export function BattleLobby() {
  const { name } = useName()
  const router = useRouter()
  const [openBattles, setOpenBattles] = useState<Battle[]>([])
  const [activeBattles, setActiveBattles] = useState<Battle[]>([])
  const [deck, setDeck] = useState<HeroCard[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMeals, setHasMeals] = useState(false)
  const [selectedCard, setSelectedCard] = useState<HeroCard | null>(null)
  const [inventory, setInventory] = useState<(PlayerItem & { definition?: ItemDefinition })[]>([])
  const [seenItemIds, setSeenItemIds] = useState<Set<string>>(new Set())

  const fetchLobby = useCallback(async () => {
    if (!name) return
    try {
      const [lobbyRes, deckRes, invRes] = await Promise.all([
        fetch(`/api/battle?playerName=${encodeURIComponent(name)}`),
        fetch(`/api/hero-card?playerName=${encodeURIComponent(name)}`),
        fetch(`/api/inventory?playerName=${encodeURIComponent(name)}`),
      ])
      const lobbyData = await lobbyRes.json()
      setOpenBattles(lobbyData.openBattles ?? [])
      setActiveBattles(lobbyData.activeBattles ?? [])

      const deckData = await deckRes.json()
      const deckArr = Array.isArray(deckData) ? deckData : []
      setDeck(deckArr)
      // Check if player has any non-starter cards (means they have meal history)
      setHasMeals(deckArr.some((c: HeroCard) => !c.weekKey.startsWith('STARTER')))

      if (invRes.ok) {
        const invData = await invRes.json()
        setInventory(Array.isArray(invData) ? invData : [])
      }
    } catch { /* ignore */ }
  }, [name])

  // Load seen item IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sausage_seen_items')
      if (stored) setSeenItemIds(new Set(JSON.parse(stored)))
    } catch { /* ignore */ }
  }, [])

  // Mark items as seen after 3 seconds of viewing
  useEffect(() => {
    if (inventory.length === 0) return
    const newIds = inventory.map(i => i.id)
    const hasNew = newIds.some(id => !seenItemIds.has(id))
    if (!hasNew) return

    const timeout = setTimeout(() => {
      const merged = new Set(Array.from(seenItemIds).concat(newIds))
      setSeenItemIds(merged)
      try { localStorage.setItem('sausage_seen_items', JSON.stringify(Array.from(merged))) } catch { /* ignore */ }
    }, 3000)
    return () => clearTimeout(timeout)
  }, [inventory, seenItemIds])

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
      {/* Links */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <Link
          href="/battle/log"
          className="amiga-btn"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', textDecoration: 'none' }}
        >
          GAME LOG
        </Link>
        <Link
          href="/battle/leaderboard"
          className="amiga-btn"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', textDecoration: 'none' }}
        >
          LEADERBOARD
        </Link>
      </div>

      {/* New card available */}
      {hasMeals && !deck.some(c => c.weekKey === getCurrentWeekKey()) && (
        <div
          className="amiga-window"
          style={{ cursor: 'pointer', border: '3px solid var(--crt-amber)' }}
          onClick={() => router.push('/battle/new-card')}
        >
          <div className="amiga-window__body" style={{
            textAlign: 'center',
            padding: '20px',
            background: 'linear-gradient(180deg, #1a0a00 0%, #0a0500 100%)',
          }}>
            <div className="amiga-blink" style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '14px',
              color: 'var(--crt-amber)',
              textShadow: '0 0 12px rgba(255, 170, 0, 0.6)',
              marginBottom: '8px',
            }}>
              NEW CARD AVAILABLE!
            </div>
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: '#888',
            }}>
              TAP TO OPEN YOUR WEEKLY TREASURE
            </div>
          </div>
        </div>
      )}

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
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '6px',
              padding: '4px',
            }}>
              {deck.map((card) => {
                const isStarter = card.weekKey.startsWith('STARTER')
                const theme = getTypeTheme(card.heroType)
                return (
                  <div key={card.id} onClick={() => setSelectedCard(card)} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#1a1a2a',
                    border: `1px solid ${theme.border}66`,
                    borderRadius: '4px',
                    padding: '6px',
                    cursor: 'pointer',
                  }}>
                    <div style={{
                      flexShrink: 0,
                      width: '32px',
                      height: '32px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      background: theme.gradient,
                      border: `1px solid ${theme.border}`,
                    }}>
                      <PixelAvatar card={card} theme={theme} size={32} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '7px',
                        color: '#ccc',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {card.heroTitle}
                        {isStarter && ' (S)'}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '6px',
                        color: theme.accent,
                        opacity: 0.7,
                      }}>
                        {card.heroType}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '6px',
                        color: '#666',
                        marginTop: '2px',
                      }}>
                        HP:{card.hp} A:{card.attack} D:{card.defense} S:{card.speed}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Inventory */}
      <div className="amiga-window">
        <div className="amiga-window__titlebar">
          <span className="amiga-window__gadget">&#9632;</span>
          <span className="amiga-window__title">YOUR INVENTORY ({inventory.length} ITEMS)</span>
        </div>
        <div className="amiga-window__body">
          {inventory.length === 0 ? (
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '9px',
              color: 'var(--amiga-dark-grey)',
              textAlign: 'center',
              padding: '16px',
            }}>
              NO ITEMS. LOG MEALS FOR A CHANCE TO FIND ITEMS!
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              {inventory.map((item) => {
                const def = item.definition
                if (!def) return null
                const color = def.rarity === 'rare' ? '#FFD700' : def.rarity === 'uncommon' ? '#4488FF' : '#888'
                const isNew = !seenItemIds.has(item.id)
                return (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '4px 6px',
                    background: isNew ? '#1a1a2a' : '#1a1a1a',
                    border: `1px solid ${isNew ? color : color + '33'}`,
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '8px',
                      color,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      {isNew && (
                        <span className="amiga-blink" style={{
                          fontSize: '6px',
                          color: '#FF4444',
                          flexShrink: 0,
                        }}>
                          NEW!
                        </span>
                      )}
                      {def.name}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '7px',
                      color: '#666',
                    }}>
                      {def.description}
                    </span>
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

      {selectedCard && (
        <CardDetail card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  )
}
