'use client'

import { useCallback, useEffect, useState } from 'react'
import { Window } from '@/components/amiga/Window'
import { Button } from '@/components/amiga/Button'
import { useName } from '@/lib/useName'
import type { WeeklyChallenge } from '@/types'

const IS_EXERCISE = process.env.NEXT_PUBLIC_THEME === 'exercise'

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

export default function ChallengeAdminPage() {
  const { name, loaded } = useName()
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([])
  const [weekKey, setWeekKey] = useState(getCurrentWeekKey())
  const [bingoItems, setBingoItems] = useState<string[]>([''])
  const [exerciseMinimum, setExerciseMinimum] = useState(3)
  const [cardioReq, setCardioReq] = useState(0)
  const [strengthReq, setStrengthReq] = useState(0)
  const [challengeMode, setChallengeMode] = useState<'individual' | 'group'>('individual')
  const [teams, setTeams] = useState<Array<{ name: string; members: string[] }>>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [allPlayers, setAllPlayers] = useState<string[]>([])

  const fetchPlayers = useCallback(async () => {
    try {
      const res = await fetch('/api/players')
      if (res.ok) setAllPlayers(await res.json())
    } catch {
      // silent
    }
  }, [])

  // Progress timeline config state
  const [progressStart, setProgressStart] = useState('')
  const [progressEnd, setProgressEnd] = useState('')
  const [progressSaving, setProgressSaving] = useState(false)
  const [progressMessage, setProgressMessage] = useState<string | null>(null)

  const fetchProgressConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/progress/config')
      if (res.ok) {
        const data = await res.json()
        if (data.startDate) setProgressStart(data.startDate)
        if (data.endDate) setProgressEnd(data.endDate)
      }
    } catch {
      // silent
    }
  }, [])

  const handleSaveProgress = async () => {
    if (!progressStart || !progressEnd) {
      setProgressMessage('BOTH DATES REQUIRED')
      return
    }
    setProgressSaving(true)
    setProgressMessage(null)
    try {
      const res = await fetch('/api/progress/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: progressStart, endDate: progressEnd }),
      })
      if (!res.ok) throw new Error('Save failed')
      setProgressMessage('PROGRESS DATES SAVED!')
    } catch {
      setProgressMessage('SAVE FAILED')
    } finally {
      setProgressSaving(false)
    }
  }

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await fetch('/api/challenge/admin')
      if (res.ok) setChallenges(await res.json())
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    fetchChallenges()
    fetchProgressConfig()
    fetchPlayers()
  }, [fetchChallenges, fetchProgressConfig, fetchPlayers])

  const handleSave = async () => {
    const items = bingoItems.map(s => s.trim()).filter(Boolean)
    if (items.length === 0) {
      setMessage('ADD AT LEAST ONE BINGO ITEM')
      return
    }

    setSaving(true)
    setMessage(null)

    // Build exercise requirements for exercise theme
    const exerciseRequirements = IS_EXERCISE && (cardioReq > 0 || strengthReq > 0)
      ? {
          ...(cardioReq > 0 ? { cardio: cardioReq } : {}),
          ...(strengthReq > 0 ? { strength: strengthReq } : {}),
        }
      : null

    try {
      const res = await fetch('/api/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekKey,
          bingoItems: items,
          exerciseMinimum,
          exerciseRequirements,
          challengeMode,
          teams: challengeMode === 'group' ? teams.map(t => ({
            name: t.name.trim(),
            members: t.members.map(m => m.trim().toLowerCase()).filter(Boolean),
          })).filter(t => t.name && t.members.length > 0) : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Save failed')
      }

      setMessage('CHALLENGE SAVED!')
      setBingoItems([''])
      await fetchChallenges()
    } catch (err: any) {
      setMessage(err.message || 'SAVE FAILED')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (wk: string) => {
    if (!confirm(`Delete challenge for ${wk}?`)) return

    try {
      const res = await fetch('/api/challenge/admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekKey: wk }),
      })
      if (res.ok) {
        await fetchChallenges()
        setMessage(`DELETED ${wk}`)
      }
    } catch {
      setMessage('DELETE FAILED')
    }
  }

  const handleEdit = (challenge: WeeklyChallenge) => {
    setWeekKey(challenge.weekKey)
    setBingoItems(challenge.bingoItems.length > 0 ? challenge.bingoItems : [''])
    setExerciseMinimum(challenge.exerciseMinimum)
    if (challenge.exerciseRequirements) {
      setCardioReq(challenge.exerciseRequirements.cardio ?? 0)
      setStrengthReq(challenge.exerciseRequirements.strength ?? 0)
    } else {
      setCardioReq(0)
      setStrengthReq(0)
    }
    setChallengeMode(challenge.challengeMode ?? 'individual')
    setTeams(challenge.teams ?? [])
    setMessage(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const addItem = () => setBingoItems(prev => [...prev, ''])
  const removeItem = (idx: number) => setBingoItems(prev => prev.filter((_, i) => i !== idx))
  const updateItem = (idx: number, val: string) =>
    setBingoItems(prev => prev.map((s, i) => (i === idx ? val : s)))

  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-pixel)',
    fontSize: '9px',
    textTransform: 'uppercase',
    background: 'var(--amiga-black)',
    color: 'var(--crt-amber)',
    border: '2px solid var(--crt-amber)',
    padding: '6px 10px',
    outline: 'none',
    width: '100%',
  }

  if (!loaded) {
    return (
      <Window title="ADMIN">
        <div style={{ textAlign: 'center', padding: '32px', fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--crt-amber)' }}>
          LOADING...
        </div>
      </Window>
    )
  }

  if (name?.toLowerCase() !== 'lars') {
    return (
      <Window title="ADMIN">
        <div style={{ textAlign: 'center', padding: '32px', fontFamily: 'var(--font-pixel)', fontSize: '10px', color: '#AA0000' }}>
          ACCESS DENIED. ADMIN ONLY.
        </div>
      </Window>
    )
  }

  return (
    <div className="stack" style={{ gap: '12px' }}>
      <Window title="PROGRESS TIMELINE CONFIG">
        <div className="stack" style={{ gap: '12px' }}>
          {progressMessage && (
            <div className="amiga-badge" style={{
              background: progressMessage.includes('FAILED') || progressMessage.includes('REQUIRED') ? '#AA0000' : '#006600',
              color: '#FFFFFF',
              textAlign: 'center',
            }}>
              {progressMessage}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--crt-amber)', display: 'block', marginBottom: '4px' }}>
                START DATE
              </label>
              <input
                type="date"
                value={progressStart}
                onChange={e => setProgressStart(e.target.value)}
                style={{ ...inputStyle, width: '160px' }}
              />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--crt-amber)', display: 'block', marginBottom: '4px' }}>
                END DATE
              </label>
              <input
                type="date"
                value={progressEnd}
                onChange={e => setProgressEnd(e.target.value)}
                style={{ ...inputStyle, width: '160px' }}
              />
            </div>
          </div>
          {progressStart && progressEnd && (
            <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--amiga-dark-grey)' }}>
              CURRENT RANGE: {progressStart} TO {progressEnd}
            </div>
          )}
          <Button variant="primary" onClick={handleSaveProgress} disabled={progressSaving}>
            {progressSaving ? 'SAVING...' : 'SAVE PROGRESS DATES'}
          </Button>
        </div>
      </Window>

      <Window title="CHALLENGE ADMIN">
        <div className="stack" style={{ gap: '12px' }}>
          {message && (
            <div className="amiga-badge" style={{
              background: message.includes('FAILED') || message.includes('ADD AT LEAST') ? '#AA0000' : '#006600',
              color: '#FFFFFF',
              textAlign: 'center',
            }}>
              {message}
            </div>
          )}

          {/* Week key */}
          <div>
            <label style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--crt-amber)', display: 'block', marginBottom: '4px' }}>
              WEEK KEY
            </label>
            <input
              type="text"
              value={weekKey}
              onChange={e => setWeekKey(e.target.value)}
              placeholder="YYYY-WNN"
              style={inputStyle}
            />
          </div>

          {/* Exercise minimum */}
          <div>
            <label style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--crt-amber)', display: 'block', marginBottom: '4px' }}>
              {IS_EXERCISE ? 'TOTAL EXERCISE MINIMUM (FALLBACK)' : 'EXERCISE MINIMUM'}
            </label>
            <input
              type="number"
              min={1}
              value={exerciseMinimum}
              onChange={e => setExerciseMinimum(parseInt(e.target.value) || 1)}
              style={{ ...inputStyle, width: '80px' }}
            />
          </div>

          {/* Per-type exercise requirements (exercise theme only) */}
          {IS_EXERCISE && (
            <div>
              <label style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--crt-amber)', display: 'block', marginBottom: '8px' }}>
                EXERCISE TYPE REQUIREMENTS (0 = NO REQUIREMENT)
              </label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#FF4444', display: 'block', marginBottom: '4px' }}>
                    {'\u{1F3C3}'} CARDIO
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={cardioReq}
                    onChange={e => setCardioReq(parseInt(e.target.value) || 0)}
                    style={{ ...inputStyle, width: '60px' }}
                  />
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#4488FF', display: 'block', marginBottom: '4px' }}>
                    {'\u{1F4AA}'} STRENGTH
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={strengthReq}
                    onChange={e => setStrengthReq(parseInt(e.target.value) || 0)}
                    style={{ ...inputStyle, width: '60px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bingo items */}
          <div>
            <label style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--crt-amber)', display: 'block', marginBottom: '4px' }}>
              BINGO ITEMS
            </label>
            <div className="stack" style={{ gap: '6px' }}>
              {bingoItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={item}
                    onChange={e => updateItem(idx, e.target.value)}
                    placeholder={`ITEM ${idx + 1}`}
                    style={inputStyle}
                  />
                  {bingoItems.length > 1 && (
                    <button
                      onClick={() => removeItem(idx)}
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '9px',
                        color: '#AA0000',
                        background: 'none',
                        border: '1px solid #AA0000',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        flexShrink: 0,
                      }}
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button onClick={addItem} style={{ marginTop: '6px', fontSize: '7px' }}>
              + ADD ITEM
            </Button>
          </div>

          {/* Challenge mode toggle */}
          <div>
            <label style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--crt-amber)', display: 'block', marginBottom: '4px' }}>
              CHALLENGE MODE
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setChallengeMode('individual')}
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '8px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  border: challengeMode === 'individual' ? '2px solid var(--crt-amber)' : '1px solid var(--bevel-shadow)',
                  background: challengeMode === 'individual' ? 'var(--amiga-black)' : 'transparent',
                  color: challengeMode === 'individual' ? 'var(--crt-amber)' : 'var(--amiga-dark-grey)',
                }}
              >
                INDIVIDUAL
              </button>
              <button
                onClick={() => setChallengeMode('group')}
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '8px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  border: challengeMode === 'group' ? '2px solid var(--crt-amber)' : '1px solid var(--bevel-shadow)',
                  background: challengeMode === 'group' ? 'var(--amiga-black)' : 'transparent',
                  color: challengeMode === 'group' ? 'var(--crt-amber)' : 'var(--amiga-dark-grey)',
                }}
              >
                GROUP
              </button>
            </div>
          </div>

          {/* Team editor (group mode) */}
          {challengeMode === 'group' && (
            <div>
              <label style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--crt-amber)', display: 'block', marginBottom: '8px' }}>
                TEAMS
              </label>
              <div className="stack" style={{ gap: '10px' }}>
                {teams.map((team, tidx) => (
                  <div key={tidx} style={{
                    border: '1px solid var(--bevel-shadow)',
                    padding: '8px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <input
                        type="text"
                        value={team.name}
                        onChange={e => {
                          const updated = [...teams]
                          updated[tidx] = { ...updated[tidx], name: e.target.value }
                          setTeams(updated)
                        }}
                        placeholder="TEAM NAME"
                        style={{ ...inputStyle, width: '60%' }}
                      />
                      <button
                        onClick={() => setTeams(teams.filter((_, i) => i !== tidx))}
                        style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '7px',
                          color: '#AA0000',
                          background: 'none',
                          border: '1px solid #AA0000',
                          cursor: 'pointer',
                          padding: '4px 8px',
                        }}
                      >
                        REMOVE
                      </button>
                    </div>
                    <label style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--amiga-dark-grey)', display: 'block', marginBottom: '4px' }}>
                      MEMBERS
                    </label>
                    {/* Added member badges */}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      {team.members.filter(Boolean).map(member => (
                        <span key={member} style={{
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '7px',
                          color: 'var(--crt-amber)',
                          background: 'var(--amiga-black)',
                          border: '1px solid var(--crt-amber)',
                          padding: '3px 6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          {member.toUpperCase()}
                          <button
                            onClick={() => {
                              const updated = [...teams]
                              updated[tidx] = {
                                ...updated[tidx],
                                members: updated[tidx].members.filter(m => m !== member),
                              }
                              setTeams(updated)
                            }}
                            style={{
                              fontFamily: 'var(--font-pixel)',
                              fontSize: '7px',
                              color: '#AA0000',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              lineHeight: 1,
                            }}
                          >
                            X
                          </button>
                        </span>
                      ))}
                      {team.members.filter(Boolean).length === 0 && (
                        <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--amiga-dark-grey)' }}>
                          NO MEMBERS YET
                        </span>
                      )}
                    </div>
                    {/* Available players to add */}
                    {(() => {
                      const thisTeamMembers = new Set(team.members.map(m => m.toLowerCase()))
                      const otherTeamMembers = new Set(
                        teams.filter((_, i) => i !== tidx).flatMap(t => t.members.map(m => m.toLowerCase()))
                      )
                      const unassigned = allPlayers.filter(p => !thisTeamMembers.has(p.toLowerCase()))
                      return unassigned.length > 0 ? (
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                          {unassigned.map(player => {
                            const inOtherTeam = otherTeamMembers.has(player.toLowerCase())
                            return (
                            <button
                              key={player}
                              disabled={inOtherTeam}
                              onClick={() => {
                                if (inOtherTeam) return
                                const updated = [...teams]
                                updated[tidx] = {
                                  ...updated[tidx],
                                  members: [...updated[tidx].members, player.toLowerCase()],
                                }
                                setTeams(updated)
                              }}
                              style={{
                                fontFamily: 'var(--font-pixel)',
                                fontSize: '6px',
                                color: inOtherTeam ? '#555' : 'var(--amiga-dark-grey)',
                                background: inOtherTeam ? '#1a1a1a' : 'transparent',
                                border: inOtherTeam ? '1px solid #333' : '1px solid var(--bevel-shadow)',
                                padding: '3px 6px',
                                cursor: inOtherTeam ? 'not-allowed' : 'pointer',
                                opacity: inOtherTeam ? 0.4 : 1,
                                textDecoration: inOtherTeam ? 'line-through' : 'none',
                              }}
                            >
                              + {player.toUpperCase()}
                            </button>
                            )
                          })}
                        </div>
                      ) : (
                        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--amiga-dark-grey)' }}>
                          ALL PLAYERS ASSIGNED
                        </div>
                      )
                    })()}
                  </div>
                ))}
              </div>
              <Button
                onClick={() => setTeams([...teams, { name: '', members: [] }])}
                style={{ marginTop: '6px', fontSize: '7px' }}
              >
                + ADD TEAM
              </Button>
            </div>
          )}

          {/* Save */}
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'SAVING...' : 'SAVE CHALLENGE'}
          </Button>
        </div>
      </Window>

      {/* Existing challenges */}
      {challenges.length > 0 && (
        <Window title="ALL CHALLENGES">
          <div className="stack" style={{ gap: '8px' }}>
            {challenges.map(ch => (
              <div key={ch.id} style={{
                border: '1px solid var(--bevel-shadow)',
                padding: '8px',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '9px',
                    color: 'var(--crt-amber)',
                  }}>
                    {ch.weekKey}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button onClick={() => handleEdit(ch)} style={{ fontSize: '6px', padding: '3px 6px' }}>
                      EDIT
                    </Button>
                    <button
                      onClick={() => handleDelete(ch.weekKey)}
                      style={{
                        fontFamily: 'var(--font-pixel)',
                        fontSize: '6px',
                        color: '#AA0000',
                        background: 'none',
                        border: '1px solid #AA0000',
                        cursor: 'pointer',
                        padding: '3px 6px',
                      }}
                    >
                      DELETE
                    </button>
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color: 'var(--amiga-dark-grey)',
                  marginBottom: '4px',
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}>
                  <span style={{
                    background: ch.challengeMode === 'group' ? '#884400' : '#004488',
                    color: '#FFFFFF',
                    padding: '1px 6px',
                    fontSize: '6px',
                  }}>
                    {(ch.challengeMode ?? 'individual').toUpperCase()}
                  </span>
                  <span>MIN EXERCISES: {ch.exerciseMinimum}</span>
                  {ch.exerciseRequirements && (
                    <span>
                      ({Object.entries(ch.exerciseRequirements).map(([t, n]) => `${t}: ${n}`).join(', ')})
                    </span>
                  )}
                  {ch.teams && ch.teams.length > 0 && (
                    <span>{ch.teams.length} TEAMS</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {ch.bingoItems.map(item => (
                    <span key={item} style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '7px',
                      color: 'var(--crt-amber)',
                      background: 'var(--amiga-black)',
                      padding: '2px 6px',
                      border: '1px solid var(--bevel-shadow)',
                    }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Window>
      )}
    </div>
  )
}
