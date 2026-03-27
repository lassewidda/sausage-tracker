'use client'

import { useCallback, useEffect, useState } from 'react'
import { Window } from '@/components/amiga/Window'
import { Button } from '@/components/amiga/Button'
import type { WeeklyChallenge } from '@/types'

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
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([])
  const [weekKey, setWeekKey] = useState(getCurrentWeekKey())
  const [bingoItems, setBingoItems] = useState<string[]>([''])
  const [exerciseMinimum, setExerciseMinimum] = useState(3)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

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
  }, [fetchChallenges])

  const handleSave = async () => {
    const items = bingoItems.map(s => s.trim()).filter(Boolean)
    if (items.length === 0) {
      setMessage('ADD AT LEAST ONE BINGO ITEM')
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekKey, bingoItems: items, exerciseMinimum }),
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

  return (
    <div className="stack" style={{ gap: '12px' }}>
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
              EXERCISE MINIMUM
            </label>
            <input
              type="number"
              min={1}
              value={exerciseMinimum}
              onChange={e => setExerciseMinimum(parseInt(e.target.value) || 1)}
              style={{ ...inputStyle, width: '80px' }}
            />
          </div>

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
                }}>
                  MIN EXERCISES: {ch.exerciseMinimum}
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
