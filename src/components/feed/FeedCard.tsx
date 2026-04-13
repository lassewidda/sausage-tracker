'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Meal } from '@/types'
import { useName } from '@/lib/useName'
import { DeleteButton } from './DeleteButton'
import { ImageLightbox } from './ImageLightbox'
import theme from '@/theme'

const IS_EXERCISE = process.env.NEXT_PUBLIC_THEME === 'exercise'

const EXERCISE_TYPE_BADGES: Record<string, { emoji: string; label: string; color: string }> = {
  cardio: { emoji: '\u{1F3C3}', label: 'CARDIO', color: '#FF4444' },
  strength: { emoji: '\u{1F4AA}', label: 'STRENGTH', color: '#4488FF' },
  photo: { emoji: '\u{1F4F8}', label: 'PHOTO', color: '#CC44CC' },
}

interface FeedCardProps {
  meal: Meal
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'JUST NOW'
  if (mins < 60) return `${mins}M AGO`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}H AGO`
  const days = Math.floor(hrs / 24)
  return `${days}D AGO`
}

function ExpandableDescription({ text, mealId, mealPlayerName }: { text: string; mealId: string; mealPlayerName: string }) {
  const { name } = useName()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const [displayText, setDisplayText] = useState(text)
  const [saving, setSaving] = useState(false)
  const needsTruncation = displayText.length > 120
  const canEdit = name === mealPlayerName

  if (editing) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: 'var(--amiga-black)',
            background: 'var(--amiga-white)',
            border: '1px solid var(--amiga-dark-grey)',
            padding: '4px 6px',
            resize: 'vertical',
            minHeight: '48px',
            width: '100%',
          }}
        />
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            disabled={saving || !draft.trim()}
            onClick={async () => {
              setSaving(true)
              try {
                const res = await fetch(`/api/meals/${mealId}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ playerName: name, description: draft.trim() }),
                })
                if (res.ok) {
                  setDisplayText(draft.trim())
                  setEditing(false)
                }
              } catch { /* ignore */ }
              setSaving(false)
            }}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              background: '#006600',
              color: '#FFFFFF',
              border: 'none',
              padding: '3px 8px',
              cursor: 'pointer',
            }}
          >
            {saving ? '...' : 'SAVE'}
          </button>
          <button
            onClick={() => { setDraft(displayText); setEditing(false) }}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              background: 'var(--amiga-grey)',
              color: 'var(--amiga-black)',
              border: '1px solid var(--amiga-dark-grey)',
              padding: '3px 8px',
              cursor: 'pointer',
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div
        className="amiga-info"
        style={{ cursor: needsTruncation ? 'pointer' : 'default' }}
        onClick={needsTruncation ? () => setExpanded(e => !e) : undefined}
      >
        {!expanded && needsTruncation ? displayText.slice(0, 117) + '...' : displayText}
      </div>
      {canEdit && (
        <button
          onClick={() => { setDraft(displayText); setEditing(true) }}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            background: 'transparent',
            color: 'var(--amiga-dark-grey)',
            border: '1px solid var(--amiga-dark-grey)',
            padding: '2px 6px',
            cursor: 'pointer',
            alignSelf: 'flex-start',
          }}
        >
          EDIT
        </button>
      )}
    </div>
  )
}

export function FeedCard({ meal }: FeedCardProps) {
  return (
    <div className="amiga-window" style={{ width: '100%' }}>
      {/* Title bar with player name */}
      <div className="amiga-window__titlebar">
        <div className="amiga-window__gadget" />
        <Link href={`/player/${encodeURIComponent(meal.playerName)}`} className="amiga-window__title" style={{ textDecoration: 'none', color: 'inherit' }}>{meal.playerName.toUpperCase()}</Link>
        <div className="amiga-window__gadget" />
      </div>

      <div style={{ display: 'flex', gap: '0', minHeight: '140px' }}>
        {/* Image */}
        <div style={{ position: 'relative', width: 'clamp(110px, 35vw, 180px)', flexShrink: 0, background: 'var(--amiga-black)' }}>
          <ImageLightbox src={meal.imageUrl} alt={meal.aiDescription ?? theme.strings.photoAltText}>
            <Image
              src={meal.imageUrl}
              alt={meal.aiDescription ?? theme.strings.photoAltText}
              fill
              style={{ objectFit: 'cover' }}
              unoptimized
              sizes="180px"
            />
          </ImageLightbox>
        </div>

        {/* Details */}
        <div style={{
          flex: 1,
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: 'var(--amiga-grey)',
        }}>
          {/* Score */}
          <div className="row" style={{ gap: '10px', alignItems: 'center' }}>
            {IS_EXERCISE && meal.exerciseType ? (() => {
              const badge = EXERCISE_TYPE_BADGES[meal.exerciseType] ?? EXERCISE_TYPE_BADGES.cardio
              return (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--amiga-black)',
                  padding: '4px 10px',
                  border: `2px solid ${badge.color}`,
                }}>
                  <span style={{ fontSize: '16px' }}>{badge.emoji}</span>
                  <span style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '9px',
                    color: badge.color,
                    textTransform: 'uppercase',
                  }}>
                    {badge.label}
                  </span>
                </div>
              )
            })() : (
              <>
                <div className="amiga-gauge amiga-gauge--small">{String(meal.itemCount).padStart(2, '0')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    color: 'var(--amiga-black)',
                  }}>
                    SAUSAGE{meal.itemCount !== 1 ? 'S' : ''}
                  </span>
                  {meal.estimatedGrams != null && meal.estimatedGrams > 0 && (
                    <span style={{
                      fontFamily: 'var(--font-pixel)',
                      fontSize: '8px',
                      color: 'var(--amiga-dark-grey)',
                    }}>
                      ~{meal.estimatedGrams}G
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Description */}
          {meal.aiDescription && (
            <ExpandableDescription text={meal.aiDescription} mealId={meal.id} mealPlayerName={meal.playerName} />
          )}

          {/* Timestamp + delete */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: 'var(--amiga-dark-grey)',
              textTransform: 'uppercase',
            }}>
              {timeAgo(meal.createdAt)}
            </div>
            <DeleteButton mealId={meal.id} mealPlayerName={meal.playerName} />
          </div>
        </div>
      </div>
    </div>
  )
}
