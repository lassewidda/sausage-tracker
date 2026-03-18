import type { WeeklySummary } from '@/types'

interface Props {
  summary: WeeklySummary
}

export function WeeklySummaryCard({ summary }: Props) {
  return (
    <div className="amiga-window" style={{ width: '100%' }}>
      <div className="amiga-window__titlebar" style={{ background: '#1E6B2A' }}>
        <div className="amiga-window__gadget" />
        <span className="amiga-window__title">
          📊 WEEKLY REPORT — {summary.playerName.toUpperCase()}
        </span>
        <div className="amiga-window__gadget" />
      </div>

      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div className="amiga-badge">
            🌭 {summary.totalSausages} SAUSAGE{summary.totalSausages !== 1 ? 'S' : ''}
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

        {/* Summary text */}
        <div className="amiga-info" style={{ lineHeight: '2' }}>
          {summary.summaryText}
        </div>
      </div>
    </div>
  )
}
