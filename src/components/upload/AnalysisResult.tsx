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
            fontSize: '7px',
            textTransform: 'uppercase',
            color: 'var(--amiga-white)',
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          ADJUST COUNT IF NEEDED:
        </div>
        <CountStepper count={count} onChange={setCount} />
      </div>

      {/* Confirm button */}
      <div className="row row--center">
        <Button
          variant="primary"
          size="large"
          onClick={() => onConfirm(count)}
          disabled={isSaving}
        >
          {isSaving ? 'SAVING...' : `CONFIRM  +${count} POINT${count !== 1 ? 'S' : ''}`}
        </Button>
      </div>
    </div>
  )
}
