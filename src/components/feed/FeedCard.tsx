import Image from 'next/image'
import Link from 'next/link'
import type { Meal } from '@/types'
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
            <div className="amiga-info" style={{ flex: 1 }}>
              {meal.aiDescription.length > 120
                ? meal.aiDescription.slice(0, 117) + '...'
                : meal.aiDescription}
            </div>
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
