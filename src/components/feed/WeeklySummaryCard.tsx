import Image from 'next/image'
import Link from 'next/link'
import type { WeeklySummary } from '@/types'
import theme from '@/theme'

interface Props {
  summary: WeeklySummary
}

export function WeeklySummaryCard({ summary }: Props) {
  const images = summary.imageUrls ?? []

  return (
    <div className="amiga-window" style={{ width: '100%' }}>
      <div className="amiga-window__titlebar" style={{ background: '#1E6B2A' }}>
        <div className="amiga-window__gadget" />
        <span className="amiga-window__title">
          📊 WEEKLY REPORT — <Link href={`/player/${encodeURIComponent(summary.playerName)}`} style={{ textDecoration: 'none', color: 'inherit' }}>{summary.playerName.toUpperCase()}</Link>
        </span>
        <div className="amiga-window__gadget" />
      </div>

      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Image collage */}
        {images.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '3px',
            background: 'var(--amiga-black)',
            border: '2px solid var(--bevel-shadow)',
            padding: '3px',
            overflowX: 'auto',
          }}>
            {images.slice(0, 6).map((url, i) => (
              <div key={i} style={{
                position: 'relative',
                width: images.length === 1 ? '100%' : '120px',
                height: '120px',
                flexShrink: 0,
                borderRadius: '2px',
                overflow: 'hidden',
              }}>
                <Image
                  src={url}
                  alt={`${theme.strings.photoAltText} ${i + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized
                  sizes="120px"
                />
              </div>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div className="amiga-badge">
            🌭 {summary.totalItems} SAUSAGE{summary.totalItems !== 1 ? 'S' : ''}
          </div>
          {summary.totalGrams > 0 && (
            <div className="amiga-badge" style={{ background: 'var(--amiga-dark-grey)' }}>
              ⚖️ ~{summary.totalGrams}G
            </div>
          )}
          <div className="amiga-badge" style={{ background: 'var(--amiga-dark-grey)' }}>
            📋 {summary.mealCount} MEAL{summary.mealCount !== 1 ? 'S' : ''}
          </div>
          <div className="amiga-badge" style={{
            background: summary.chainLength > 0 ? '#1E6B2A' : '#AA0000',
            color: 'var(--amiga-white)',
            textShadow: 'none',
          }}>
            🔗 {summary.chainLength > 0 ? `${summary.chainLength}W CHAIN` : 'CHAIN BROKEN'}
          </div>
        </div>

        {/* Summary text — readable font */}
        <div style={{
          background: 'var(--amiga-dark-grey)',
          color: 'var(--amiga-white)',
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: '13px',
          lineHeight: '1.7',
          padding: '10px 12px',
          borderTop: '2px solid var(--bevel-shadow)',
          borderLeft: '2px solid var(--bevel-shadow)',
          borderRight: '2px solid var(--bevel-light)',
          borderBottom: '2px solid var(--bevel-light)',
          fontStyle: 'italic',
        }}>
          {summary.summaryText}
        </div>
      </div>
    </div>
  )
}
