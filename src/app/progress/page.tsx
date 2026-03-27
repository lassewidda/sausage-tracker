'use client'

import { useCallback, useEffect, useState } from 'react'
import { Window } from '@/components/amiga/Window'
import { useName } from '@/lib/useName'

interface ProgressData {
  configured: boolean
  startDate?: string
  endDate?: string
  playerDays?: Record<string, string[]>
}

type DayStatus = 'exercised' | 'missed' | 'future'

function generateDateRange(start: string, end: string): string[] {
  const dates: string[] = []
  const current = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T00:00:00')
  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  return dates
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
  const year = e.getFullYear()
  return `${fmt(s)} — ${fmt(e)}, ${year}`
}

function getDayStatus(date: string, playerDates: Set<string>, today: string): DayStatus {
  if (date > today) return 'future'
  if (playerDates.has(date)) return 'exercised'
  return 'missed'
}

// Monday = 1, Sunday = 7 (ISO)
function getISODayOfWeek(dateStr: string): number {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDay()
  return day === 0 ? 7 : day
}

function getMonthLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
}

function isCurrentWeek(dateStr: string, today: string): boolean {
  const d = new Date(dateStr + 'T00:00:00')
  const t = new Date(today + 'T00:00:00')
  // Get Monday of date's week
  const dayOfWeek = d.getDay()
  const mondayOfDate = new Date(d)
  mondayOfDate.setDate(d.getDate() - ((dayOfWeek + 6) % 7))
  // Get Monday of today's week
  const todayDow = t.getDay()
  const mondayOfToday = new Date(t)
  mondayOfToday.setDate(t.getDate() - ((todayDow + 6) % 7))
  return mondayOfDate.getTime() === mondayOfToday.getTime()
}

function DaySquare({
  date,
  status,
  isToday,
  currentWeek,
  size,
}: {
  date: string
  status: DayStatus
  isToday: boolean
  currentWeek: boolean
  size: 'personal' | 'grid'
}) {
  const baseSize = size === 'personal' ? (currentWeek ? 14 : 10) : 8
  const style: React.CSSProperties = {
    width: `${baseSize}px`,
    height: `${baseSize}px`,
    flexShrink: 0,
    borderRadius: '1px',
  }

  if (status === 'exercised') {
    style.background = '#00CC00'
    style.border = '1px solid #009900'
  } else if (status === 'missed') {
    style.background = 'var(--amiga-dark-grey)'
    style.border = '1px solid var(--bevel-shadow)'
  } else {
    style.background = 'transparent'
    style.border = '1px dashed var(--bevel-shadow)'
  }

  if (isToday) {
    style.border = '2px solid var(--crt-amber)'
  }

  return <div title={date} style={style} />
}

function Timeline({
  dates,
  playerDates,
  today,
  size,
}: {
  dates: string[]
  playerDates: Set<string>
  today: string
  size: 'personal' | 'grid'
}) {
  const gap = size === 'personal' ? 2 : 1
  const weekGap = size === 'personal' ? 6 : 4

  // Group by weeks (Mon-Sun), add month labels
  const elements: React.ReactNode[] = []
  let lastMonth = ''

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i]
    const month = getMonthLabel(date)
    const dayOfWeek = getISODayOfWeek(date)
    const status = getDayStatus(date, playerDates, today)
    const isToday = date === today
    const currentWeek = isCurrentWeek(date, today)

    // Add month label when month changes (only for personal view)
    if (size === 'personal' && month !== lastMonth) {
      if (i > 0) {
        // Add spacing before month label
        elements.push(
          <div key={`month-break-${date}`} style={{ width: '100%', height: '0px' }} />
        )
      }
      elements.push(
        <div
          key={`month-${date}`}
          style={{
            width: '100%',
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: 'var(--crt-amber)',
            marginBottom: '2px',
            marginTop: i > 0 ? '4px' : '0px',
          }}
        >
          {month}
        </div>
      )
      lastMonth = month
    }

    // Add week gap (before Monday, except the first day)
    if (dayOfWeek === 1 && i > 0 && size === 'personal') {
      // Check if previous date was not the day before (would already be a new month break)
      const prevMonth = i > 0 ? getMonthLabel(dates[i - 1]) : month
      if (prevMonth === month) {
        elements.push(
          <div key={`weekgap-${date}`} style={{ width: `${weekGap}px`, flexShrink: 0 }} />
        )
      }
    }

    elements.push(
      <DaySquare
        key={date}
        date={date}
        status={status}
        isToday={isToday}
        currentWeek={currentWeek}
        size={size}
      />
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: `${gap}px`,
        alignItems: 'center',
      }}
    >
      {elements}
    </div>
  )
}

