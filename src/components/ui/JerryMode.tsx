'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'sausage_jerry_mode'

export function JerryMode() {
  const [enabled, setEnabled] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) === 'true'
    setEnabled(stored)
    if (stored) document.documentElement.classList.add('jerry-mode')
    setLoaded(true)
  }, [])

  const toggle = useCallback(() => {
    setEnabled(prev => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      if (next) {
        document.documentElement.classList.add('jerry-mode')
      } else {
        document.documentElement.classList.remove('jerry-mode')
      }
      return next
    })
  }, [])

  if (!loaded) return null

  return (
    <button
      onClick={toggle}
      className="amiga-menubar__item"
      style={{
        background: enabled ? 'var(--amiga-black)' : 'transparent',
        color: enabled ? 'var(--crt-amber)' : 'var(--amiga-black)',
        border: 'none',
        cursor: 'pointer',
        padding: '0 4px',
        fontFamily: 'var(--font-pixel)',
        fontSize: '10px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
      title="Toggle large text mode for better readability"
    >
      {enabled ? '👓 JERRY' : '👓'}
    </button>
  )
}
