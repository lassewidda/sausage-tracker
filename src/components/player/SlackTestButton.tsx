'use client'

import { useState } from 'react'
import { useName } from '@/lib/useName'

interface Props {
  profileName: string
  hasSlack: boolean
}

export function SlackTestButton({ profileName, hasSlack }: Props) {
  const { name } = useName()
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const isOwner = name === profileName.toLowerCase()
  if (!isOwner || !hasSlack) return null

  return (
    <button
      onClick={async () => {
        setTesting(true)
        setResult(null)
        try {
          const res = await fetch('/api/slack-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playerName: profileName }),
          })
          if (res.ok) {
            setResult('✓')
          } else {
            const data = await res.json()
            setResult(data.error || '✗')
          }
        } catch {
          setResult('✗')
        } finally {
          setTesting(false)
          setTimeout(() => setResult(null), 3000)
        }
      }}
      disabled={testing}
      title="Send test Slack notification"
      style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '7px',
        background: '#0a0a0a',
        color: result === '✓' ? '#44CC44' : result ? '#FF4444' : 'var(--crt-amber)',
        border: '1px solid #333',
        padding: '2px 6px',
        cursor: testing ? 'wait' : 'pointer',
        borderRadius: '3px',
      }}
    >
      {testing ? '...' : result || '📨 TEST'}
    </button>
  )
}
