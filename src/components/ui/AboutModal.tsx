'use client'

import { useState } from 'react'

export function AboutModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'none',
          border: '1px solid var(--amiga-orange)',
          borderRadius: '50%',
          width: '16px',
          height: '16px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontFamily: 'var(--font-pixel)',
          fontSize: '8px',
          color: 'var(--amiga-orange)',
          padding: 0,
          marginLeft: '6px',
          verticalAlign: 'middle',
          lineHeight: 1,
        }}
        title="About Sausage Tracker"
      >
        i
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '420px',
              width: 'calc(100% - 32px)',
              animation: 'card-enter 0.3s steps(4)',
              background: 'var(--amiga-grey)',
              borderTop: '2px solid var(--bevel-light)',
              borderLeft: '2px solid var(--bevel-light)',
              borderRight: '2px solid var(--bevel-deep)',
              borderBottom: '2px solid var(--bevel-deep)',
            }}
          >
            <div className="amiga-window__titlebar">
              <span className="amiga-window__gadget" onClick={() => setOpen(false)} style={{ cursor: 'pointer' }}>&#9632;</span>
              <span className="amiga-window__title">ABOUT</span>
            </div>
            <div style={{
              padding: '14px',
              overflowY: 'auto',
              maxHeight: '70vh',
              fontSize: '13px',
              lineHeight: '1.6',
              color: 'var(--amiga-white)',
              fontFamily: 'monospace',
            }}>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '10px',
                color: 'var(--amiga-orange)',
                marginBottom: '10px',
                textAlign: 'center',
              }}>
                SAUSAGE TRACKER V1.1
              </div>

              <p style={{ margin: '0 0 10px 0' }}>
                Photo uploader where AI counts your sausages. Each week, your eating
                habits generate a unique hero card with sausage-pun moves and
                stats based on your consumption.
              </p>

              <p style={{ margin: '0 0 10px 0' }}>
                Challenge friends in turn-based card battles with type advantages,
                items, deck building, and ELO rankings. Includes live taunts and
                AI-generated battle recaps.
              </p>

              <p style={{ margin: 0, color: '#888', fontStyle: 'italic', fontSize: '11px' }}>
                Built with Next.js, Claude Haiku, and an unhealthy obsession with
                processed meat.
              </p>

              <div style={{ textAlign: 'center', marginTop: '14px' }}>
                <button
                  className="amiga-btn amiga-btn--primary"
                  onClick={() => setOpen(false)}
                  style={{ fontSize: '8px' }}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
