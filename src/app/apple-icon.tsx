import { ImageResponse } from 'next/og'
import theme from '@/theme'

export const runtime = 'edge'
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

function SausageAppleIcon() {
  return (
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
      <line x1="44" y1="22" x2="52" y2="18" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
      <circle cx="51" cy="11" r="3" fill="#FFAA00" />
    </svg>
  )
}

function ExerciseAppleIcon() {
  return (
    <svg viewBox="0 0 64 64" width="140" height="140">
      {/* Barbell bar */}
      <rect x="8" y="29" width="48" height="6" rx="2" fill="#AAAAAA" />
      <rect x="8" y="30" width="48" height="2" fill="#CCCCCC" opacity="0.4" />

      {/* Left weight plates */}
      <rect x="6" y="18" width="8" height="28" rx="2" fill="#DD3333" />
      <rect x="7" y="19" width="6" height="26" rx="1.5" fill="#EE4444" opacity="0.5" />
      <rect x="2" y="21" width="6" height="22" rx="2" fill="#CC2222" />
      <rect x="3" y="22" width="4" height="20" rx="1.5" fill="#DD3333" opacity="0.5" />

      {/* Right weight plates */}
      <rect x="50" y="18" width="8" height="28" rx="2" fill="#DD3333" />
      <rect x="51" y="19" width="6" height="26" rx="1.5" fill="#EE4444" opacity="0.5" />
      <rect x="56" y="21" width="6" height="22" rx="2" fill="#CC2222" />
      <rect x="57" y="22" width="4" height="20" rx="1.5" fill="#DD3333" opacity="0.5" />

      {/* Bicep - flexing arm above barbell */}
      <path d="M22 16 Q18 6 26 4 Q34 2 36 10 Q37 16 30 18 Z" fill="#FFAA44" stroke="#DD8822" strokeWidth="1.2" />
      <path d="M42 16 Q46 6 38 4 Q30 2 28 10 Q27 16 34 18 Z" fill="#FFAA44" stroke="#DD8822" strokeWidth="1.2" />
      {/* Flex peak */}
      <ellipse cx="32" cy="6" rx="5" ry="4" fill="#FFBB55" />
      <ellipse cx="32" cy="5" rx="3" ry="2" fill="#FFCC66" opacity="0.6" />

      {/* Grip knurling */}
      <rect x="26" y="30" width="1.5" height="3" rx="0.5" fill="#888888" />
      <rect x="29.5" y="30" width="1.5" height="3" rx="0.5" fill="#888888" />
      <rect x="33" y="30" width="1.5" height="3" rx="0.5" fill="#888888" />
      <rect x="36.5" y="30" width="1.5" height="3" rx="0.5" fill="#888888" />
    </svg>
  )
}

export default function AppleIcon() {
  const isExercise = theme.appName.toLowerCase().includes('gains')

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
        }}
      >
        {isExercise ? <ExerciseAppleIcon /> : <SausageAppleIcon />}
      </div>
    ),
    { ...size }
  )
}
