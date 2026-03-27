'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const MENU_ITEMS = [
  { href: '/challenge', label: 'CHALLENGE' },
  { href: '/highscore', label: 'HIGHSCORE' },
  { href: '/progress', label: 'PROGRESS' },
  { href: '/battle', label: 'BATTLE' },
  { href: '/shop', label: 'SHOP' },
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const [boomerMode, setBoomerMode] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    setBoomerMode(localStorage.getItem('sausage_jerry_mode') === 'true')
  }, [])

  const toggleBoomer = useCallback(() => {
    setBoomerMode(prev => {
      const next = !prev
      localStorage.setItem('sausage_jerry_mode', String(next))
      if (next) document.documentElement.classList.add('jerry-mode')
      else document.documentElement.classList.remove('jerry-mode')
      return next
    })
  }, [])

  // Close menu on navigation
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Close menu on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={menuRef} className="mobile-menu-wrapper">
      <button
        onClick={() => setOpen(o => !o)}
        className="mobile-menu-btn"
        aria-label="Menu"
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '12px',
          background: '#0a0a0a',
          border: '1px solid var(--crt-amber, #ffaa00)',
          color: 'var(--crt-amber, #ffaa00)',
          cursor: 'pointer',
          padding: '4px 8px',
          lineHeight: 1,
          borderRadius: '3px',
        }}
      >
        {open ? '✕' : '☰'}
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          background: '#0a0a0a',
          border: '2px solid var(--crt-amber, #ffaa00)',
          zIndex: 1000,
          minWidth: '160px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {MENU_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '9px',
                color: pathname === item.href ? 'var(--crt-amber, #ffaa00)' : 'var(--amiga-white, #ddd)',
                textDecoration: 'none',
                padding: '10px 16px',
                borderBottom: '1px solid #333',
                background: pathname === item.href ? 'rgba(255, 170, 0, 0.1)' : 'transparent',
              }}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={toggleBoomer}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '9px',
              color: boomerMode ? 'var(--crt-amber, #ffaa00)' : 'var(--amiga-white, #ddd)',
              textDecoration: 'none',
              padding: '10px 16px',
              background: boomerMode ? 'rgba(255, 170, 0, 0.1)' : 'transparent',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            👓 {boomerMode ? 'BOOMER ON' : 'BOOMER OFF'}
          </button>
        </div>
      )}
    </div>
  )
}
