'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { AnalysisResult as IAnalysisResult } from '@/types'
import { Button } from '@/components/amiga/Button'
import { CountStepper } from './CountStepper'

interface AnalysisResultProps {
  blobUrl: string
  preview: string
  analysis: IAnalysisResult
  onConfirm: (count: number) => void
  isSaving: boolean
}

export function AnalysisResult({
  blobUrl,
  preview,
  analysis,
  onConfirm,
  isSaving,
}: AnalysisResultProps) {
  const [count, setCount] = useState(analysis.count)
  const [healthConfirmed, setHealthConfirmed] = useState(false)

  const HEALTH_THRESHOLD = 5
  const needsHealthWarning = count >= HEALTH_THRESHOLD

  return (
    <div className="stack">
      {/* Image preview */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto',
          aspectRatio: '4/3',
          background: 'var(--amiga-black)',
          borderTop: '2px solid var(--bevel-shadow)',
          borderLeft: '2px solid var(--bevel-shadow)',
          borderRight: '2px solid var(--bevel-light)',
          borderBottom: '2px solid var(--bevel-light)',
          overflow: 'hidden',
        }}
      >
        <Image
          src={blobUrl || preview}
          alt="Uploaded meal"
          fill
          style={{ objectFit: 'cover' }}
          unoptimized
        />
      </div>

      {/* AI detection badge */}
      <div className="row row--center">
        <div className="amiga-badge">
          AI DETECTED:&nbsp;
          <span style={{ color: 'var(--crt-amber)' }}>
            {analysis.count} SAUSAGE{analysis.count !== 1 ? 'S' : ''}
          </span>
          &nbsp;&mdash;&nbsp;
          <span className={`confidence-${analysis.confidence}`}>
            {analysis.confidence.toUpperCase()} CONFIDENCE
          </span>
          {analysis.gramsPerSausage > 0 && (
            <>&nbsp;&mdash;&nbsp;~{analysis.gramsPerSausage}G/SAUSAGE</>
          )}
        </div>
      </div>

      {/* AI description */}
      {analysis.description && (
        <div className="amiga-info">
          &gt; {analysis.description.toUpperCase()}
        </div>
      )}

      {/* Manual count adjuster */}
      <div className="amiga-inset">
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            textTransform: 'uppercase',
            color: 'var(--amiga-white)',
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          ADJUST COUNT IF NEEDED:
        </div>
        <CountStepper count={count} onChange={(n) => { setCount(n); setHealthConfirmed(false) }} />
      </div>

      {/* Health warning */}
      {needsHealthWarning && (
        <div
          style={{
            background: '#AA0000',
            border: '2px solid #FF4444',
            padding: '12px 16px',
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            textTransform: 'uppercase',
            color: '#FFFFFF',
            lineHeight: '1.8',
          }}
        >
          <div style={{ color: '#FFFF00', marginBottom: '8px' }}>
            ⚠ HEALTH WARNING ⚠
          </div>
          <div style={{ marginBottom: '12px' }}>
            {count} SAUSAGES IN ONE MEAL IS A LOT. EATING THIS MANY SAUSAGES MAY NEGATIVELY IMPACT YOUR HEALTH. PLEASE CONFIRM YOU REALLY ATE THIS MANY.
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={healthConfirmed}
              onChange={(e) => setHealthConfirmed(e.target.checked)}
              style={{ marginTop: '2px', accentColor: '#FFFF00', flexShrink: 0 }}
            />
            <span>I CONFIRM I ATE {count} SAUSAGES AND UNDERSTAND THIS MAY IMPACT MY HEALTH NEGATIVELY</span>
          </label>
        </div>
      )}

      {/* Estimated weight */}
      {analysis.gramsPerSausage > 0 && (
        <div className="row row--center">
          <div className="amiga-badge" style={{ background: 'var(--amiga-dark-grey)' }}>
            EST. WEIGHT:&nbsp;
            <span style={{ color: 'var(--crt-amber)' }}>
              ~{analysis.gramsPerSausage * count}G
            </span>
            &nbsp;({analysis.gramsPerSausage}G &times; {count})
          </div>
        </div>
      )}

      {/* Confirm button */}
      <div className="row row--center">
        <Button
          variant="primary"
          size="large"
          onClick={() => onConfirm(count)}
          disabled={isSaving || (needsHealthWarning && !healthConfirmed)}
        >
          {isSaving ? 'SAVING...' : `CONFIRM  +${count} POINT${count !== 1 ? 'S' : ''}`}
        </Button>
      </div>
    </div>
  )
}
