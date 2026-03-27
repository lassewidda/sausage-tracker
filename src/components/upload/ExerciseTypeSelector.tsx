'use client'

interface ExerciseTypeSelectorProps {
  selected: string
  onChange: (type: string) => void
}

const EXERCISE_TYPES = [
  {
    key: 'cardio',
    emoji: '\u{1F3C3}',
    label: 'CARDIO',
    sub: 'Running, cycling, swimming, walking, hiking',
    color: '#FF4444',
    bg: '#440000',
  },
  {
    key: 'strength',
    emoji: '\u{1F4AA}',
    label: 'STRENGTH',
    sub: 'Weightlifting, bodyweight, resistance training',
    color: '#4488FF',
    bg: '#000044',
  },
]

export function ExerciseTypeSelector({ selected, onChange }: ExerciseTypeSelectorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {EXERCISE_TYPES.map((type) => {
        const isSelected = selected === type.key
        return (
          <button
            key={type.key}
            onClick={() => onChange(type.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: isSelected ? type.bg : 'var(--amiga-black)',
              border: isSelected
                ? `3px solid ${type.color}`
                : '2px solid var(--bevel-shadow)',
              borderTop: isSelected
                ? `3px solid ${type.color}`
                : '2px solid var(--bevel-light)',
              borderLeft: isSelected
                ? `3px solid ${type.color}`
                : '2px solid var(--bevel-light)',
              cursor: 'pointer',
              transition: 'all 0.1s',
              boxShadow: isSelected ? `0 0 12px ${type.color}44` : 'none',
            }}
          >
            <span style={{ fontSize: '28px', lineHeight: 1 }}>{type.emoji}</span>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '11px',
                  color: isSelected ? type.color : 'var(--amiga-white)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {type.label}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color: isSelected ? type.color + 'AA' : 'var(--amiga-dark-grey)',
                  marginTop: '4px',
                  textTransform: 'uppercase',
                }}
              >
                {type.sub}
              </div>
            </div>
            {isSelected && (
              <span
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '14px',
                  color: type.color,
                }}
              >
                &#9654;
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
