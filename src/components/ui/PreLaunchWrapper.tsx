'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { PreLaunchLock } from './CountdownBanner'

const IS_EXERCISE = process.env.NEXT_PUBLIC_THEME === 'exercise'
const LAUNCH_DATE = new Date('2026-04-13T00:00:00')

// Pages that are allowed before launch
const ALLOWED_PATHS = [
  '/invite',
  '/player/',      // Profile pages (prefix match)
  '/challenge/admin', // Admin always works
]

function isAllowed(pathname: string): boolean {
  return ALLOWED_PATHS.some(p => pathname === p || pathname.startsWith(p))
}

export function PreLaunchWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [launched, setLaunched] = useState(true) // default to true to avoid flash

  useEffect(() => {
    setLaunched(Date.now() >= LAUNCH_DATE.getTime())
    const interval = setInterval(() => {
      if (Date.now() >= LAUNCH_DATE.getTime()) {
        setLaunched(true)
        clearInterval(interval)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Sausage theme is never locked
  // After launch or on allowed pages — render normally
  if (!IS_EXERCISE || launched || isAllowed(pathname)) {
    return <>{children}</>
  }

  // Before launch on locked pages — show lock screen
  return <PreLaunchLock />
}
