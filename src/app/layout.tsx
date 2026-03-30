import type { Metadata } from 'next'
import Link from 'next/link'
import { JerryMode } from '@/components/ui/JerryMode'
import { NameSetter } from '@/components/ui/NameSetter'
import { AboutModal } from '@/components/ui/AboutModal'
import { ChallengeNavLink } from '@/components/ui/ChallengeNavLink'
import { MobileMenu } from '@/components/ui/MobileMenu'
import { ActivityTicker } from '@/components/ui/ActivityTicker'
import { BattleNavLink } from '@/components/ui/BattleNavLink'
import theme from '@/theme'
import './globals.css'

export const metadata: Metadata = {
  title: theme.strings.metaTitle,
  description: theme.strings.metaDescription,
}

const themeVars = {
  '--amiga-bg': theme.colors.bg,
  '--amiga-orange': theme.colors.accent,
  '--amiga-orange-dark': theme.colors.accentDark,
  '--amiga-grey': theme.colors.windowBody,
  '--amiga-dark-grey': theme.colors.textMuted,
  '--amiga-black': theme.colors.textDark,
  '--amiga-white': theme.colors.textLight,
  '--bevel-light': theme.colors.bevelLight,
  '--bevel-mid': theme.colors.bevelMid,
  '--bevel-shadow': theme.colors.bevelShadow,
  '--bevel-deep': theme.colors.bevelDeep,
  '--crt-amber': theme.colors.crtGlow,
  '--crt-amber-dim': theme.colors.crtGlowDim,
} as React.CSSProperties

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={themeVars}>
      <body style={{ backgroundColor: theme.colors.bodyBg }}>
        <div className="amiga-screen">
          <nav className="amiga-menubar" style={{ zIndex: 1001 }}>
            <Link href="/" className="amiga-menubar__title" style={{ textDecoration: 'none', color: 'inherit' }}>{theme.strings.menubarTitle}</Link><AboutModal />
            <div className="amiga-menubar__spacer" />
            {/* Always visible */}
            <Link href="/" className="amiga-menubar__item">LOG</Link>
            <Link href="/feed" className="amiga-menubar__item">FEED</Link>
            {theme.features.challenge && <ChallengeNavLink />}
            <Link href="/highscore" className="amiga-menubar__item desktop-nav">HIGHSCORE</Link>
            {theme.features.progress && <Link href="/progress" className="amiga-menubar__item desktop-nav">PROGRESS</Link>}
            <BattleNavLink />
            <Link href="/shop" className="amiga-menubar__item desktop-nav">SHOP</Link>
            <span className="desktop-nav"><JerryMode /></span>
            {/* Mobile hamburger */}
            <MobileMenu />
          </nav>
          <div className="amiga-menubar" style={{ borderTop: 'none', justifyContent: 'flex-start', padding: '2px 8px', gap: '8px', alignItems: 'center' }}>
            <NameSetter />
            <ActivityTicker />
          </div>
          {children}
        </div>
      </body>
    </html>
  )
}
