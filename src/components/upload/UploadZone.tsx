'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import type { UploadState, AnalysisResult as IAnalysisResult } from '@/types'
import { Button } from '@/components/amiga/Button'
import { AnalysisResult } from './AnalysisResult'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function UploadZone() {
  const router = useRouter()
  const [state, setState] = useState<UploadState>({ phase: 'idle' })
  const [isDragging, setIsDragging] = useState(false)

  const processFile = useCallback(async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setState({ phase: 'idle', error: 'UNSUPPORTED FILE TYPE. USE JPEG, PNG, WEBP OR GIF.' })
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setState({ phase: 'idle', error: 'FILE TOO LARGE. MAX 5MB.' })
      return
    }

    const preview = URL.createObjectURL(file)
    setState({ phase: 'uploading', preview })

    let blobUrl: string
    let blobPath: string

    try {
      const blob = await upload(`meals/${Date.now()}-${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/blob-upload',
      })
      blobUrl = blob.url
      blobPath = blob.pathname
    } catch (err) {
      setState({ phase: 'idle', error: 'UPLOAD FAILED. CHECK CONNECTION AND TRY AGAIN.' })
      console.error('Upload error:', err)
      return
    }

    setState({ phase: 'analyzing', preview, blobUrl, blobPath })

    let analysis: IAnalysisResult

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: blobUrl }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      analysis = await res.json()
    } catch (err) {
      setState({
        phase: 'idle',
        error: 'ANALYSIS FAILED. YOU CAN TRY AGAIN.',
      })
      console.error('Analyze error:', err)
      return
    }

    setState({
      phase: 'confirming',
      preview,
      blobUrl,
      blobPath,
      analysis,
    })
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
      e.target.value = '' // reset so same file can be re-uploaded
    },
    [processFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleConfirm = useCallback(
    async (confirmedCount: number) => {
      if (!state.blobUrl || !state.blobPath || !state.analysis) return

      setState((s) => ({ ...s, phase: 'saving' }))

      try {
        const res = await fetch('/api/meals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: state.blobUrl,
            blobPath: state.blobPath,
            sausageCount: confirmedCount,
            aiSuggestedCount: state.analysis.count,
            aiDescription: state.analysis.description,
          }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        setState({
          phase: 'success',
          confirmedCount,
        })
      } catch (err) {
        setState((s) => ({ ...s, phase: 'confirming', error: 'SAVE FAILED. TRY AGAIN.' }))
        console.error('Save error:', err)
      }
    },
    [state]
  )

  const reset = useCallback(() => {
    setState({ phase: 'idle' })
  }, [])

  // ── RENDER ──────────────────────────────────────────────────────────────────

  if (state.phase === 'success') {
    return (
      <div className="success-screen">
        <div className="amiga-gauge amiga-gauge--large">
          +{state.confirmedCount}
        </div>
        <div className="success-score">
          SAUSAGE{state.confirmedCount !== 1 ? 'S' : ''} RECORDED!
          <br />
          {state.confirmedCount} POINT{state.confirmedCount !== 1 ? 'S' : ''} ADDED TO YOUR SCORE
        </div>
        <div className="row row--center" style={{ gap: '12px', flexWrap: 'wrap' }}>
          <Button onClick={reset}>ADD ANOTHER MEAL</Button>
          <Button
            variant="primary"
            onClick={() => {
              router.push('/gallery')
              router.refresh()
            }}
          >
            VIEW GALLERY
          </Button>
        </div>
      </div>
    )
  }

  if (state.phase === 'confirming' || state.phase === 'saving') {
    return (
      <div className="stack">
        {state.error && (
          <div className="amiga-badge" style={{ background: '#AA0000', color: '#FFFFFF' }}>
            {state.error}
          </div>
        )}
        <AnalysisResult
          blobUrl={state.blobUrl ?? ''}
          preview={state.preview ?? ''}
          analysis={state.analysis!}
          onConfirm={handleConfirm}
          isSaving={state.phase === 'saving'}
        />
      </div>
    )
  }

  if (state.phase === 'uploading' || state.phase === 'analyzing') {
    return (
      <div className="stack" style={{ alignItems: 'center', padding: '32px' }}>
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'var(--amiga-black)',
          }}
        >
          {state.phase === 'uploading' ? 'UPLOADING IMAGE' : 'ANALYZING WITH AI'}
          <span className="amiga-blink"> ...</span>
        </div>
        <div className="amiga-progress" style={{ width: '100%', maxWidth: '300px' }}>
          <div
            className="amiga-progress__bar"
            style={{ width: state.phase === 'uploading' ? '50%' : '90%' }}
          />
        </div>
        {state.preview && (
          <div
            style={{
              width: '120px',
              height: '90px',
              background: 'var(--amiga-black)',
              overflow: 'hidden',
              borderTop: '2px solid var(--bevel-shadow)',
              borderLeft: '2px solid var(--bevel-shadow)',
              borderRight: '2px solid var(--bevel-light)',
              borderBottom: '2px solid var(--bevel-light)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.preview}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}
      </div>
    )
  }

  // Idle state
  return (
    <div className="stack">
      {state.error && (
        <div
          className="amiga-badge"
          style={{ background: '#AA0000', color: '#FFFFFF', alignSelf: 'center' }}
        >
          {state.error}
        </div>
      )}
      <label
        className={`amiga-dropzone ${isDragging ? 'amiga-dropzone--hover' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input type="file" accept="image/*" onChange={handleFileInput} />
        <div style={{ fontSize: '32px' }}>🌭</div>
        <div>DROP MEAL PHOTO HERE</div>
        <div style={{ color: 'var(--amiga-grey)', fontSize: '7px' }}>
          OR CLICK TO SELECT FILE
        </div>
        <div style={{ color: 'var(--amiga-dark-grey)', fontSize: '6px' }}>
          JPEG / PNG / WEBP / GIF &mdash; MAX 5MB
        </div>
      </label>
    </div>
  )
}
