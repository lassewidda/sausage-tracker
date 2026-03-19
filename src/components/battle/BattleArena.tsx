'use client'

import { useState } from 'react'
import type { BattleState } from '@/types'
import { BattleCard } from './BattleCard'
import { MoveButton } from './MoveButton'
import { BattleTurnLog } from './BattleTurnLog'
import { parseMoveDamage } from '@/lib/battleEngine'

interface Props {
  state: BattleState
  playerName: string
  onMove: (moveIndex: number) => void
}

export function BattleArena({ state, playerName, onMove }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const { battle, challengerDeck, opponentDeck, turns } = state

  const isChallenger = playerName === battle.challenger
  const myDeck = isChallenger ? challengerDeck : opponentDeck
  const theirDeck = isChallenger ? opponentDeck : challengerDeck
  const isMyTurn = battle.turnPlayer === playerName

  const myActive = myDeck.find(c => c.isActive)
  const theirActive = theirDeck.find(c => c.isActive)

  const lastTurn = turns[turns.length - 1]
  const isLastAttacker = lastTurn?.attacker === playerName
  const isLastDefender = lastTurn && !isLastAttacker

  // Calculate remaining PP for active card's moves
  const getRemainingPp = (moveIndex: number): number => {
    if (!myActive?.card) return 0
    const move = myActive.card.specialMoves[moveIndex]
    if (!move) return 0
    const { name, maxPp } = parseMoveDamage(move)
    const usedCount = turns.filter(
      t => t.attackerCardId === myActive.cardId && t.moveUsed === name
    ).length
    return Math.max(0, maxPp - usedCount)
  }

  const handleMove = async (moveIndex: number) => {
    if (submitting || !isMyTurn) return
    setSubmitting(true)
    onMove(moveIndex)
    setTimeout(() => setSubmitting(false), 500)
  }

  // Check if all moves are out of PP (forced struggle)
  const allMovesEmpty = myActive?.card?.specialMoves.every((_, i) => getRemainingPp(i) <= 0) ?? false

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Turn indicator */}
      <div style={{
        textAlign: 'center',
        fontFamily: 'var(--font-pixel)',
        fontSize: '10px',
        color: isMyTurn ? 'var(--crt-amber)' : 'var(--amiga-grey)',
        padding: '8px',
        background: 'var(--amiga-black)',
        borderTop: '2px solid var(--bevel-shadow)',
        borderLeft: '2px solid var(--bevel-shadow)',
        borderRight: '2px solid var(--bevel-light)',
        borderBottom: '2px solid var(--bevel-light)',
      }}>
        {isMyTurn ? 'YOUR TURN — CHOOSE A MOVE!' : `WAITING FOR ${battle.turnPlayer?.toUpperCase()}...`}
        <span style={{ color: '#666', marginLeft: '12px' }}>TURN {battle.currentTurn}</span>
      </div>

      {/* Arena: two cards facing each other */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        minHeight: '200px',
        position: 'relative',
      }}>
        {/* VS text */}
        <div style={{
          position: 'absolute',
          fontFamily: 'var(--font-pixel)',
          fontSize: '16px',
          color: 'var(--amiga-orange)',
          textShadow: '0 0 10px rgba(255, 136, 0, 0.6)',
          zIndex: 2,
        }}>
          VS
        </div>

        {/* My card (left) */}
        <div style={{ animation: 'card-enter 0.3s steps(4)' }}>
          {myActive ? (
            <BattleCard
              deckCard={myActive}
              side="left"
              isAttacking={isLastAttacker && turns.length > 0}
              isHit={isLastDefender && turns.length > 0}
            />
          ) : (
            <div style={{ color: '#666', fontFamily: 'var(--font-pixel)', fontSize: '8px' }}>
              NO CARDS LEFT
            </div>
          )}
        </div>

        {/* Their card (right) */}
        <div style={{ animation: 'card-enter 0.3s steps(4)' }}>
          {theirActive ? (
            <BattleCard
              deckCard={theirActive}
              side="right"
              isAttacking={!isLastAttacker && turns.length > 0}
              isHit={isLastAttacker && turns.length > 0}
            />
          ) : (
            <div style={{ color: '#666', fontFamily: 'var(--font-pixel)', fontSize: '8px' }}>
              NO CARDS LEFT
            </div>
          )}
        </div>
      </div>

      {/* Deck status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-pixel)',
        fontSize: '7px',
        color: '#888',
      }}>
        <span>YOUR TEAM: {myDeck.filter(c => !c.isKnockedOut).length}/{myDeck.length} alive</span>
        <span>ENEMY TEAM: {theirDeck.filter(c => !c.isKnockedOut).length}/{theirDeck.length} alive</span>
      </div>

      {/* Move buttons */}
      {isMyTurn && myActive?.card && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '8px',
            color: 'var(--amiga-orange)',
          }}>
            {allMovesEmpty ? 'ALL MOVES EXHAUSTED — STRUGGLE!' : 'CHOOSE YOUR ATTACK:'}
          </div>
          {allMovesEmpty ? (
            <button
              className="amiga-btn"
              disabled={submitting}
              onClick={() => handleMove(0)}
              style={{ width: '100%', fontSize: '8px' }}
            >
              <span>STRUGGLE</span>
              <span style={{ color: '#FF4444', marginLeft: '8px' }}>10 dmg (recoil!)</span>
            </button>
          ) : (
            myActive.card.specialMoves.map((move, i) => (
              <MoveButton
                key={i}
                move={move}
                index={i}
                disabled={submitting || !isMyTurn}
                remainingPp={getRemainingPp(i)}
                onUse={handleMove}
              />
            ))
          )}
        </div>
      )}

      {/* Type matchup hint */}
      {isMyTurn && myActive?.card && theirActive?.card && (
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '6px',
          color: '#666',
          textAlign: 'center',
        }}>
          {myActive.card.heroType} vs {theirActive.card.heroType}
        </div>
      )}

      {/* Turn log */}
      <BattleTurnLog turns={turns} />
    </div>
  )
}
