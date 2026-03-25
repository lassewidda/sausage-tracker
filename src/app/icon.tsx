import { ImageResponse } from 'next/og'
import theme from '@/theme'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

function SausageIcon() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32">
      {/* Sausage (diagonal, center) */}
      <rect x="8" y="10" width="16" height="6" rx="3" fill="#C03A18" transform="rotate(-20 16 13)" />
      <rect x="9" y="11" width="14" height="4" rx="2" fill="#D94E2A" transform="rotate(-20 16 13)" />
      {/* Grill marks */}
      <line x1="12" y1="10" x2="12" y2="16" stroke="#8C2508" strokeWidth="0.8" transform="rotate(-20 16 13)" />
      <line x1="16" y1="10" x2="16" y2="16" stroke="#8C2508" strokeWidth="0.8" transform="rotate(-20 16 13)" />
      <line x1="20" y1="10" x2="20" y2="16" stroke="#8C2508" strokeWidth="0.8" transform="rotate(-20 16 13)" />
      {/* Fork (left) */}
      <line x1="6" y1="6" x2="18" y2="24" stroke="#CCCCCC" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="6" y1="6" x2="4" y2="9" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="6" x2="9" y2="7" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="8" x2="5" y2="11" stroke="#CCCCCC" strokeWidth="1.2" strokeLinecap="round" />
      {/* Sword (right) */}
      <line x1="26" y1="6" x2="14" y2="24" stroke="#FFD700" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="23" y="9" width="6" height="1.5" rx="0.5" fill="#FFD700" transform="rotate(56 26 10)" />
      <circle cx="26" cy="5.5" r="1.5" fill="#FFAA00" />
    </svg>
  )
}

function ExerciseIcon() {
  return (
    <svg viewBox="0 0 32 32" width="32" height="32">
      {/* Barbell bar */}
      <rect x="4" y="14.5" width="24" height="3" rx="1" fill="#AAAAAA" />
      {/* Left weight plates */}
      <rect x="3" y="9" width="4" height="14" rx="1" fill="#DD3333" />
      <rect x="1" y="10.5" width="3" height="11" rx="1" fill="#CC2222" />
      {/* Right weight plates */}
      <rect x="25" y="9" width="4" height="14" rx="1" fill="#DD3333" />
      <rect x="28" y="10.5" width="3" height="11" rx="1" fill="#CC2222" />
      {/* Bicep - left arc */}
      <path d="M10 8 Q8 4 12 3 Q16 2 17 6 Q18 9 15 10" fill="#FFAA44" stroke="#DD8822" strokeWidth="0.8" />
      {/* Bicep - right arc */}
      <path d="M22 8 Q24 4 20 3 Q16 2 15 6 Q14 9 17 10" fill="#FFAA44" stroke="#DD8822" strokeWidth="0.8" />
      {/* Flex peak */}
      <ellipse cx="16" cy="4" rx="2.5" ry="2" fill="#FFBB55" />
      {/* Knuckle grip lines */}
      <rect x="13" y="15" width="1" height="2" rx="0.3" fill="#888888" />
      <rect x="15.5" y="15" width="1" height="2" rx="0.3" fill="#888888" />
      <rect x="18" y="15" width="1" height="2" rx="0.3" fill="#888888" />
    </svg>
  )
}

export default function Icon() {
  const isExercise = theme.appName.toLowerCase().includes('gains')

  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#0055AA',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isExercise ? <ExerciseIcon /> : <SausageIcon />}
      </div>
    ),
    { ...size }
  )
}
