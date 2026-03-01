import type { Metadata } from 'next'
import Link from 'next/link'
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
            <Link href="/" className="amiga-menubar__item">ADD MEAL</Link>
            <Link href="/feed" className="amiga-menubar__item">FEED</Link>
            <Link href="/highscore" className="amiga-menubar__item">HIGHSCORE</Link>
            <div style={{ width: '1px', background: 'var(--amiga-dark-grey)', margin: '0 4px' }} />
            <NameSetter />
          </nav>
          {children}
        </div>
      </body>
    </html>
  )
}
