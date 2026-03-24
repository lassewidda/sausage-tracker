import Link from 'next/link'
import { Window } from '@/components/amiga/Window'
import { Button } from '@/components/amiga/Button'
import { UploadZone } from '@/components/upload/UploadZone'
import theme from '@/theme'

export default function HomePage() {
  return (
    <main className="page-content">
      <Window title={theme.strings.windowTitle}>
        <div className="stack">
          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--amiga-dark-grey)',
              lineHeight: '2',
            }}
          >
            {theme.strings.uploadInstruction}
            <br />
            {theme.strings.uploadSubInstruction}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '6px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
            }}
          >
            {theme.strings.steps.map((step, i) => (
              <span key={i} className={`amiga-step${i === 0 ? ' amiga-step--active' : ''}`}>{step}</span>
            ))}
          </div>

          <UploadZone />

          <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
            <Link href="/highscore"><Button variant="primary">🏆 HIGHSCORE</Button></Link>
            <Link href="/feed"><Button>📋 FEED</Button></Link>
          </div>
        </div>
      </Window>

      {/* Tips window */}
      <Window title={theme.strings.tipsTitle} showGadgets={false}>
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            lineHeight: '2.2',
            color: 'var(--amiga-dark-grey)',
          }}
        >
          {theme.strings.tipsLines.map((line, i) => (
            <span key={i}>&gt; {line}{i < theme.strings.tipsLines.length - 1 && <br />}</span>
          ))}
        </div>
      </Window>

      {/* Rules window */}
      <Window title={theme.strings.rulesTitle} showGadgets={false}>
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            lineHeight: '2.2',
          }}
        >
          {theme.strings.rulesLines.map((line, i) => (
            <span key={i} style={{ color: i === 0 ? '#AA0000' : 'var(--amiga-dark-grey)' }}>
              &gt; {line}{i < theme.strings.rulesLines.length - 1 && <br />}
            </span>
          ))}
        </div>
      </Window>
    </main>
  )
}
