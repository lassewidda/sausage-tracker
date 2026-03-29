import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

const IS_EXERCISE = process.env.NEXT_PUBLIC_THEME === 'exercise'

function SausageAppleIcon() {
  return (
    <svg viewBox="0 0 64 64" width="140" height="140">
      <ellipse cx="32" cy="28" rx="18" ry="6" fill="#C03A18" transform="rotate(-20 32 28)" />
      <ellipse cx="32" cy="28" rx="16" ry="4.5" fill="#D94E2A" transform="rotate(-20 32 28)" />
      <line x1="24" y1="22" x2="24" y2="34" stroke="#8C2508" strokeWidth="1.2" transform="rotate(-20 32 28)" />
      <line x1="32" y1="22" x2="32" y2="34" stroke="#8C2508" strokeWidth="1.2" transform="rotate(-20 32 28)" />
      <line x1="40" y1="22" x2="40" y2="34" stroke="#8C2508" strokeWidth="1.2" transform="rotate(-20 32 28)" />
      <line x1="14" y1="12" x2="36" y2="48" stroke="#CCCCCC" strokeWidth="3" strokeLinecap="round" />
      <line x1="14" y1="12" x2="10" y2="18" stroke="#CCCCCC" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="14" y1="12" x2="18" y2="16" stroke="#CCCCCC" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="15" y1="16" x2="11" y2="22" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="12" x2="28" y2="48" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
      <line x1="44" y1="22" x2="52" y2="18" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
      <circle cx="51" cy="11" r="3" fill="#FFAA00" />
    </svg>
  )
}

function MushroomAppleIcon() {
  return (
    <svg viewBox="0 0 64 64" width="140" height="140">
      {/* Mushroom cap */}
      <ellipse cx="32" cy="26" rx="26" ry="20" fill="#DD2222" />
      {/* White spots */}
      <circle cx="20" cy="18" r="6" fill="#FFFFFF" />
      <circle cx="40" cy="16" r="5" fill="#FFFFFF" />
      <circle cx="30" cy="28" r="4" fill="#FFFFFF" />
      <circle cx="48" cy="26" r="3.5" fill="#FFFFFF" />
      <circle cx="14" cy="28" r="3" fill="#FFFFFF" />
      <circle cx="38" cy="34" r="2.5" fill="#FFFFFF" />
      {/* Cap bottom edge */}
      <rect x="10" y="36" width="44" height="4" rx="2" fill="#BB1111" />
      {/* Stem */}
      <rect x="20" y="40" width="24" height="16" rx="4" fill="#F5E6C8" />
      <rect x="22" y="40" width="20" height="14" rx="3" fill="#FFF4E0" />
      {/* Eyes */}
      <ellipse cx="24" cy="20" rx="3.5" ry="4.5" fill="#111111" />
      <ellipse cx="38" cy="20" rx="3.5" ry="4.5" fill="#111111" />
      <ellipse cx="25" cy="19" rx="1.2" ry="1.6" fill="#FFFFFF" />
      <ellipse cx="39" cy="19" rx="1.2" ry="1.6" fill="#FFFFFF" />
      {/* Smile */}
      <path d="M26 28 Q32 34 38 28" fill="none" stroke="#111111" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: IS_EXERCISE ? '#1A2744' : '#0055AA',
          borderRadius: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {IS_EXERCISE ? <MushroomAppleIcon /> : <SausageAppleIcon />}
      </div>
    ),
    { ...size }
  )
}
