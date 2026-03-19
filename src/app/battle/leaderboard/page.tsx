import { getBattleLeaderboard } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function BattleLeaderboardPage() {
  const leaderboard = await getBattleLeaderboard()

  return (
    <div className="page-content">
      <div className="amiga-window" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="amiga-window__titlebar">
          <span className="amiga-window__gadget">&#9632;</span>
          <span className="amiga-window__title">BATTLE LEADERBOARD</span>
        </div>
        <div className="amiga-window__body">
          {leaderboard.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '32px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '9px',
              color: 'var(--amiga-dark-grey)',
            }}>
              NO BATTLES FOUGHT YET. BE THE FIRST!
            </div>
          ) : (
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'var(--font-pixel)',
              fontSize: '9px',
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--amiga-black)' }}>
                  <th style={{ textAlign: 'left', padding: '6px' }}>RANK</th>
                  <th style={{ textAlign: 'left', padding: '6px' }}>PLAYER</th>
                  <th style={{ textAlign: 'center', padding: '6px' }}>W</th>
                  <th style={{ textAlign: 'center', padding: '6px' }}>L</th>
                  <th style={{ textAlign: 'right', padding: '6px' }}>ELO</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr
                    key={entry.playerName}
                    style={{
                      borderBottom: '1px solid var(--amiga-dark-grey)',
                      background: i === 0 ? 'rgba(255, 136, 0, 0.1)' : 'transparent',
                    }}
                  >
                    <td style={{
                      padding: '6px',
                      color: i < 3 ? 'var(--amiga-orange)' : 'var(--amiga-black)',
                    }}>
                      {i === 0 ? '♛' : i === 1 ? '♔' : i === 2 ? '♕' : `${i + 1}.`}
                    </td>
                    <td style={{ padding: '6px', textTransform: 'uppercase' }}>
                      {entry.playerName}
                    </td>
                    <td style={{ padding: '6px', textAlign: 'center', color: '#44CC44' }}>
                      {entry.wins}
                    </td>
                    <td style={{ padding: '6px', textAlign: 'center', color: '#FF4444' }}>
                      {entry.losses}
                    </td>
                    <td style={{
                      padding: '6px',
                      textAlign: 'right',
                      color: 'var(--crt-amber)',
                      fontWeight: 'bold',
                    }}>
                      {entry.eloRating}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
