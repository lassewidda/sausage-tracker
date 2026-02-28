import type { WeekGroup as IWeekGroup } from '@/types'
import { MealCard } from './MealCard'
import { Gauge } from '@/components/amiga/Gauge'

interface WeekGroupProps {
  group: IWeekGroup
}

export function WeekGroup({ group }: WeekGroupProps) {
  return (
    <div className="week-group">
      <div className="week-group__header">
        <span>{group.weekLabel.toUpperCase()}</span>
        <div className="row" style={{ gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '7px' }}>TOTAL:</span>
          <Gauge value={group.totalSausages} size="small" />
          <span style={{ fontSize: '7px' }}>
            SAUSAGE{group.totalSausages !== 1 ? 'S' : ''}
          </span>
        </div>
      </div>
      <div className="week-group__meals">
        {group.meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} />
        ))}
      </div>
    </div>
  )
}
