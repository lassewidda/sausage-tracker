import Image from 'next/image'
import type { Meal } from '@/types'
import { DeleteButton } from './DeleteButton'

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
        <span className="amiga-window__title">{meal.playerName.toUpperCase()}</span>
        <div className="amiga-window__gadget" />
      </div>

      <div style={{ display: 'flex', gap: '0', minHeight: '140px' }}>
        {/* Image */}
        <div style={{ position: 'relative', width: '180px', flexShrink: 0, background: 'var(--amiga-black)' }}>
          <Image
            src={meal.imageUrl}
            alt={meal.aiDescription ?? 'Meal'}
            fill
            style={{ objectFit: 'cover' }}
            unoptimized
            sizes="180px"
          />
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
            <div className="amiga-gauge amiga-gauge--small">{String(meal.sausageCount).padStart(2, '0')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                textTransform: 'uppercase',
                color: 'var(--amiga-black)',
              }}>
                SAUSAGE{meal.sausageCount !== 1 ? 'S' : ''}
              </span>
              {meal.estimatedGrams != null && meal.estimatedGrams > 0 && (
                <span style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '6px',
                  color: 'var(--amiga-dark-grey)',
                }}>
                  ~{meal.estimatedGrams}G
                </span>
              )}
            </div>
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
              fontSize: '6px',
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
