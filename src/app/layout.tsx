import type { Metadata } from 'next'
import Link from 'next/link'
import { JerryMode } from '@/components/ui/JerryMode'
import { NameSetter } from '@/components/ui/NameSetter'
import { AboutModal } from '@/components/ui/AboutModal'
import { ChallengeNavLink } from '@/components/ui/ChallengeNavLink'
import { MobileMenu } from '@/components/ui/MobileMenu'
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
          <nav className="amiga-menubar">
            <span className="amiga-menubar__title">{theme.strings.menubarTitle}<AboutModal /></span>
            <div className="amiga-menubar__spacer" />
            {/* Always visible */}
            <Link href="/" className="amiga-menubar__item">LOG</Link>
            <ChallengeNavLink />
            {/* Desktop only */}
            <Link href="/feed" className="amiga-menubar__item desktop-nav">FEED</Link>
            <Link href="/highscore" className="amiga-menubar__item desktop-nav">HIGHSCORE</Link>
            <Link href="/progress" className="amiga-menubar__item desktop-nav">PROGRESS</Link>
            <Link href="/battle" className="amiga-menubar__item desktop-nav">BATTLE</Link>
            <Link href="/shop" className="amiga-menubar__item desktop-nav">SHOP</Link>
            <span className="desktop-nav"><JerryMode /></span>
            {/* Mobile hamburger */}
            <MobileMenu />
          </nav>
          <div className="amiga-menubar" style={{ borderTop: 'none', justifyContent: 'flex-start', padding: '2px 8px' }}>
            <NameSetter />
          </div>
          {children}
        </div>
      </body>
    </html>
  )
}
