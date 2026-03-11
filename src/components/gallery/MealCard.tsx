import Image from 'next/image'
import type { Meal } from '@/types'

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
          alt={meal.aiDescription ?? 'Meal photo'}
          fill
          style={{ objectFit: 'cover' }}
          unoptimized
          sizes="(max-width: 600px) 100vw, 200px"
        />
        <div className="meal-card__score">
          <div className="amiga-gauge amiga-gauge--small">
            {String(meal.sausageCount).padStart(2, '0')}
          </div>
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
          <div className="amiga-badge amiga-badge--orange" style={{ fontSize: '6px', padding: '2px 6px' }}>
            {meal.playerName.toUpperCase()}
          </div>
        )}
        <div className="row row--between">
          <span className="meal-card__date">{dateStr.toUpperCase()}</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '6px',
                color: 'var(--crt-amber)',
                background: 'var(--amiga-black)',
                padding: '2px 4px',
              }}
            >
              +{meal.sausageCount}PTS
            </span>
            {meal.estimatedGrams != null && meal.estimatedGrams > 0 && (
              <span
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '6px',
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
