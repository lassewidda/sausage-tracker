'use client'

import { Button } from '@/components/amiga/Button'
import { Gauge } from '@/components/amiga/Gauge'
import theme from '@/theme'

interface CountStepperProps {
  count: number
  onChange: (count: number) => void
}

export function CountStepper({ count, onChange }: CountStepperProps) {
  const label = theme.strings.itemNamePlural.charAt(0).toUpperCase() + theme.strings.itemNamePlural.slice(1)
  return (
    <div className="row row--center" style={{ gap: '16px' }}>
      <Button
        onClick={() => onChange(Math.max(0, count - 1))}
        disabled={count === 0}
        style={{ fontSize: '16px', padding: '6px 16px' }}
        aria-label={`Decrease ${theme.strings.itemName} count`}
      >
        -
      </Button>
      <Gauge value={count} size="large" label={label} />
      <Button
        onClick={() => onChange(count + 1)}
        style={{ fontSize: '16px', padding: '6px 16px' }}
        aria-label={`Increase ${theme.strings.itemName} count`}
      >
        +
      </Button>
    </div>
  )
}
