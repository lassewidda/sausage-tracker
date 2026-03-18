'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  playerName: string
  cardCreatedAt: string
}

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function RegenerateButton({ playerName, cardCreatedAt }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const age = Date.now() - new Date(cardCreatedAt).getTime()
  const canRegenerate = age >= ONE_WEEK_MS
  const nextDate = new Date(new Date(cardCreatedAt).getTime() + ONE_WEEK_MS)

  function daysUntil(date: Date): number {
    return Math.max(1, Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
  }

  async function handleRegenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/hero-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName }),
      })
      if (res.status === 429) {
        setError('Too soon — try again next week')
        return
      }
      if (!res.ok) {
        setError('Generation failed')
        return
      }
      router.refresh()
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '12px' }}>
      <button
        onClick={handleRegenerate}
        disabled={!canRegenerate || loading}
        className="amiga-btn"
        style={{
          opacity: canRegenerate ? 1 : 0.5,
          fontSize: '8px',
        }}
      >
        {loading ? '🔄 GENERATING...' : '🔄 REGENERATE CARD'}
      </button>
      {!canRegenerate && (
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          color: 'var(--amiga-dark-grey)',
          marginTop: '6px',
        }}>
          NEXT REGENERATION IN {daysUntil(nextDate)} DAY{daysUntil(nextDate) !== 1 ? 'S' : ''}
        </div>
      )}
      {error && (
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          color: '#AA0000',
          marginTop: '6px',
        }}>
          {error.toUpperCase()}
        </div>
      )}
    </div>
  )
}
