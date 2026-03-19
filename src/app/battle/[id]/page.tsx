'use client'

import { useState, useCallback } from 'react'
import { useName } from '@/lib/useName'
import { useBattleState } from '@/components/battle/useBattleState'
import { BattleCardSelect } from '@/components/battle/BattleCardSelect'
import { BattleArena } from '@/components/battle/BattleArena'
import { BattleResult } from '@/components/battle/BattleResult'
import type { HeroCard } from '@/types'
import { useEffect } from 'react'

export default function BattleArenaPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { name } = useName()
  const { state, refetch } = useBattleState(id)
  const [deck, setDeck] = useState<HeroCard[]>([])
  const [isReady, setIsReady] = useState(false)
  const [joining, setJoining] = useState(false)

  const fetchDeck = useCallback(() => {
    if (!name) return
    fetch(`/api/hero-card?playerName=${encodeURIComponent(name)}`)
      .then(r => r.json())
      .then(d => setDeck(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [name])

  // Fetch deck on mount and whenever battle enters selecting phase
  useEffect(() => { fetchDeck() }, [fetchDeck])
  useEffect(() => {
    if (state?.battle.status === 'selecting') fetchDeck()
  }, [state?.battle.status, fetchDeck])

  const handleSubmitDeck = useCallback(async (cardIds: string[]) => {
    if (!name) return
    setIsReady(true)
    try {
      const res = await fetch(`/api/battle/${id}/deck`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name, cardIds }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('Deck submit failed:', err)
        setIsReady(false)
        return
      }
      refetch()
    } catch {
      setIsReady(false)
    }
  }, [id, name, refetch])

  const handleMove = useCallback(async (moveIndex: number) => {
    if (!name) return
    try {
      await fetch(`/api/battle/${id}/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name, moveIndex }),
      })
      refetch()
    } catch { /* ignore */ }
  }, [id, name, refetch])

  if (!name) {
    return (
      <div className="page-content">
        <div className="amiga-window" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="amiga-window__titlebar">
            <span className="amiga-window__gadget">&#9632;</span>
            <span className="amiga-window__title">BATTLE ARENA</span>
          </div>
          <div className="amiga-window__body" style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px' }}>
              SET YOUR PLAYER NAME TO BATTLE
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!state) {
    return (
      <div className="page-content">
        <div className="amiga-window" style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="amiga-window__titlebar">
            <span className="amiga-window__gadget">&#9632;</span>
            <span className="amiga-window__title">BATTLE ARENA</span>
          </div>
          <div className="amiga-window__body" style={{ textAlign: 'center', padding: '32px' }}>
            <span className="amiga-blink" style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              color: 'var(--crt-amber)',
            }}>
              LOADING BATTLE...
            </span>
          </div>
        </div>
      </div>
    )
  }

  const { battle } = state

  return (
    <div className="page-content">
      <div className="amiga-window" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div className="amiga-window__titlebar">
          <span className="amiga-window__gadget">&#9632;</span>
          <span className="amiga-window__title">
            {battle.challenger.toUpperCase()} VS {battle.opponent?.toUpperCase() ?? '???'}
          </span>
        </div>
        <div className="amiga-window__body">
          {/* Waiting for opponent */}
          {battle.status === 'waiting' && battle.challenger === name && (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div className="amiga-blink" style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '12px',
                color: 'var(--crt-amber)',
              }}>
                WAITING FOR OPPONENT TO JOIN...
              </div>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                color: 'var(--amiga-dark-grey)',
                marginTop: '12px',
              }}>
                SHARE THIS PAGE WITH YOUR OPPONENT
              </div>
            </div>
          )}

          {/* Opponent can join */}
          {battle.status === 'waiting' && battle.challenger !== name && (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '12px',
                color: 'var(--crt-amber)',
                marginBottom: '16px',
              }}>
                {battle.challenger.toUpperCase()} CHALLENGES YOU!
              </div>
              <button
                className="amiga-btn amiga-btn--primary amiga-btn--large"
                disabled={joining}
                onClick={async () => {
                  if (!name || joining) return
                  setJoining(true)
                  try {
                    const res = await fetch(`/api/battle/${id}/join`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ playerName: name }),
                    })
                    if (res.ok) refetch()
                  } catch { /* ignore */ }
                  setJoining(false)
                }}
              >
                {joining ? 'JOINING...' : 'ACCEPT CHALLENGE!'}
              </button>
            </div>
          )}

          {/* Card selection */}
          {battle.status === 'selecting' && (
            <BattleCardSelect
              deck={deck}
              onSubmit={handleSubmitDeck}
              isReady={isReady}
            />
          )}

          {/* Battle in progress */}
          {battle.status === 'battling' && (
            <BattleArena
              state={state}
              playerName={name}
              onMove={handleMove}
            />
          )}

          {/* Battle finished */}
          {battle.status === 'finished' && (
            <BattleResult
              winner={battle.winner}
              playerName={name}
              battleId={id}
              turns={state.turns}
            />
          )}
        </div>
      </div>
    </div>
  )
}