export default function ProgressPage() {
  const { name, loaded } = useName()
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/progress')
      if (res.ok) {
        setData(await res.json())
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading || !loaded) {
    return (
      <Window title="EXERCISE PROGRESS">
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--crt-amber)', textAlign: 'center', padding: '20px' }}>
          LOADING...
        </div>
      </Window>
    )
  }

  if (!data || !data.configured) {
    return (
      <Window title="EXERCISE PROGRESS">
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--amiga-dark-grey)', textAlign: 'center', padding: '20px' }}>
          PROGRESS TRACKING NOT YET CONFIGURED. ASK AN ADMIN TO SET THE DATE RANGE.
        </div>
      </Window>
    )
  }

  const { startDate, endDate, playerDays } = data as {
    startDate: string
    endDate: string
    playerDays: Record<string, string[]>
  }

  const dates = generateDateRange(startDate, endDate)
  const myDates = new Set(name && playerDays[name] ? playerDays[name] : [])
  const myTotal = myDates.size

  // Sort players by total exercise days descending
  const sortedPlayers = Object.entries(playerDays)
    .map(([playerName, days]) => ({ playerName, days: new Set(days), total: days.length }))
    .sort((a, b) => b.total - a.total || a.playerName.localeCompare(b.playerName))

  const legendStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: 'var(--font-pixel)',
    fontSize: '7px',
    color: 'var(--amiga-dark-grey)',
  }

  return (
    <div className="stack" style={{ gap: '12px' }}>
      <Window title="EXERCISE PROGRESS">
        <div className="stack" style={{ gap: '12px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '9px',
              color: 'var(--crt-amber)',
              marginBottom: '6px',
            }}>
              {formatDateRange(startDate, endDate)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={legendStyle}>
                <div style={{ width: '10px', height: '10px', background: '#00CC00', border: '1px solid #009900' }} />
                EXERCISED
              </div>
              <div style={legendStyle}>
                <div style={{ width: '10px', height: '10px', background: 'var(--amiga-dark-grey)', border: '1px solid var(--bevel-shadow)' }} />
                MISSED
              </div>
              <div style={legendStyle}>
                <div style={{ width: '10px', height: '10px', background: 'transparent', border: '1px dashed var(--bevel-shadow)' }} />
                FUTURE
              </div>
              <div style={legendStyle}>
                <div style={{ width: '10px', height: '10px', background: 'transparent', border: '2px solid var(--crt-amber)' }} />
                TODAY
              </div>
            </div>
          </div>
        </div>
      </Window>

      {/* Personal timeline */}
      {name && (
        <Window title={`YOUR PROGRESS — ${name.toUpperCase()} (${myTotal} DAYS)`}>
          <Timeline dates={dates} playerDates={myDates} today={today} size="personal" />
        </Window>
      )}

      {/* All players grid */}
      {sortedPlayers.length > 0 && (
        <Window title="ALL PLAYERS">
          <div className="stack" style={{ gap: '10px' }}>
            {sortedPlayers.map(({ playerName, days, total }) => (
              <div key={playerName}>
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color: playerName === name ? 'var(--crt-amber)' : 'var(--amiga-dark-grey)',
                  marginBottom: '3px',
                }}>
                  {playerName.toUpperCase()} ({total})
                </div>
                <Timeline dates={dates} playerDates={days} today={today} size="grid" />
              </div>
            ))}
          </div>
        </Window>
      )}
    </div>
  )
}
