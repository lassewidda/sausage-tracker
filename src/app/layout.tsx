import type { Metadata } from 'next'
import Link from 'next/link'
import { JerryMode } from '@/components/ui/JerryMode'
import { NameSetter } from '@/components/ui/NameSetter'
import { AboutModal } from '@/components/ui/AboutModal'
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
            <Link href="/" className="amiga-menubar__item">LOG</Link>
            <Link href="/feed" className="amiga-menubar__item">FEED</Link>
            <Link href="/highscore" className="amiga-menubar__item">HIGHSCORE</Link>
            <Link href="/battle" className="amiga-menubar__item">BATTLE</Link>
            <Link href="/challenge" className="amiga-menubar__item">CHALLENGE</Link>
            <Link href="/shop" className="amiga-menubar__item">SHOP</Link>
            <JerryMode />
          </nav>
          <div className="amiga-menubar" style={{ borderTop: 'none', justifyContent: 'flex-end', padding: '2px 8px' }}>
            <NameSetter />
          </div>
          {children}
        </div>
      </body>
    </html>
  )
}
