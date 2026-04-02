'use client'

import { useState, useEffect } from 'react'
import { useName } from '@/lib/useName'

interface Props {
  profileName: string
}

export function SlackConnector({ profileName }: Props) {
  const { name, loaded } = useName()
  const [slackId, setSlackId] = useState('')
  const [savedSlackId, setSavedSlackId] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fetchDone, setFetchDone] = useState(false)

  const isOwner = loaded && name === profileName.toLowerCase()

  useEffect(() => {
    fetch(`/api/player-goal?playerName=${encodeURIComponent(profileName)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setSlackId(data.slackUserId || '')
          setSavedSlackId(data.slackUserId || '')
        }
        setFetchDone(true)
      })
      .catch(() => setFetchDone(true))
  }, [profileName])

  if (!fetchDone || !isOwner) return null

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/player-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: profileName,
          cardioTarget: 0,
          strengthTarget: 0,
          slackUserId: slackId,
        }),
      })
      if (res.ok) {
        setSavedSlackId(slackId)
        setEditing(false)
      }
    } catch (err) {
      console.error('Failed to save slack ID:', err)
    } finally {
      setSaving(false)
    }
  }

  if (savedSlackId && !editing) return null

  if (!editing) {
    return (
      <div style={{ textAlign: 'center', padding: '4px 0' }}>
        <button
          onClick={() => setEditing(true)}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            background: 'transparent',
            color: 'var(--amiga-dark-grey)',
            border: '1px solid var(--bevel-shadow)',
            padding: '4px 10px',
            cursor: 'pointer',
          }}
        >
          CONNECT SLACK
        </button>
      </div>
    )
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
      }}>
        CONNECT SLACK
      </div>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <input
          type="text"
          placeholder="U0XXXXXXX"
          value={slackId}
          onChange={e => setSlackId(e.target.value.trim())}
          autoFocus
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            width: '160px',
            textAlign: 'center',
            padding: '6px',
            border: '2px solid var(--bevel-shadow)',
            background: 'var(--amiga-white)',
          }}
        />
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '6px',
          color: 'var(--amiga-dark-grey)',
          marginTop: '4px',
        }}>
          Slack profile → ⋮ → Copy member ID
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button
          onClick={handleSave}
          disabled={saving || !slackId}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            background: saving ? 'var(--amiga-dark-grey)' : 'var(--amiga-orange, #FF8800)',
            color: '#000',
            border: '2px solid var(--bevel-shadow)',
            padding: '6px 16px',
            cursor: saving ? 'wait' : 'pointer',
            opacity: !slackId ? 0.5 : 1,
          }}
        >
          {saving ? 'SAVING...' : 'SAVE'}
        </button>
        <button
          onClick={() => { setSlackId(savedSlackId); setEditing(false) }}
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
      </div>
    </div>
  )
}
