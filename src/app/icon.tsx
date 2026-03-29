import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

const IS_EXERCISE = process.env.NEXT_PUBLIC_THEME === 'exercise'

function SausageIcon() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32">
      <rect x="8" y="10" width="16" height="6" rx="3" fill="#C03A18" transform="rotate(-20 16 13)" />
      <rect x="9" y="11" width="14" height="4" rx="2" fill="#D94E2A" transform="rotate(-20 16 13)" />
      <line x1="12" y1="10" x2="12" y2="16" stroke="#8C2508" strokeWidth="0.8" transform="rotate(-20 16 13)" />
      <line x1="16" y1="10" x2="16" y2="16" stroke="#8C2508" strokeWidth="0.8" transform="rotate(-20 16 13)" />
      <line x1="20" y1="10" x2="20" y2="16" stroke="#8C2508" strokeWidth="0.8" transform="rotate(-20 16 13)" />
      <line x1="6" y1="6" x2="18" y2="24" stroke="#CCCCCC" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="6" y1="6" x2="4" y2="9" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="6" x2="9" y2="7" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="8" x2="5" y2="11" stroke="#CCCCCC" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="26" y1="6" x2="14" y2="24" stroke="#FFD700" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="23" y="9" width="6" height="1.5" rx="0.5" fill="#FFD700" transform="rotate(56 26 10)" />
      <circle cx="26" cy="5.5" r="1.5" fill="#FFAA00" />
    </svg>
  )
}

function MushroomIcon() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32">
      {/* Mushroom cap - red with white spots (Super Mario style) */}
      <ellipse cx="16" cy="13" rx="13" ry="10" fill="#DD2222" />
      {/* White spots */}
      <circle cx="10" cy="9" r="3" fill="#FFFFFF" />
      <circle cx="20" cy="8" r="2.5" fill="#FFFFFF" />
      <circle cx="15" cy="14" r="2" fill="#FFFFFF" />
      <circle cx="24" cy="13" r="1.8" fill="#FFFFFF" />
      <circle cx="7" cy="14" r="1.5" fill="#FFFFFF" />
      {/* Cap bottom edge */}
      <rect x="5" y="18" width="22" height="2" rx="1" fill="#BB1111" />
      {/* Stem */}
      <rect x="10" y="20" width="12" height="8" rx="2" fill="#F5E6C8" />
      <rect x="11" y="20" width="10" height="7" rx="1.5" fill="#FFF4E0" />
      {/* Eyes */}
      <ellipse cx="12" cy="10" rx="1.8" ry="2.2" fill="#111111" />
      <ellipse cx="19" cy="10" rx="1.8" ry="2.2" fill="#111111" />
      <ellipse cx="12.5" cy="9.5" rx="0.6" ry="0.8" fill="#FFFFFF" />
      <ellipse cx="19.5" cy="9.5" rx="0.6" ry="0.8" fill="#FFFFFF" />
      {/* Smile */}
      <path d="M13 14 Q16 17 19 14" fill="none" stroke="#111111" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: IS_EXERCISE ? '#1A2744' : '#0055AA',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {IS_EXERCISE ? <MushroomIcon /> : <SausageIcon />}
      </div>
    ),
    { ...size }
  )
}
