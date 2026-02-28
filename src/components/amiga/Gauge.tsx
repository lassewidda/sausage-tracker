interface GaugeProps {
  value: number
  size?: 'small' | 'normal' | 'large'
  label?: string
}

export function Gauge({ value, size = 'normal', label }: GaugeProps) {
  const sizeClass =
    size === 'small' ? 'amiga-gauge--small' : size === 'large' ? 'amiga-gauge--large' : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <div className={`amiga-gauge ${sizeClass}`}>{String(value).padStart(2, '0')}</div>
      {label && (
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: 'var(--amiga-dark-grey)',
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}
