'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const MENU_ITEMS = [
  { href: '/feed', label: 'FEED' },
  { href: '/highscore', label: 'HIGHSCORE' },
  { href: '/battle', label: 'BATTLE' },
  { href: '/progress', label: 'PROGRESS' },
  { href: '/shop', label: 'SHOP' },
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

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
          background: 'none',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          padding: '4px 8px',
          lineHeight: 1,
        }}
      >
        {open ? '✕' : '☰'}
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          background: 'var(--amiga-black, #111)',
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
        </div>
      )}
    </div>
  )
}
