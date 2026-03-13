import Link from 'next/link'
import { Window } from '@/components/amiga/Window'
import { Button } from '@/components/amiga/Button'
import { UploadZone } from '@/components/upload/UploadZone'

export default function HomePage() {
  return (
    <main className="page-content">
      <Window title="ADD MEAL - SAUSAGE TRACKER">
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
            UPLOAD A PHOTO OF YOUR MEAL. AI WILL COUNT THE SAUSAGES.
            <br />
            EACH SAUSAGE EARNS YOU ONE POINT.
          </div>

          <div
            style={{
              display: 'flex',
              gap: '6px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
            }}
          >
            <span className="amiga-step amiga-step--active">1. UPLOAD</span>
            <span className="amiga-step">2. ANALYZE</span>
            <span className="amiga-step">3. CONFIRM</span>
            <span className="amiga-step">4. SCORE</span>
          </div>

          <UploadZone />

          <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
            <Link href="/highscore"><Button variant="primary">🏆 HIGHSCORE</Button></Link>
            <Link href="/feed"><Button>📋 FEED</Button></Link>
          </div>
        </div>
      </Window>

      {/* Tips window */}
      <Window title="TIPS" showGadgets={false}>
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            lineHeight: '2.2',
            color: 'var(--amiga-dark-grey)',
          }}
        >
          &gt; SAUSAGES COUNTED: BRATWURST, FRANKFURTERS, CHORIZO, HOT DOGS,
          <br />
          &nbsp;&nbsp;CHIPOLATAS, MERGUEZ, WEISSWURST, BANGERS AND MORE
          <br />
          &gt; YOU CAN ADJUST THE AI COUNT BEFORE CONFIRMING
          <br />
          &gt; BEST RESULTS: CLEAR PHOTO, GOOD LIGHTING, SAUSAGES VISIBLE
        </div>
      </Window>

      {/* Rules window */}
      <Window title="RULES" showGadgets={false}>
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            lineHeight: '2.2',
          }}
        >
          <span style={{ color: '#AA0000' }}>&gt; NO RETROSPECTIVE LOGGING.</span>
          <span style={{ color: 'var(--amiga-dark-grey)' }}>
            {' '}SAUSAGES MUST BE LOGGED
            <br />
            &nbsp;&nbsp;THE SAME DAY THEY ARE EATEN. LOGGING MEALS FROM
            <br />
            &nbsp;&nbsp;YESTERDAY, LAST WEEK OR EARLIER IS NOT ALLOWED.
          </span>
          <br />
          <span style={{ color: 'var(--amiga-dark-grey)' }}>
            &gt; PHOTO MUST SHOW THE ACTUAL MEAL YOU ARE EATING RIGHT NOW.
          </span>
        </div>
      </Window>
    </main>
  )
}
