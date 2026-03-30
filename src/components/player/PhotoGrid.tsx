'use client'

import { useState } from 'react'

const IS_EXERCISE = process.env.NEXT_PUBLIC_THEME === 'exercise'

interface Photo {
  id: string
  imageUrl: string
  description: string | null
  exerciseType: string | null
  createdAt: string
}

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  cardio: { label: '🏃 CARDIO', color: '#FF4444' },
  strength: { label: '💪 STRENGTH', color: '#4488FF' },
  photo: { label: '📸 PHOTO', color: '#CC44CC' },
}

const PER_PAGE = 12

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

interface Props {
  photos: Photo[]
}

export function PhotoGrid({ photos }: Props) {
  const [page, setPage] = useState(0)
  const [lightbox, setLightbox] = useState<Photo | null>(null)

  const totalPages = Math.ceil(photos.length / PER_PAGE)
  const visible = photos.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  if (photos.length === 0) {
    return (
      <div style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '9px',
        color: 'var(--amiga-dark-grey)',
        textAlign: 'center',
        padding: '16px',
      }}>
        NO PHOTOS YET
      </div>
    )
  }

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '16px',
          }}
        >
          {IS_EXERCISE && lightbox.exerciseType && (
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              color: TYPE_BADGES[lightbox.exerciseType]?.color ?? 'var(--crt-amber)',
              marginBottom: '8px',
            }}>
              {TYPE_BADGES[lightbox.exerciseType]?.label ?? lightbox.exerciseType.toUpperCase()}
            </div>
          )}
          {lightbox.description && (
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              color: '#AAA',
              marginBottom: '12px',
              textAlign: 'center',
              maxWidth: '400px',
            }}>
              {lightbox.description}
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox.imageUrl}
            alt={lightbox.description ?? 'Photo'}
            style={{
              maxWidth: '90vw',
              maxHeight: '70vh',
              objectFit: 'contain',
              border: '3px solid var(--crt-amber)',
            }}
          />
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: '#666',
            marginTop: '12px',
          }}>
            {timeAgo(lightbox.createdAt)} · TAP ANYWHERE TO CLOSE
          </div>
        </div>
      )}

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '6px',
        padding: '8px',
      }}>
        {visible.map(photo => {
          const badge = IS_EXERCISE && photo.exerciseType ? TYPE_BADGES[photo.exerciseType] : null
          return (
            <div
              key={photo.id}
              onClick={() => setLightbox(photo)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '2px solid var(--bevel-shadow)',
                background: 'var(--amiga-black)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.imageUrl}
                alt={photo.description ?? 'Photo'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {badge && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'rgba(0,0,0,0.7)',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '6px',
                  color: badge.color,
                  padding: '3px 4px',
                  textAlign: 'center',
                }}>
                  {badge.label}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          padding: '8px',
          fontFamily: 'var(--font-pixel)',
          fontSize: '8px',
        }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              padding: '4px 10px',
              background: page === 0 ? 'transparent' : 'var(--amiga-black)',
              color: page === 0 ? 'var(--amiga-dark-grey)' : 'var(--crt-amber)',
              border: `1px solid ${page === 0 ? 'var(--bevel-shadow)' : 'var(--crt-amber)'}`,
              cursor: page === 0 ? 'default' : 'pointer',
            }}
          >
            &lt; PREV
          </button>
          <span style={{ color: 'var(--amiga-dark-grey)' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '8px',
              padding: '4px 10px',
              background: page >= totalPages - 1 ? 'transparent' : 'var(--amiga-black)',
              color: page >= totalPages - 1 ? 'var(--amiga-dark-grey)' : 'var(--crt-amber)',
              border: `1px solid ${page >= totalPages - 1 ? 'var(--bevel-shadow)' : 'var(--crt-amber)'}`,
              cursor: page >= totalPages - 1 ? 'default' : 'pointer',
            }}
          >
            NEXT &gt;
          </button>
        </div>
      )}
    </>
  )
}
