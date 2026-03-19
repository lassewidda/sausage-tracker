'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { BattleLogEntry } from '@/lib/db'

export default function GameLogPage() {
  const [entries, setEntries] = useState<BattleLogEntry[]>([])
  const [summaries, setSummaries] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/battle/log')
      .then(res => res.json())
      .then((data: BattleLogEntry[]) => {
        setEntries(data)
        const cached: Record<string, string> = {}
        for (const e of data) {
          if (e.battle.summary) cached[e.battle.id] = e.battle.summary
        }
        setSummaries(cached)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const generateSummary = async (battleId: string) => {
    setGenerating(prev => new Set(prev).add(battleId))
    try {
      const res = await fetch(`/api/battle/${battleId}/summary`)
      if (res.ok) {
        const data = await res.json()
        if (data.summary) {
          setSummaries(prev => ({ ...prev, [battleId]: data.summary }))
        }
      }
    } catch { /* ignore */ }
    setGenerating(prev => {
      const next = new Set(prev)
      next.delete(battleId)
      return next
    })
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="page-content" style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ maxWidth: '600px', width: '100%', padding: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Link href="/battle" className="amiga-btn" style={{ fontSize: '8px' }}>
            BACK
          </Link>
        </div>

        <div className="amiga-window">
          <div className="amiga-window__titlebar">
            <span className="amiga-window__gadget">&#9632;</span>
            <span className="amiga-window__title">GAME LOG</span>
          </div>
          <div className="amiga-window__body">
            {loading ? (
              <div className="amiga-blink" style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '9px',
                color: 'var(--crt-amber)',
                textAlign: 'center',
                padding: '24px',
              }}>
                LOADING BATTLE HISTORY...
              </div>
            ) : entries.length === 0 ? (
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '9px',
                color: 'var(--amiga-dark-grey)',
                textAlign: 'center',
                padding: '24px',
              }}>
                NO BATTLES FOUGHT YET
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {entries.map(({ battle: b, decks }) => {
                  const summary = summaries[b.id]
                  const isGenerating = generating.has(b.id)

                  return (
                    <div key={b.id} style={{
                      background: 'rgba(0,0,0,0.3)',
                      borderRadius: '8px',
                      padding: '12px',
                      border: '1px solid #333',
                    }}>
                      {/* Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px',
                      }}>
                        <div style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '10px',
                          color: 'var(--crt-amber)',
                        }}>
                          {b.challenger.toUpperCase()} vs {(b.opponent ?? '?').toUpperCase()}
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '7px',
                          color: '#666',
                        }}>
                          {formatDate(b.updatedAt)}
                        </div>
                      </div>

                      {/* Winner */}
                      <div style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '8px',
                        color: b.winner === 'draw' ? 'var(--amiga-orange)' : '#44CC44',
                        marginBottom: '10px',
                      }}>
                        {b.winner === 'draw' ? 'DRAW' : `WINNER: ${b.winner?.toUpperCase()}`}
                      </div>

                      {/* Decks */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                        {decks.map(deck => (
                          <div key={deck.playerName} style={{
                            flex: 1,
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '4px',
                            padding: '8px',
                            border: `1px solid ${deck.playerName === b.winner ? '#44CC4444' : '#44444466'}`,
                          }}>
                            <div style={{
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '7px',
                              color: deck.playerName === b.winner ? '#44CC44' : '#888',
                              marginBottom: '6px',
                              textTransform: 'uppercase',
                            }}>
                              {deck.playerName}{deck.playerName === b.winner ? ' ★' : ''}
                            </div>
                            {deck.cards.map((card, i) => (
                              <div key={i} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '3px 0',
                                borderBottom: i < deck.cards.length - 1 ? '1px solid #222' : 'none',
                                opacity: card.isKnockedOut ? 0.4 : 1,
                              }}>
                                <div>
                                  <span style={{
                                    fontFamily: 'var(--font-pixel)',
                                    fontSize: '7px',
                                    color: card.isKnockedOut ? '#FF4444' : '#ccc',
                                    textDecoration: card.isKnockedOut ? 'line-through' : 'none',
                                  }}>
                                    {card.heroTitle}
                                  </span>
                                  <span style={{
                                    fontFamily: 'var(--font-pixel)',
                                    fontSize: '6px',
                                    color: '#666',
                                    marginLeft: '4px',
                                  }}>
                                    {card.heroType}
                                  </span>
                                </div>
                                <span style={{
                                  fontFamily: 'var(--font-pixel)',
                                  fontSize: '7px',
                                  color: card.isKnockedOut ? '#FF4444' : card.currentHp === card.hp ? '#44CC44' : '#FF8800',
                                }}>
                                  {card.isKnockedOut ? 'KO' : `${card.currentHp}/${card.hp}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>

                      {/* Summary */}
                      {summary ? (
                        <div style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '9px',
                          lineHeight: '2',
                          color: '#ccc',
                          background: 'rgba(0,0,0,0.2)',
                          borderRadius: '4px',
                          padding: '10px',
                          borderLeft: '3px solid var(--crt-amber)',
                        }}>
                          {summary}
                        </div>
                      ) : (
                        <button
                          className="amiga-btn"
                          onClick={() => generateSummary(b.id)}
                          disabled={isGenerating}
                          style={{ fontSize: '7px' }}
                        >
                          {isGenerating ? 'GENERATING...' : 'GENERATE RECAP'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
