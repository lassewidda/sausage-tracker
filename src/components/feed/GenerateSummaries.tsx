'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/amiga/Button'

interface Props {
  missingWeeks: string[]
}

export function GenerateSummaries({ missingWeeks }: Props) {
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (missingWeeks.length === 0 || done) return null

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')

    try {
      for (const week of missingWeeks) {
        await fetch('/api/weekly-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weekKey: week }),
        })
      }
      setDone(true)
      router.refresh()
    } catch {
      setError('FAILED TO GENERATE REPORTS. TRY AGAIN.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="amiga-inset" style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '9px',
        textTransform: 'uppercase',
        color: 'var(--amiga-white)',
        marginBottom: '10px',
      }}>
        📊 {missingWeeks.length} WEEK{missingWeeks.length !== 1 ? 'S' : ''} WITHOUT REPORTS
      </div>
      {error && (
        <div className="amiga-badge" style={{ background: '#AA0000', color: '#FFFFFF', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      <Button
        variant="primary"
        onClick={handleGenerate}
        disabled={generating}
      >
        {generating ? 'GENERATING...' : 'GENERATE WEEKLY REPORTS'}
      </Button>
    </div>
  )
}
