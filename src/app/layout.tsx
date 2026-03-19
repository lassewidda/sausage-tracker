import type { Metadata } from 'next'
import Link from 'next/link'
import { JerryMode } from '@/components/ui/JerryMode'
import { NameSetter } from '@/components/ui/NameSetter'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sausage Tracker v1.0',
  description: 'Track your sausage consumption with AI-powered meal analysis',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="amiga-screen">
          <nav className="amiga-menubar">
            <span className="amiga-menubar__title">SAUSAGE TRACKER v1.0</span>
            <div className="amiga-menubar__spacer" />
            <Link href="/" className="amiga-menubar__item">LOG</Link>
            <Link href="/feed" className="amiga-menubar__item">FEED</Link>
            <Link href="/highscore" className="amiga-menubar__item">HIGHSCORE</Link>
            <Link href="/battle" className="amiga-menubar__item">BATTLE</Link>
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
