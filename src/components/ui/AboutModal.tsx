'use client'

import { useState } from 'react'
import theme from '@/theme'

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
        title={theme.strings.aboutTagline}
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
              maxWidth: '500px',
              width: 'calc(100% - 32px)',
              overflow: 'hidden',
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
              overflowX: 'hidden',
              maxHeight: '85vh',
              minHeight: '300px',
            }}>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '10px',
                color: 'var(--amiga-orange)',
                marginBottom: '10px',
                textAlign: 'center',
              }}>
                {theme.strings.aboutVersion}
              </div>

              {theme.strings.aboutParagraphs.map((paragraph, i) => (
                <p key={i} style={{
                  margin: i < theme.strings.aboutParagraphs.length - 1 ? '0 0 10px 0' : 0,
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: i < theme.strings.aboutParagraphs.length - 1 ? '12px' : '11px',
                  lineHeight: '1.8',
                  color: i < theme.strings.aboutParagraphs.length - 1 ? 'var(--amiga-white)' : '#888',
                  fontStyle: i === theme.strings.aboutParagraphs.length - 1 ? 'italic' : 'normal',
                  textTransform: 'uppercase' as const,
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}>
                  {paragraph}
                </p>
              ))}

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
