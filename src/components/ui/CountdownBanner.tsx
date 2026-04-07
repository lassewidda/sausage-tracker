'use client'

import { useState, useEffect } from 'react'

const IS_EXERCISE = process.env.NEXT_PUBLIC_THEME === 'exercise'
const LAUNCH_DATE = new Date('2026-04-13T00:00:00')

function getTimeLeft() {
  const now = Date.now()
  const diff = LAUNCH_DATE.getTime() - now
  if (diff <= 0) return null

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const secs = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, mins, secs }
}

export function isBeforeLaunch(): boolean {
  return Date.now() < LAUNCH_DATE.getTime()
}

export function CountdownBanner() {
  const [time, setTime] = useState(getTimeLeft)

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!time || !IS_EXERCISE) return null

  return (
    <div style={{
      background: 'linear-gradient(90deg, #DD2222, #FF4444, #DD2222)',
      padding: '12px 16px',
      textAlign: 'center',
      fontFamily: "'Press Start 2P', 'Courier New', monospace",
      overflow: 'hidden',
      maxWidth: '100vw',
    }}>
      <div style={{
        fontSize: 'clamp(10px, 3vw, 16px)',
        color: '#FFFFFF',
        letterSpacing: '2px',
        marginBottom: '8px',
        textShadow: '2px 2px 0 #000',
      }}>
        STARTS APRIL 13TH. GET READY.
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'clamp(8px, 3vw, 20px)',
      }}>
        <TimeUnit value={time.days} label="DAYS" />
        <Separator />
        <TimeUnit value={time.hours} label="HRS" />
        <Separator />
        <TimeUnit value={time.mins} label="MIN" />
        <Separator />
        <TimeUnit value={time.secs} label="SEC" />
      </div>
    </div>
  )
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: 'clamp(18px, 5vw, 32px)',
        color: '#FFD700',
        textShadow: '0 0 10px rgba(255, 215, 0, 0.4), 2px 2px 0 #000',
        fontFamily: "'Press Start 2P', monospace",
        minWidth: 'clamp(36px, 10vw, 60px)',
      }}>
        {String(value).padStart(2, '0')}
      </div>
      <div style={{
        fontSize: 'clamp(5px, 1.5vw, 7px)',
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: '2px',
        fontFamily: "'Press Start 2P', monospace",
      }}>
        {label}
      </div>
    </div>
  )
}

function Separator() {
  return (
    <div style={{
      fontSize: 'clamp(16px, 4vw, 28px)',
      color: '#FFD700',
      fontFamily: "'Press Start 2P', monospace",
      alignSelf: 'flex-start',
      marginTop: '2px',
    }}>
      :
    </div>
  )
}

export function PreLaunchLock() {
  const [time, setTime] = useState(getTimeLeft)

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!time || !IS_EXERCISE) return null

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      minHeight: '300px',
    }}>
      <div style={{
        fontSize: '40px',
        marginBottom: '16px',
      }}>
        🔒
      </div>
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 'clamp(12px, 3vw, 18px)',
        color: 'var(--crt-amber)',
        marginBottom: '12px',
        letterSpacing: '2px',
      }}>
        COMING SOON
      </div>
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 'clamp(8px, 2vw, 11px)',
        color: 'var(--amiga-dark-grey)',
        lineHeight: '2',
        maxWidth: '400px',
      }}>
        THIS SECTION UNLOCKS APRIL 13TH.
        <br />
        SET UP YOUR PROFILE WHILE YOU WAIT!
      </div>
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '24px',
      }}>
        <TimeUnit value={time.days} label="DAYS" />
        <Separator />
        <TimeUnit value={time.hours} label="HRS" />
        <Separator />
        <TimeUnit value={time.mins} label="MIN" />
        <Separator />
        <TimeUnit value={time.secs} label="SEC" />
      </div>
    </div>
  )
}
