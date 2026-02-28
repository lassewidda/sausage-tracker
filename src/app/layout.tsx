import type { Metadata } from 'next'
import Link from 'next/link'
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
          {/* Workbench-style menu bar */}
          <nav className="amiga-menubar">
            <span className="amiga-menubar__title">SAUSAGE TRACKER v1.0</span>
            <div className="amiga-menubar__spacer" />
            <Link href="/" className="amiga-menubar__item">
              ADD MEAL
            </Link>
            <Link href="/gallery" className="amiga-menubar__item">
              GALLERY
            </Link>
          </nav>

          {/* Page content */}
          {children}
        </div>
      </body>
    </html>
  )
}
