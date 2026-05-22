'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { AnalysisResult as IAnalysisResult } from '@/types'
import { Button } from '@/components/amiga/Button'
import { CountStepper } from './CountStepper'
import { ExerciseTypeSelector } from './ExerciseTypeSelector'
import theme from '@/theme'

const IS_EXERCISE = process.env.NEXT_PUBLIC_THEME === 'exercise'

interface AnalysisResultProps {
  blobUrl: string
  preview: string
  analysis: IAnalysisResult
  onConfirm: (count: number, exerciseType?: string) => void
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
  const [exerciseType, setExerciseType] = useState(analysis.exerciseType || 'cardio')

  const needsHealthWarning = !IS_EXERCISE && count >= theme.strings.healthWarningThreshold

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
          alt={theme.strings.photoAltText}
          fill
          style={{ objectFit: 'cover' }}
          unoptimized
        />
      </div>

      {/* AI detection badge */}
      <div className="row row--center">
        <div className="amiga-badge" style={analysis.failed ? { background: '#AA6600' } : undefined}>
          {analysis.failed
            ? 'AI UNAVAILABLE — PICK TYPE BELOW'
            : IS_EXERCISE
            ? `AI DETECTED: ${exerciseType.toUpperCase()} (${analysis.confidence} CONFIDENCE)`
            : theme.strings.aiDetectedLabel(analysis.count, analysis.confidence)}
          {!analysis.failed && !IS_EXERCISE && analysis.weightPerItem > 0 && (
            <>&nbsp;&mdash;&nbsp;~{analysis.weightPerItem}G/{theme.strings.itemName.toUpperCase()}</>
          )}
        </div>
      </div>

      {/* AI description */}
      {analysis.description && (
        <div className="amiga-info">
          &gt; {analysis.description.toUpperCase()}
        </div>
      )}

      {IS_EXERCISE ? (
        <>
          {/* Exercise type selector */}
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
              SELECT EXERCISE TYPE:
            </div>
            <ExerciseTypeSelector selected={exerciseType} onChange={setExerciseType} />
          </div>

          {/* Confirm button */}
          <div className="row row--center">
            <Button
              variant="primary"
              size="large"
              onClick={() => onConfirm(1, exerciseType)}
              disabled={isSaving}
            >
              {isSaving ? 'SAVING...' : `LOG ${exerciseType.toUpperCase()} WORKOUT`}
            </Button>
          </div>
        </>
      ) : (
        <>
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
              {theme.strings.adjustCountLabel}
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
                {theme.strings.healthWarningTitle}
              </div>
              <div style={{ marginBottom: '12px' }}>
                {theme.strings.healthWarningText(count)}
              </div>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={healthConfirmed}
                  onChange={(e) => setHealthConfirmed(e.target.checked)}
                  style={{ marginTop: '2px', accentColor: '#FFFF00', flexShrink: 0 }}
                />
                <span>{theme.strings.healthConfirmText(count)}</span>
              </label>
            </div>
          )}

          {/* Estimated weight */}
          {analysis.weightPerItem > 0 && (
            <div className="row row--center">
              <div className="amiga-badge" style={{ background: 'var(--amiga-dark-grey)' }}>
                {theme.strings.weightLabel}&nbsp;
                <span style={{ color: 'var(--crt-amber)' }}>
                  {theme.strings.weightEstLabel(analysis.weightPerItem, count)}
                </span>
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
              {isSaving ? 'SAVING...' : theme.strings.pointsLabel(count)}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
