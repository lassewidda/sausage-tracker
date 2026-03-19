'use client'

import Link from 'next/link'

interface Props {
  winner: string | null
  playerName: string
}

export function BattleResult({ winner, playerName }: Props) {
  const isWinner = winner === playerName
  const isDraw = winner === 'draw'

  return (
    <div style={{
      textAlign: 'center',
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
    }}>
      <div style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '24px',
        color: isDraw ? 'var(--amiga-orange)' : isWinner ? '#44CC44' : '#FF4444',
        textTransform: 'uppercase',
        textShadow: isDraw
          ? '0 0 20px rgba(255, 136, 0, 0.6)'
          : isWinner
            ? '0 0 20px rgba(68, 204, 68, 0.6)'
            : '0 0 20px rgba(255, 68, 68, 0.6)',
        animation: isWinner ? 'victory-pulse 1s ease-in-out infinite' : isDraw ? 'none' : 'defeat-fade 2s ease-out forwards',
      }}>
        {isDraw ? 'DRAW!' : isWinner ? 'VICTORY!' : 'DEFEAT!'}
      </div>

      <div style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '10px',
        color: 'var(--amiga-white)',
      }}>
        {isDraw
          ? 'Both sides are exhausted...'
          : isWinner
            ? 'Your sausage warriors reign supreme!'
            : `${winner} has defeated your deck!`}
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <Link href="/battle" className="amiga-btn amiga-btn--primary">
          BACK TO LOBBY
        </Link>
        <Link href="/battle/leaderboard" className="amiga-btn">
          LEADERBOARD
        </Link>
      </div>
    </div>
  )
}
