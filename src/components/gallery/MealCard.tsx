import Image from 'next/image'
import type { Meal } from '@/types'
import theme from '@/theme'

const IS_EXERCISE = process.env.NEXT_PUBLIC_THEME === 'exercise'

const EXERCISE_TYPE_BADGES: Record<string, { emoji: string; label: string; color: string }> = {
  cardio: { emoji: '\u{1F3C3}', label: 'CARDIO', color: '#FF4444' },
  strength: { emoji: '\u{1F4AA}', label: 'STRENGTH', color: '#4488FF' },
  mobility: { emoji: '\u{1F9D8}', label: 'MOBILITY', color: '#44CC44' },
}

interface MealCardProps {
  meal: Meal
}

export function MealCard({ meal }: MealCardProps) {
  const date = new Date(meal.createdAt)
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="meal-card">
      <div className="meal-card__image-wrap">
        <Image
          src={meal.imageUrl}
          alt={meal.aiDescription ?? theme.strings.photoAltText}
          fill
          style={{ objectFit: 'cover' }}
          unoptimized
          sizes="(max-width: 600px) 100vw, 200px"
        />
        <div className="meal-card__score">
          {IS_EXERCISE && meal.exerciseType ? (() => {
            const badge = EXERCISE_TYPE_BADGES[meal.exerciseType] ?? EXERCISE_TYPE_BADGES.cardio
            return (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'var(--amiga-black)',
                padding: '2px 6px',
                border: `2px solid ${badge.color}`,
              }}>
                <span style={{ fontSize: '12px' }}>{badge.emoji}</span>
                <span style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color: badge.color,
                }}>
                  {badge.label}
                </span>
              </div>
            )
          })() : (
            <div className="amiga-gauge amiga-gauge--small">
              {String(meal.itemCount).padStart(2, '0')}
            </div>
          )}
        </div>
      </div>
      <div className="meal-card__body">
        {meal.aiDescription && (
          <p className="meal-card__desc">
            {meal.aiDescription.length > 80
              ? meal.aiDescription.slice(0, 77) + '...'
              : meal.aiDescription}
          </p>
        )}
        {meal.playerName && meal.playerName !== 'Anonymous' && (
          <div className="amiga-badge amiga-badge--orange" style={{ fontSize: '8px', padding: '2px 6px' }}>
            {meal.playerName.toUpperCase()}
          </div>
        )}
        <div className="row row--between">
          <span className="meal-card__date">{dateStr.toUpperCase()}</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                color: 'var(--crt-amber)',
                background: 'var(--amiga-black)',
                padding: '2px 4px',
              }}
            >
              +{meal.itemCount}PTS
            </span>
            {!IS_EXERCISE && meal.estimatedGrams != null && meal.estimatedGrams > 0 && (
              <span
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '8px',
                  color: 'var(--amiga-white)',
                  background: 'var(--amiga-dark-grey)',
                  padding: '2px 4px',
                }}
              >
                ~{meal.estimatedGrams}G
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
