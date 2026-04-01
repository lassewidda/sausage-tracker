'use client'

import { useState, useEffect } from 'react'
import { useName } from '@/lib/useName'

interface Props {
  profileName: string
}

export function GoalEditor({ profileName }: Props) {
  const { name, loaded } = useName()
  const [cardioTarget, setCardioTarget] = useState(0)
  const [strengthTarget, setStrengthTarget] = useState(0)
  const [savedCardio, setSavedCardio] = useState(0)
  const [savedStrength, setSavedStrength] = useState(0)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasGoal, setHasGoal] = useState(false)
  const [fetchDone, setFetchDone] = useState(false)

  const isOwner = loaded && name === profileName.toLowerCase()

  useEffect(() => {
    fetch(`/api/player-goal?playerName=${encodeURIComponent(profileName)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setCardioTarget(data.cardioTarget)
          setStrengthTarget(data.strengthTarget)
          setSavedCardio(data.cardioTarget)
          setSavedStrength(data.strengthTarget)
          setHasGoal(data.cardioTarget > 0 || data.strengthTarget > 0)
        }
        setFetchDone(true)
      })
      .catch(() => setFetchDone(true))
  }, [profileName])

  if (!fetchDone) return null

  // Show badges for non-owners if they have a goal
  if (!isOwner) {
    if (!hasGoal) return null
    return (
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        padding: '8px 0',
      }}>
        {savedCardio > 0 && <GoalBadge icon={'\u{1F3C3}'} count={savedCardio} label="CARDIO" />}
        {savedStrength > 0 && <GoalBadge icon={'\u{1F4AA}'} count={savedStrength} label="STRENGTH" />}
      </div>
    )
  }

  // Owner: show editor or badges
  if (!editing && hasGoal) {
    return (
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '8px 0',
      }}>
        {savedCardio > 0 && <GoalBadge icon={'\u{1F3C3}'} count={savedCardio} label="CARDIO" />}
        {savedStrength > 0 && <GoalBadge icon={'\u{1F4AA}'} count={savedStrength} label="STRENGTH" />}
        <button
          onClick={() => setEditing(true)}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            background: 'var(--amiga-dark-grey)',
            color: 'var(--amiga-white)',
            border: '2px solid var(--bevel-shadow)',
            padding: '4px 8px',
            cursor: 'pointer',
          }}
        >
          EDIT
        </button>
      </div>
    )
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/player-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: profileName,
          cardioTarget,
          strengthTarget,
        }),
      })
      if (res.ok) {
        setSavedCardio(cardioTarget)
        setSavedStrength(strengthTarget)
        setHasGoal(cardioTarget > 0 || strengthTarget > 0)
        setEditing(false)
      }
    } catch (err) {
      console.error('Failed to save goal:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      background: 'var(--amiga-grey)',
      border: '2px solid var(--bevel-shadow)',
      padding: '12px',
      marginBottom: '4px',
    }}>
      <div style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '10px',
        color: 'var(--amiga-black)',
        marginBottom: '12px',
        textAlign: 'center',
        letterSpacing: '1px',
      }}>
        SET YOUR WEEKLY GOALS
      </div>

      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '12px' }}>
        <div style={{ textAlign: 'center' }}>
          <label style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: 'var(--amiga-black)',
            display: 'block',
            marginBottom: '4px',
          }}>
            CARDIO PER WEEK
          </label>
          <input
            type="number"
            min={0}
            max={50}
            value={cardioTarget}
            onChange={e => setCardioTarget(Math.max(0, parseInt(e.target.value) || 0))}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '14px',
              width: '60px',
              textAlign: 'center',
              padding: '4px',
              border: '2px solid var(--bevel-shadow)',
              background: 'var(--amiga-white)',
            }}
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <label style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: 'var(--amiga-black)',
            display: 'block',
            marginBottom: '4px',
          }}>
            STRENGTH PER WEEK
          </label>
          <input
            type="number"
            min={0}
            max={50}
            value={strengthTarget}
            onChange={e => setStrengthTarget(Math.max(0, parseInt(e.target.value) || 0))}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '14px',
              width: '60px',
              textAlign: 'center',
              padding: '4px',
              border: '2px solid var(--bevel-shadow)',
              background: 'var(--amiga-white)',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button
          onClick={handleSave}
          disabled={saving || (cardioTarget === 0 && strengthTarget === 0)}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            background: saving ? 'var(--amiga-dark-grey)' : 'var(--amiga-orange, #FF8800)',
            color: '#000',
            border: '2px solid var(--bevel-shadow)',
            padding: '6px 16px',
            cursor: saving ? 'wait' : 'pointer',
            opacity: (cardioTarget === 0 && strengthTarget === 0) ? 0.5 : 1,
          }}
        >
          {saving ? 'SAVING...' : 'SAVE GOAL'}
        </button>
        {hasGoal && (
          <button
            onClick={() => {
              setCardioTarget(savedCardio)
              setStrengthTarget(savedStrength)
              setEditing(false)
            }}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '9px',
              background: 'var(--amiga-grey)',
              color: 'var(--amiga-black)',
              border: '2px solid var(--bevel-shadow)',
              padding: '6px 12px',
              cursor: 'pointer',
            }}
          >
            CANCEL
          </button>
        )}
      </div>
    </div>
  )
}

function GoalBadge({ icon, count, label }: { icon: string; count: number; label: string }) {
  return (
    <span style={{
      fontFamily: 'var(--font-pixel)',
      fontSize: '9px',
      background: 'var(--amiga-black)',
      color: 'var(--crt-amber)',
      padding: '4px 8px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      textShadow: '0 0 4px var(--crt-amber)',
    }}>
      {icon} {count}/WEEK {label}
    </span>
  )
}
