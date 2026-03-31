'use client'

import { useState } from 'react'
import type { BattleState, PlayerItem, ItemDefinition, HeroCard } from '@/types'
import { BattleCard } from './BattleCard'
import { CardDetail } from './CardDetail'
import { MoveButton } from './MoveButton'
import { ItemButton } from './ItemButton'
import { BattleTurnLog } from './BattleTurnLog'
import { TauntBar } from './TauntBar'
import { TauntBubble } from './TauntBubble'
import { CriticalHitOverlay } from './CriticalHitOverlay'
import { parseMoveDamage, getTypeMatchupMultiplier } from '@/lib/battleEngine'
import { DeckStatusBar } from './DeckStatusBar'
import theme from '@/theme'

interface InventoryItem extends PlayerItem {
  definition?: ItemDefinition
}

interface Props {
  state: BattleState
  playerName: string
  onMove: (moveIndex: number) => void
  onUseItem: (itemId: string) => void
  onSwitch: (deckCardId: string) => void
  inventory: InventoryItem[]
}

export function BattleArena({ state, playerName, onMove, onUseItem, onSwitch, inventory }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'moves' | 'items' | 'switch'>('moves')
  const [inspectedCard, setInspectedCard] = useState<HeroCard | null>(null)
  const { battle, challengerDeck, opponentDeck, turns, taunts, effects } = state

  const isChallenger = playerName === battle.challenger
  const myDeck = isChallenger ? challengerDeck : opponentDeck
  const theirDeck = isChallenger ? opponentDeck : challengerDeck
  const isMyTurn = battle.turnPlayer === playerName
  const isAwaitingSwitch = battle.status === 'awaiting_switch'
  const isMySwitchTurn = isAwaitingSwitch && battle.switchPlayer === playerName

  const myActive = myDeck.find(c => c.isActive)
  const theirActive = theirDeck.find(c => c.isActive)

  // Find the last KO'd card for each side (to display as "dead" when no active card)
  const myLastKod = !myActive ? [...myDeck].filter(c => c.isKnockedOut).pop() : null
  const theirLastKod = !theirActive ? [...theirDeck].filter(c => c.isKnockedOut).pop() : null

  const lastTurn = turns[turns.length - 1]
  const isLastAttacker = lastTurn?.attacker === playerName
  const isLastDefender = lastTurn && !isLastAttacker

  // Check if a move is on cooldown (was the last move used)
  const getIsOnCooldown = (moveIndex: number): boolean => {
    if (!myActive?.card) return false
    const move = myActive.card.specialMoves[moveIndex]
    const { name } = parseMoveDamage(move)
    return myActive.lastMoveUsed === name
  }

  const isGuardOnCooldown = myActive?.lastMoveUsed === 'GUARD'

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

  const handleUseItem = async (itemId: string) => {
    if (submitting || !isMyTurn) return
    setSubmitting(true)
    onUseItem(itemId)
    setActiveTab('moves')
    setTimeout(() => setSubmitting(false), 500)
  }

  // Get effects for active cards
  const myActiveEffects = myActive ? effects.filter(e => e.targetCardId === myActive.id) : []
  const theirActiveEffects = theirActive ? effects.filter(e => e.targetCardId === theirActive.id) : []

  const usableItems = inventory.filter(i => i.definition)

  // Check if all moves are out of PP (forced struggle)
  const allMovesEmpty = myActive?.card?.specialMoves.every((_, i) => getRemainingPp(i) <= 0) ?? false

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Turn indicator */}
      <div style={{
        textAlign: 'center',
        fontFamily: 'var(--font-pixel)',
        fontSize: '10px',
        color: (isMyTurn || isMySwitchTurn) ? 'var(--crt-amber)' : 'var(--amiga-grey)',
        padding: '8px',
        background: 'var(--amiga-black)',
        borderTop: '2px solid var(--bevel-shadow)',
        borderLeft: '2px solid var(--bevel-shadow)',
        borderRight: '2px solid var(--bevel-light)',
        borderBottom: '2px solid var(--bevel-light)',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
      }}>
        {isAwaitingSwitch
          ? (isMySwitchTurn ? 'YOUR CARD WAS KO\'D — CHOOSE NEXT CARD!' : `${battle.switchPlayer?.toUpperCase()} IS CHOOSING NEXT CARD...`)
          : (isMyTurn ? 'YOUR TURN — CHOOSE A MOVE!' : `WAITING FOR ${battle.turnPlayer?.toUpperCase()}...`)}
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
        {/* Taunt bubbles */}
        <TauntBubble
          taunts={taunts}
          playerName={playerName}
          challengerName={battle.challenger}
        />

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
        <div style={{ animation: 'card-enter 0.3s steps(4)', cursor: myActive?.card ? 'pointer' : 'default' }}
          onClick={() => myActive?.card && setInspectedCard(myActive.card)}>
          {myActive ? (
            <BattleCard
              deckCard={myActive}
              side="left"
              isAttacking={isLastAttacker && turns.length > 0}
              isHit={isLastDefender && turns.length > 0}
            />
          ) : myLastKod ? (
            <BattleCard
              deckCard={myLastKod}
              side="left"
            />
          ) : (
            <DeckStatusBar deck={myDeck} align="left" />
          )}
        </div>

        {/* Their card (right) */}
        <div style={{ animation: 'card-enter 0.3s steps(4)', cursor: theirActive?.card ? 'pointer' : 'default' }}
          onClick={() => theirActive?.card && setInspectedCard(theirActive.card)}>
          {theirActive ? (
            <BattleCard
              deckCard={theirActive}
              side="right"
              isAttacking={!isLastAttacker && turns.length > 0}
              isHit={isLastAttacker && turns.length > 0}
            />
          ) : theirLastKod ? (
            <BattleCard
              deckCard={theirLastKod}
              side="right"
            />
          ) : (
            <DeckStatusBar deck={theirDeck} align="right" />
          )}
        </div>
      </div>

      {/* Deck status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '8px',
      }}>
        <DeckStatusBar deck={myDeck} align="left" opponentCard={theirActive?.card} />
        <DeckStatusBar deck={theirDeck} align="right" opponentCard={myActive?.card} />
      </div>

      {/* Effect badges */}
      {(myActiveEffects.length > 0 || theirActiveEffects.length > 0) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-pixel)',
          fontSize: '6px',
          gap: '8px',
        }}>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {myActiveEffects.map(e => {
              const label = e.effectType.replace('buff_', '+').replace('debuff_', '-').toUpperCase()
              const isDebuff = e.effectType.startsWith('debuff')
              return (
                <span key={e.id} style={{
                  background: isDebuff ? '#442222' : '#224422',
                  color: isDebuff ? '#FF6666' : '#66FF66',
                  padding: '2px 4px',
                  border: `1px solid ${isDebuff ? '#663333' : '#336633'}`,
                }}>
                  {label} {e.effectValue} ({e.remainingTurns}t)
                </span>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {theirActiveEffects.map(e => {
              const label = e.effectType.replace('buff_', '+').replace('debuff_', '-').toUpperCase()
              const isDebuff = e.effectType.startsWith('debuff')
              return (
                <span key={e.id} style={{
                  background: isDebuff ? '#442222' : '#224422',
                  color: isDebuff ? '#FF6666' : '#66FF66',
                  padding: '2px 4px',
                  border: `1px solid ${isDebuff ? '#663333' : '#336633'}`,
                }}>
                  {label} {e.effectValue} ({e.remainingTurns}t)
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Card switch selection */}
      {isMySwitchTurn && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '12px',
          background: 'rgba(255, 136, 0, 0.1)',
          border: '2px solid var(--amiga-orange)',
        }}>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            color: 'var(--amiga-orange)',
            textAlign: 'center',
          }}>
            SEND OUT WHICH CARD?
          </div>
          {myDeck.filter(c => !c.isKnockedOut && !c.isActive).map(c => (
            <button
              key={c.id}
              className="amiga-btn"
              disabled={submitting}
              onClick={() => {
                if (submitting) return
                setSubmitting(true)
                onSwitch(c.id)
                setTimeout(() => setSubmitting(false), 500)
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '8px 10px',
                fontSize: '8px',
                gap: '4px',
                width: '100%',
              }}
            >
              <span style={{ fontFamily: 'var(--font-pixel)' }}>
                {c.card?.heroTitle ?? 'Unknown'}
              </span>
              <span style={{
                fontFamily: 'var(--font-pixel)',
                display: 'flex',
                gap: '6px',
                fontSize: '7px',
                flexWrap: 'wrap',
              }}>
                <span style={{ color: '#888' }}>{c.card?.heroType}</span>
                <span style={{ color: '#44CC44' }}>HP {c.currentHp}/{c.card?.hp}</span>
                <span style={{ color: '#FF8800' }}>ATK {c.card?.attack}</span>
                <span style={{ color: '#4488FF' }}>DEF {c.card?.defense}</span>
                <span style={{ color: '#FFDD00' }}>SPD {c.card?.speed}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Move/Item buttons */}
      {isMyTurn && !isAwaitingSwitch && myActive?.card && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Tab toggle */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className={`amiga-btn${activeTab === 'moves' ? ' amiga-btn--primary' : ''}`}
              onClick={() => setActiveTab('moves')}
              style={{ fontSize: '8px', flex: 1 }}
            >
              MOVES
            </button>
            <button
              className={`amiga-btn${activeTab === 'switch' ? ' amiga-btn--primary' : ''}`}
              onClick={() => setActiveTab('switch')}
              style={{ fontSize: '8px', flex: 1 }}
            >
              SWITCH
            </button>
            <button
              className={`amiga-btn${activeTab === 'items' ? ' amiga-btn--primary' : ''}`}
              onClick={() => setActiveTab('items')}
              style={{ fontSize: '8px', flex: 1 }}
            >
              ITEMS ({usableItems.length})
            </button>
          </div>

          {activeTab === 'moves' && (
            <>
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
                    onCooldown={getIsOnCooldown(i)}
                    onUse={handleMove}
                  />
                ))
              )}
              <button
                onClick={() => handleMove(-1)}
                disabled={submitting || !isMyTurn || isGuardOnCooldown}
                className="amiga-btn"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '9px',
                  opacity: isGuardOnCooldown ? 0.35 : (!isMyTurn || submitting) ? 0.6 : 1,
                  background: 'var(--amiga-dark-grey)',
                  color: 'var(--amiga-white)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>GUARD</span>
                <span style={{ fontSize: '7px', color: '#888' }}>HALVES INCOMING DMG</span>
                {isGuardOnCooldown && <span style={{ color: '#FF4444' }}>ON COOLDOWN</span>}
              </button>
            </>
          )}

          {activeTab === 'switch' && (() => {
            const switchable = myDeck.filter(c => !c.isKnockedOut && !c.isActive)
            return switchable.length === 0 ? (
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                color: '#666',
                textAlign: 'center',
                padding: '12px',
              }}>
                NO OTHER CARDS AVAILABLE
              </div>
            ) : (
              <>
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '8px',
                  color: 'var(--amiga-orange)',
                }}>
                  SWITCH CARD (COSTS YOUR TURN):
                </div>
                {switchable.map(c => {
                  const matchup = theirActive?.card && c.card
                    ? getTypeMatchupMultiplier(c.card.heroType, theirActive.card.heroType)
                    : 1
                  const matchupColor = matchup >= 1.5 ? '#44FF44' : matchup > 1.0 ? '#88CC44' : matchup < 0.75 ? '#FF4444' : matchup < 1.0 ? '#FF8844' : '#888'
                  const matchupLabel = matchup >= 1.5 ? 'STRONG' : matchup > 1.0 ? 'ADVANTAGE' : matchup < 0.75 ? 'WEAK' : matchup < 1.0 ? 'DISADVANTAGE' : 'NEUTRAL'

                  return (
                    <button
                      key={c.id}
                      className="amiga-btn"
                      disabled={submitting}
                      onClick={() => {
                        if (submitting) return
                        setSubmitting(true)
                        onSwitch(c.id)
                        setActiveTab('moves')
                        setTimeout(() => setSubmitting(false), 500)
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        padding: '8px 10px',
                        fontSize: '8px',
                        gap: '4px',
                        width: '100%',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-pixel)', display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                        <span>{c.card?.heroTitle ?? 'Unknown'}</span>
                        <span style={{ marginLeft: 'auto', color: matchupColor, fontSize: '7px' }}>
                          {matchupLabel} ({matchup.toFixed(2)}x)
                        </span>
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-pixel)',
                        display: 'flex',
                        gap: '6px',
                        fontSize: '7px',
                        flexWrap: 'wrap',
                      }}>
                        <span style={{ color: '#888' }}>{c.card?.heroType}</span>
                        <span style={{ color: '#44CC44' }}>HP {c.currentHp}/{c.card?.hp}</span>
                        <span style={{ color: '#FF8800' }}>ATK {c.card?.attack}</span>
                        <span style={{ color: '#4488FF' }}>DEF {c.card?.defense}</span>
                      </span>
                    </button>
                  )
                })}
              </>
            )
          })()}

          {activeTab === 'items' && (
            <>
              {usableItems.length === 0 ? (
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '8px',
                  color: '#666',
                  textAlign: 'center',
                  padding: '12px',
                }}>
                  {theme.strings.noItemsLog}
                </div>
              ) : (
                usableItems.map((item) => (
                  <ItemButton
                    key={item.id}
                    itemId={item.id}
                    definition={item.definition!}
                    disabled={submitting || !isMyTurn}
                    onUse={handleUseItem}
                    usedAt={item.usedAt}
                  />
                ))
              )}
            </>
          )}
        </div>
      )}

      {/* Type matchup indicator */}
      {myActive?.card && theirActive?.card && (() => {
        const myMultiplier = getTypeMatchupMultiplier(myActive.card.heroType, theirActive.card.heroType)
        const theirMultiplier = getTypeMatchupMultiplier(theirActive.card.heroType, myActive.card.heroType)

        const getMatchupStyle = (mult: number) => {
          if (mult >= 2.0) return { color: '#44FF44', label: 'SUPER STRONG', bg: '#0a2a0a', border: '#44FF44' }
          if (mult >= 1.5) return { color: '#44FF44', label: 'STRONG', bg: '#0a2a0a', border: '#44CC44' }
          if (mult > 1.0) return { color: '#88FF88', label: 'ADVANTAGE', bg: '#0a200a', border: '#448844' }
          if (mult < 0.5) return { color: '#FF4444', label: 'VERY WEAK', bg: '#2a0a0a', border: '#FF4444' }
          if (mult < 0.75) return { color: '#FF8844', label: 'WEAK', bg: '#2a150a', border: '#CC6633' }
          if (mult < 1.0) return { color: '#FFCC44', label: 'DISADVANTAGE', bg: '#2a200a', border: '#AA8833' }
          return { color: '#CCCCCC', label: 'NEUTRAL', bg: '#1a1a1a', border: '#555' }
        }

        const myStyle = getMatchupStyle(myMultiplier)
        const theirStyle = getMatchupStyle(theirMultiplier)

        return (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            gap: '8px',
          }}>
            <div style={{
              flex: 1,
              padding: '6px 8px',
              background: myStyle.bg,
              border: `2px solid ${myStyle.border}`,
              borderRadius: '4px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#ccc', marginBottom: '3px', fontSize: '6px' }}>YOUR ATTACK</div>
              <div style={{ color: myStyle.color, fontSize: '8px', textShadow: `0 0 8px ${myStyle.color}66` }}>
                {myStyle.label} ({myMultiplier.toFixed(2)}x)
              </div>
              <div style={{ color: '#999', fontSize: '6px', marginTop: '3px' }}>
                {myActive.card.heroType} → {theirActive.card.heroType}
              </div>
            </div>
            <div style={{
              flex: 1,
              padding: '6px 8px',
              background: theirStyle.bg,
              border: `2px solid ${theirStyle.border}`,
              borderRadius: '4px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#ccc', marginBottom: '3px', fontSize: '6px' }}>THEIR ATTACK</div>
              <div style={{ color: theirStyle.color, fontSize: '8px', textShadow: `0 0 8px ${theirStyle.color}66` }}>
                {theirStyle.label} ({theirMultiplier.toFixed(2)}x)
              </div>
              <div style={{ color: '#999', fontSize: '6px', marginTop: '3px' }}>
                {theirActive.card.heroType} → {myActive.card.heroType}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Taunt bar */}
      <TauntBar battleId={battle.id} playerName={playerName} />

      {/* Turn log */}
      <BattleTurnLog turns={turns} />

      {/* Critical hit overlay */}
      <CriticalHitOverlay turns={turns} />

      {/* Card detail modal */}
      {inspectedCard && (
        <CardDetail card={inspectedCard} onClose={() => setInspectedCard(null)} />
      )}
    </div>
  )
}
