'use client'

import { useState, useEffect } from 'react'
import { useName } from '@/lib/useName'

interface Props {
  profileName: string
}

const SLACK_SVG = (
  <svg width="20" height="20" viewBox="0 0 54 54" style={{ display: 'block' }}>
    <path d="M19.7 43.3a4.8 4.8 0 01-4.8 4.8 4.8 4.8 0 01-4.8-4.8 4.8 4.8 0 014.8-4.8h4.8v4.8zm2.4 0a4.8 4.8 0 014.8-4.8 4.8 4.8 0 014.8 4.8v12a4.8 4.8 0 01-4.8 4.8 4.8 4.8 0 01-4.8-4.8v-12z" fill="#E01E5A"/>
    <path d="M26.9 19.7a4.8 4.8 0 01-4.8-4.8 4.8 4.8 0 014.8-4.8 4.8 4.8 0 014.8 4.8v4.8h-4.8zm0 2.4a4.8 4.8 0 014.8 4.8 4.8 4.8 0 01-4.8 4.8h-12a4.8 4.8 0 01-4.8-4.8 4.8 4.8 0 014.8-4.8h12z" fill="#36C5F0"/>
    <path d="M34.3 26.9a4.8 4.8 0 014.8-4.8 4.8 4.8 0 014.8 4.8 4.8 4.8 0 01-4.8 4.8h-4.8v-4.8zm-2.4 0a4.8 4.8 0 01-4.8 4.8 4.8 4.8 0 01-4.8-4.8v-12a4.8 4.8 0 014.8-4.8 4.8 4.8 0 014.8 4.8v12z" fill="#2EB67D"/>
    <path d="M26.9 34.3a4.8 4.8 0 014.8 4.8 4.8 4.8 0 01-4.8 4.8 4.8 4.8 0 01-4.8-4.8v-4.8h4.8zm0-2.4a4.8 4.8 0 01-4.8-4.8 4.8 4.8 0 014.8-4.8h12a4.8 4.8 0 014.8 4.8 4.8 4.8 0 01-4.8 4.8h-12z" fill="#ECB22E"/>
  </svg>
)

export function SlackStatus({ profileName }: Props) {
  const { name } = useName()
  const [slackId, setSlackId] = useState('')
  const [savedSlackId, setSavedSlackId] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const isOwner = name === profileName.toLowerCase()

  useEffect(() => {
    fetch(`/api/player-goal?playerName=${encodeURIComponent(profileName)}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.slackUserId) {
          setSlackId(data.slackUserId)
          setSavedSlackId(data.slackUserId)
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [profileName])

  if (!loaded) return null

  const hasSlack = !!savedSlackId

  // Non-owner: just show icon if connected
  if (!isOwner) {
    if (!hasSlack) return null
    return (
      <span title="Slack connected" style={{ position: 'relative', display: 'inline-flex' }}>
        {SLACK_SVG}
        <span style={{
          position: 'absolute', bottom: '-2px', right: '-4px',
          width: '9px', height: '9px', borderRadius: '50%',
          background: '#44CC44', border: '2px solid #000',
        }} />
      </span>
    )
  }

  // Owner editing
  if (editing) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <input
          type="text"
          placeholder="U0XXXXXXX"
          value={slackId}
          onChange={e => setSlackId(e.target.value.trim())}
          autoFocus
          onKeyDown={e => {
            if (e.key === 'Enter' && slackId) handleSave()
            if (e.key === 'Escape') { setSlackId(savedSlackId); setEditing(false) }
          }}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            width: '110px',
            textAlign: 'center',
            padding: '3px 6px',
            border: '2px solid var(--crt-amber)',
            background: '#0a0a0a',
            color: 'var(--crt-amber)',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            background: 'var(--amiga-orange, #FF8800)',
            color: '#000',
            border: 'none',
            padding: '3px 8px',
            cursor: saving ? 'wait' : 'pointer',
          }}
        >
          {saving ? '...' : 'SAVE'}
        </button>
        <button
          onClick={async () => {
            if (!slackId) return
            setTesting(true)
            setTestResult(null)
            try {
              const res = await fetch('/api/slack-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName: profileName, slackUserId: slackId }),
              })
              setTestResult(res.ok ? '✓' : '✗')
            } catch { setTestResult('✗') }
            finally {
              setTesting(false)
              setTimeout(() => setTestResult(null), 3000)
            }
          }}
          disabled={testing || !slackId}
          title="Send test notification to this Slack ID"
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            background: '#0a0a0a',
            color: testResult === '✓' ? '#44CC44' : testResult === '✗' ? '#FF4444' : 'var(--crt-amber)',
            border: '1px solid #333',
            padding: '3px 6px',
            cursor: testing || !slackId ? 'not-allowed' : 'pointer',
            borderRadius: '3px',
          }}
        >
          {testing ? '...' : testResult || '📨'}
        </button>
        <button
          onClick={() => { setSlackId(savedSlackId); setEditing(false) }}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            background: 'transparent',
            color: 'var(--amiga-dark-grey)',
            border: '1px solid var(--bevel-shadow)',
            padding: '3px 6px',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
    )
  }

  // Owner display: clickable button with label
  return (
    <button
      onClick={() => setEditing(true)}
      title={hasSlack ? 'Click to edit Slack ID' : 'Click to connect Slack'}
      style={{
        background: '#0a0a0a',
        border: hasSlack ? '1px solid #44CC44' : '1px solid var(--crt-amber)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        borderRadius: '4px',
      }}
    >
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        {SLACK_SVG}
        {hasSlack && (
          <span style={{
            position: 'absolute', bottom: '-1px', right: '-3px',
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#44CC44', border: '1.5px solid #000',
          }} />
        )}
      </span>
      <span style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '8px',
        color: hasSlack ? '#44CC44' : 'var(--crt-amber)',
      }}>
        {hasSlack ? 'SLACK CONNECTED' : 'CONNECT SLACK'}
      </span>
    </button>
  )

  async function handleSave() {
    setSaving(true)
    try {
      const goalRes = await fetch(`/api/player-goal?playerName=${encodeURIComponent(profileName)}`)
      const goalData = goalRes.ok ? await goalRes.json() : null

      const res = await fetch('/api/player-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: profileName,
          cardioTarget: goalData?.cardioTarget ?? 0,
          strengthTarget: goalData?.strengthTarget ?? 0,
          slackUserId: slackId,
        }),
      })
      if (res.ok) {
        setSavedSlackId(slackId)
        setEditing(false)
      }
    } catch { /* silent */ }
    finally { setSaving(false) }
  }

}
