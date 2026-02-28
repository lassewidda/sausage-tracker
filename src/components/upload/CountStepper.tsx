'use client'

import { Button } from '@/components/amiga/Button'
import { Gauge } from '@/components/amiga/Gauge'

interface CountStepperProps {
  count: number
  onChange: (count: number) => void
}

export function CountStepper({ count, onChange }: CountStepperProps) {
  return (
    <div className="row row--center" style={{ gap: '16px' }}>
      <Button
        onClick={() => onChange(Math.max(0, count - 1))}
        disabled={count === 0}
        style={{ fontSize: '16px', padding: '6px 16px' }}
        aria-label="Decrease sausage count"
      >
        -
      </Button>
      <Gauge value={count} size="large" label="Sausages" />
      <Button
        onClick={() => onChange(count + 1)}
        style={{ fontSize: '16px', padding: '6px 16px' }}
        aria-label="Increase sausage count"
      >
        +
      </Button>
    </div>
  )
}
