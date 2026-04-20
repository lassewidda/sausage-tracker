'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { LeaderboardEntry } from '@/types'

const IS_EXERCISE = process.env.NEXT_PUBLIC_THEME === 'exercise'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  title: string
  emptyMessage?: string
}

type SortKey = 'goals' | 'total' | 'cardio' | 'strength' | 'challenges'

const SORT_OPTIONS: { key: SortKey; label: string; color: string }[] = [
  { key: 'goals', label: '🎯 GOALS', color: '#44FF44' },
  { key: 'total', label: 'TOTAL', color: 'var(--crt-amber)' },
  { key: 'cardio', label: '🏃 CARDIO', color: '#FF4444' },
  { key: 'strength', label: '💪 STRENGTH', color: '#4488FF' },
  { key: 'challenges', label: '🏆 CHALLENGES', color: '#FFD700' },
]

const MEDALS = ['🥇', '🥈', '🥉']
const BAR_COLORS = ['#FF8800', '#AAAAAA', '#CC7700']

function getSortValue(entry: LeaderboardEntry, key: SortKey): number {
  switch (key) {
    case 'goals': return entry.goalWeeks ?? 0
    case 'total': return entry.totalItems
    case 'cardio': return entry.cardioCount ?? 0
    case 'strength': return entry.strengthCount ?? 0
    case 'challenges': return entry.challengesCompleted ?? 0
  }
}

export function Leaderboard({ entries, title, emptyMessage = 'NO SCORES YET' }: LeaderboardProps) {
  const [sortKey, setSortKey] = useState<SortKey>('goals')

  const sorted = IS_EXERCISE
    ? [...entries].sort((a, b) => getSortValue(b, sortKey) - getSortValue(a, sortKey))
    : entries

  const max = sorted.length > 0 ? Math.max(getSortValue(sorted[0], sortKey), 1) : 1

  return (
    <div className="amiga-window">
      <div className="amiga-window__titlebar">
        <div className="amiga-window__gadget" />
        <span className="amiga-window__title">{title}</span>
        <div className="amiga-window__gadget" />
      </div>
      <div className="amiga-window__body">
        {/* Sort tabs (exercise theme only) */}
        {IS_EXERCISE && entries.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '10px',
            flexWrap: 'wrap',
          }}>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setSortKey(opt.key)}
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  border: sortKey === opt.key ? `2px solid ${opt.color}` : '1px solid var(--bevel-shadow)',
                  background: sortKey === opt.key ? opt.color : 'var(--amiga-black)',
                  color: sortKey === opt.key ? 'var(--amiga-black)' : 'var(--amiga-grey)',
                  textTransform: 'uppercase',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {entries.length === 0 ? (
          <div className="amiga-info" style={{ textAlign: 'center' }}>{emptyMessage}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sorted.map((entry, i) => {
              const val = getSortValue(entry, sortKey)
              const barWidth = Math.round((val / max) * 100)
              const rank = i + 1
              const color = BAR_COLORS[rank - 1] ?? 'var(--amiga-dark-grey)'
              const medal = MEDALS[rank - 1] ?? `#${rank}`

              return (
                <div key={entry.playerName} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {/* Name row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px', lineHeight: 1 }}>{medal}</span>
                      <Link href={`/player/${encodeURIComponent(entry.playerName)}`} style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        color: 'var(--amiga-black)',
                        letterSpacing: '1px',
                        textDecoration: 'none',
                      }}>
                        {entry.playerName}
                      </Link>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {IS_EXERCISE ? (
                        <>
                          {entry.hasGoal ? (
                            <span style={{
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '7px',
                              color: (entry.goalWeeks ?? 0) > 0 ? '#44FF44' : 'var(--amiga-dark-grey)',
                              background: (entry.goalWeeks ?? 0) > 0 ? 'rgba(68, 255, 68, 0.1)' : 'transparent',
                              padding: '2px 4px',
                              border: (entry.goalWeeks ?? 0) > 0 ? '1px solid rgba(68, 255, 68, 0.3)' : '1px solid var(--bevel-shadow)',
                            }}>
                              🎯{entry.goalWeeks ?? 0}
                            </span>
                          ) : (
                            <span style={{
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '6px',
                              color: '#FF8844',
                              background: 'rgba(255, 136, 68, 0.1)',
                              padding: '2px 4px',
                              border: '1px solid rgba(255, 136, 68, 0.3)',
                            }}>
                              ⚠️ NO GOAL
                            </span>
                          )}
                          <span style={{
                            fontFamily: 'var(--font-pixel)',
                            fontSize: '7px',
                            color: '#FF4444',
                            background: 'rgba(255, 68, 68, 0.1)',
                            padding: '2px 4px',
                            border: '1px solid rgba(255, 68, 68, 0.3)',
                          }}>
                            🏃{entry.cardioCount ?? 0}
                          </span>
                          <span style={{
                            fontFamily: 'var(--font-pixel)',
                            fontSize: '7px',
                            color: '#4488FF',
                            background: 'rgba(68, 136, 255, 0.1)',
                            padding: '2px 4px',
                            border: '1px solid rgba(68, 136, 255, 0.3)',
                          }}>
                            💪{entry.strengthCount ?? 0}
                          </span>
                          {(entry.challengesCompleted ?? 0) > 0 && (
                            <span style={{
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '7px',
                              color: '#FFD700',
                              background: 'rgba(255, 215, 0, 0.1)',
                              padding: '2px 4px',
                              border: '1px solid rgba(255, 215, 0, 0.3)',
                            }}>
                              🏆{entry.challengesCompleted}
                            </span>
                          )}
                          <div className="amiga-gauge amiga-gauge--small">
                            {entry.totalItems}
                          </div>
                        </>
                      ) : (
                        <>
                          {entry.totalGrams > 0 && (
                            <span style={{
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '8px',
                              color: 'var(--amiga-dark-grey)',
                              background: 'var(--amiga-light-grey)',
                              padding: '2px 4px',
                            }}>
                              ~{entry.totalGrams}G
                            </span>
                          )}
                          <div className="amiga-gauge amiga-gauge--small">
                            {entry.totalItems}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{
                    height: '8px',
                    background: 'var(--amiga-dark-grey)',
                    borderTop: '1px solid var(--bevel-shadow)',
                    borderLeft: '1px solid var(--bevel-shadow)',
                    borderRight: '1px solid var(--bevel-light)',
                    borderBottom: '1px solid var(--bevel-light)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${barWidth}%`,
                      background: color,
                      transition: 'width 0.3s steps(10)',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
