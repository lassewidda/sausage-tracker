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
            className="amiga-window"
            style={{
              maxWidth: '500px',
              width: 'calc(100% - 32px)',
              minWidth: 0,
              animation: 'card-enter 0.3s steps(4)',
              overflow: 'hidden',
            }}
          >
            <div className="amiga-window__titlebar">
              <span className="amiga-window__gadget" onClick={() => setOpen(false)} style={{ cursor: 'pointer' }}>&#9632;</span>
              <span className="amiga-window__title">ABOUT SAUSAGE TRACKER V1.1</span>
            </div>
            <div className="amiga-window__body" style={{
              padding: '16px',
              overflowY: 'auto',
              overflowX: 'hidden',
              maxHeight: '70vh',
            }}>
              <p style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                lineHeight: '2.2',
                color: 'var(--amiga-white)',
                margin: 0,
                overflowWrap: 'anywhere',
              }}>
                What started as a single-page photo uploader where Claude Haiku counted sausages in your lunch has, over 56 commits, mutated into a full competitive card battle game. The sausage logging still exists at its core, but each week your eating habits are now fed to an AI that generates a unique hero card — complete with sausage-pun moves like &quot;Mustard Megablast&quot; and types like CHORIZO/GRILLED — with stats directly influenced by how many sausages you actually consumed.
              </p>
              <p style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                lineHeight: '2.2',
                color: 'var(--amiga-white)',
                marginTop: '12px',
                marginBottom: 0,
                overflowWrap: 'anywhere',
              }}>
                A real-time multiplayer battle arena lets players challenge friends, pick decks of 4 cards (including one intentionally terrible starter like &quot;Soggy Microwave Frank&quot;), and duke it out in turn-based combat with type advantages and an ELO rating system. The social layer includes live taunts with speech bubbles, a treasure chest card reveal for weekly drops, and AI-generated dramatic play-by-play recaps of every battle.
              </p>
              <p style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                lineHeight: '2.2',
                color: '#888',
                marginTop: '12px',
                marginBottom: 0,
                fontStyle: 'italic',
                overflowWrap: 'anywhere',
              }}>
                Built with Next.js, Claude Haiku, and an unhealthy obsession with processed meat. Proof that logging your lunch can spiral into a competitive esport.
              </p>
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
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
