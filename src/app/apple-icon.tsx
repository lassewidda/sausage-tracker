import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#0055AA',
          borderRadius: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <svg viewBox="0 0 64 64" width="140" height="140">
          {/* Sausage body - diagonal */}
          <ellipse cx="32" cy="28" rx="18" ry="6" fill="#C03A18" transform="rotate(-20 32 28)" />
          <ellipse cx="32" cy="28" rx="16" ry="4.5" fill="#D94E2A" transform="rotate(-20 32 28)" />
          {/* Grill marks */}
          <line x1="24" y1="22" x2="24" y2="34" stroke="#8C2508" strokeWidth="1.2" transform="rotate(-20 32 28)" />
          <line x1="32" y1="22" x2="32" y2="34" stroke="#8C2508" strokeWidth="1.2" transform="rotate(-20 32 28)" />
          <line x1="40" y1="22" x2="40" y2="34" stroke="#8C2508" strokeWidth="1.2" transform="rotate(-20 32 28)" />
          {/* Fork - left side */}
          <line x1="14" y1="12" x2="36" y2="48" stroke="#CCCCCC" strokeWidth="3" strokeLinecap="round" />
          <line x1="14" y1="12" x2="10" y2="18" stroke="#CCCCCC" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="14" y1="12" x2="18" y2="16" stroke="#CCCCCC" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="15" y1="16" x2="11" y2="22" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" />
          {/* Sword - right side */}
          <line x1="50" y1="12" x2="28" y2="48" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          {/* Sword guard */}
          <line x1="44" y1="22" x2="52" y2="18" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
          {/* Sword pommel */}
          <circle cx="51" cy="11" r="3" fill="#FFAA00" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
