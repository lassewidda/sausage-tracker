'use client'

import { useEffect, useState, useCallback } from 'react'

interface ActivityEvent {
  text: string
  time: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function ActivityTicker() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [index, setIndex] = useState(0)

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/activity')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) setEvents(data)
      }
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchEvents()
    const interval = setInterval(fetchEvents, 30000)
    return () => clearInterval(interval)
  }, [fetchEvents])

  // Rotate through events
  useEffect(() => {
    if (events.length <= 1) return
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % events.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [events.length])

  if (events.length === 0) return null

  const event = events[index % events.length]

  return (
    <div style={{
      flex: 1,
      overflow: 'hidden',
      fontFamily: 'var(--font-pixel)',
      fontSize: '7px',
      color: 'var(--crt-amber, #ffaa00)',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      opacity: 0.8,
      textAlign: 'right',
      transition: 'opacity 0.3s',
    }}>
      <span key={index} style={{
        animation: 'ticker-fade 4s ease-in-out',
      }}>
        {event.text} · {timeAgo(event.time)}
      </span>
    </div>
  )
}
