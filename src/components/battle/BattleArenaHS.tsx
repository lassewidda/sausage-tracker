'use client'

import { useState } from 'react'
import type { BattleState, PlayerItem, ItemDefinition, HeroCard } from '@/types'
import { BattleCardHS } from './BattleCardHS'
import { BenchStrip } from './BenchStrip'
import { MoveGrid } from './MoveGrid'
import { SlidePanel } from './SlidePanel'
import { CardDetail } from './CardDetail'
import { ItemButton } from './ItemButton'
import { TauntBar } from './TauntBar'
import { TauntBubble } from './TauntBubble'
import { BattleTurnLog } from './BattleTurnLog'
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

export function BattleArenaHS({ state, playerName, onMove, onUseItem, onSwitch, inventory }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [activePanel, setActivePanel] = useState<'items' | 'taunt' | 'log' | null>(null)
  const [showSwitchFromGrid, setShowSwitchFromGrid] = useState(false)
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

  const lastTurn = turns[turns.length - 1]

  // Show KO'd card only during awaiting_switch, not voluntary switches
  const lastKoTurn = [...turns].reverse().find(t => t.isKnockout)
  const myLastKod = !myActive && isAwaitingSwitch && lastKoTurn
    ? myDeck.find(c => c.isKnockedOut && c.cardId === lastKoTurn.defenderCardId) ?? null
    : null
  const theirLastKod = !theirActive && isAwaitingSwitch && lastKoTurn
    ? theirDeck.find(c => c.isKnockedOut && c.cardId === lastKoTurn.defenderCardId) ?? null
    : null
  const isLastAttacker = lastTurn?.attacker === playerName
  const isLastDefender = lastTurn && !isLastAttacker

  const myActiveEffects = myActive ? effects.filter(e => e.targetCardId === myActive.id) : []
  const theirActiveEffects = theirActive ? effects.filter(e => e.targetCardId === theirActive.id) : []

  const usableItems = inventory.filter(i => i.definition)

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

  const getIsOnCooldown = (moveIndex: number): boolean => {
    if (!myActive?.card) return false
    const move = myActive.card.specialMoves[moveIndex]
    const { name } = parseMoveDamage(move)
    return myActive.lastMoveUsed === name
  }

  const isGuardOnCooldown = myActive?.lastMoveUsed === 'GUARD'

  const allMovesEmpty = myActive?.card?.specialMoves.every((_, i) => getRemainingPp(i) <= 0) ?? false

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
    setActivePanel(null)
    setTimeout(() => setSubmitting(false), 500)
  }

  const handleSwitch = (deckCardId: string) => {
    if (submitting) return
    setSubmitting(true)
    setShowSwitchFromGrid(false)
    onSwitch(deckCardId)
    setTimeout(() => setSubmitting(false), 500)
  }

  // Cards available for voluntary switch
  const switchableCards = myDeck.filter(c => !c.isKnockedOut && !c.isActive)
  const canVoluntarySwitch = switchableCards.length > 0

  // Type matchup
  const myMultiplier = myActive?.card && theirActive?.card
    ? getTypeMatchupMultiplier(myActive.card.heroType, theirActive.card.heroType) : 1
  const theirMultiplier = myActive?.card && theirActive?.card
    ? getTypeMatchupMultiplier(theirActive.card.heroType, myActive.card.heroType) : 1

  const getMatchupLabel = (mult: number) => {
    if (mult >= 2.0) return { color: '#44FF44', label: 'SUPER STRONG' }
    if (mult >= 1.5) return { color: '#44CC44', label: 'STRONG' }
    if (mult > 1.0) return { color: '#88DD88', label: 'ADVANTAGE' }
    if (mult < 0.5) return { color: '#FF4444', label: 'VERY WEAK' }
    if (mult < 0.75) return { color: '#FF8844', label: 'WEAK' }
    if (mult < 1.0) return { color: '#CCAA44', label: 'DISADVANTAGE' }
    return { color: '#888', label: 'NEUTRAL' }
  }

  const myMatchup = getMatchupLabel(myMultiplier)
  const theirMatchup = getMatchupLabel(theirMultiplier)

  return (
    <div className="battle-board">
      {/* Turn indicator */}
      <div style={{
        textAlign: 'center',
        fontFamily: 'var(--font-pixel)',
        fontSize: '8px',
        color: (isMyTurn || isMySwitchTurn) ? 'var(--crt-amber)' : '#666',
        padding: '6px',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
      }}>
        {isAwaitingSwitch
          ? (isMySwitchTurn ? 'YOUR CARD WAS KO\'D — CHOOSE NEXT!' : `${battle.switchPlayer?.toUpperCase()} CHOOSING...`)
          : (isMyTurn ? 'YOUR TURN' : `WAITING FOR ${battle.turnPlayer?.toUpperCase()}...`)}
        <span style={{ color: '#555', marginLeft: '8px' }}>T{battle.currentTurn}</span>
      </div>

      {/* Opponent bench */}
      <BenchStrip deckCards={theirDeck} onInspect={setInspectedCard} opponentCard={myActive?.card} />

      <div className="battle-divider" />

      {/* Opponent active card */}
      <div style={{ position: 'relative', padding: '4px 0' }}>
        <TauntBubble taunts={taunts} playerName={playerName} challengerName={battle.challenger} />
        <div onClick={() => theirActive?.card && setInspectedCard(theirActive.card)}
          style={{ cursor: theirActive?.card ? 'pointer' : 'default' }}>
          {theirActive ? (
            <BattleCardHS
              deckCard={theirActive}
              side="top"
              isAttacking={!isLastAttacker && turns.length > 0}
              isHit={isLastAttacker && turns.length > 0}
              effects={theirActiveEffects}
            />
          ) : theirLastKod ? (
            <BattleCardHS
              deckCard={theirLastKod}
              side="top"
              effects={[]}
            />
          ) : (
            <div style={{
              padding: '20px',
              display: 'flex',
              justifyContent: 'center',
              fontFamily: 'var(--font-pixel)',
              fontSize: '9px',
              color: 'var(--crt-amber)',
              animation: 'amiga-blink 1s steps(1) infinite',
            }}>
              SWITCHING...
            </div>
          )}
        </div>
      </div>

      {/* Type matchup bar */}
      {myActive?.card && theirActive?.card && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          fontFamily: 'var(--font-pixel)',
          fontSize: '6px',
          padding: '4px 8px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '4px',
          margin: '2px 0',
        }}>
          <span>
            YOU→THEM: <span style={{ color: myMatchup.color }}>{myMatchup.label} {myMultiplier.toFixed(2)}x</span>
          </span>
          <span style={{ color: '#333' }}>│</span>
          <span>
            THEM→YOU: <span style={{ color: theirMatchup.color }}>{theirMatchup.label} {theirMultiplier.toFixed(2)}x</span>
          </span>
        </div>
      )}

      {/* Last turn display */}
      {lastTurn && !lastTurn.itemUsed && (
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          textAlign: 'center',
          padding: '4px 8px',
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '4px',
          borderLeft: `3px solid ${lastTurn.isGuard ? '#4488FF' : lastTurn.isMiss ? '#FFDD00' : lastTurn.isCritical ? '#FF44FF' : lastTurn.typeMultiplier > 1 ? '#44CC44' : lastTurn.typeMultiplier < 1 ? '#FF8844' : 'var(--amiga-orange)'}`,
        }}>
          <span style={{ color: 'var(--crt-amber)' }}>{lastTurn.attacker}</span>
          {lastTurn.isGuard ? (
            <span style={{ color: '#4488FF' }}> raises their guard!</span>
          ) : lastTurn.isMiss ? (
            <>
              {' used '}
              <span style={{ color: 'var(--amiga-orange)' }}>{lastTurn.moveUsed}</span>
              {' but '}
              <span style={{ color: '#FFDD00' }}>MISSED!</span>
            </>
          ) : (
            <>
              {' used '}
              <span style={{ color: 'var(--amiga-orange)' }}>{lastTurn.moveUsed}</span>
              {'! '}
              <span style={{ color: lastTurn.isCritical ? '#FF44FF' : '#FF4444' }}>{lastTurn.damageDealt} dmg</span>
              {lastTurn.isCritical && (
                <span style={{ color: '#FF44FF' }}> CRIT!</span>
              )}
              {lastTurn.typeMultiplier > 1 && (
                <span style={{ color: '#44CC44' }}> (super effective!)</span>
              )}
              {lastTurn.typeMultiplier < 1 && (
                <span style={{ color: '#888' }}> (not very effective)</span>
              )}
            </>
          )}
          {lastTurn.isKnockout && (
            <span style={{ color: '#FF4444' }}> KO!</span>
          )}
        </div>
      )}
      {lastTurn && lastTurn.itemUsed && (
        <div style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          textAlign: 'center',
          padding: '4px 8px',
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '4px',
          borderLeft: '3px solid #44DDFF',
        }}>
          <span style={{ color: 'var(--crt-amber)' }}>{lastTurn.attacker}</span>
          {' used '}
          <span style={{ color: '#44DDFF' }}>{lastTurn.itemUsed.replace(/_/g, ' ')}</span>
          {'! '}
          <span style={{ color: '#88CCFF' }}>{lastTurn.itemEffect}</span>
        </div>
      )}

      {/* Your active card */}
      <div style={{ padding: '4px 0', cursor: myActive?.card ? 'pointer' : 'default' }}
        onClick={() => myActive?.card && setInspectedCard(myActive.card)}>
        {myActive ? (
          <BattleCardHS
            deckCard={myActive}
            side="bottom"
            isAttacking={isLastAttacker && turns.length > 0}
            isHit={isLastDefender && turns.length > 0}
            effects={myActiveEffects}
          />
        ) : myLastKod ? (
          <BattleCardHS
            deckCard={myLastKod}
            side="bottom"
            effects={[]}
          />
        ) : (
          <div style={{
            padding: '20px',
            display: 'flex',
            justifyContent: 'center',
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            color: 'var(--crt-amber)',
            animation: 'amiga-blink 1s steps(1) infinite',
          }}>
            SWITCHING...
          </div>
        )}
      </div>

      <div className="battle-divider" />

      {/* Your bench */}
      <BenchStrip
        deckCards={myDeck}
        onSwitch={isMySwitchTurn || showSwitchFromGrid ? handleSwitch : undefined}
        onInspect={!(isMySwitchTurn || showSwitchFromGrid) ? setInspectedCard : undefined}
        isSelecting={isMySwitchTurn || showSwitchFromGrid}
        opponentCard={theirActive?.card}
      />

      {/* Post-KO switch prompt */}
      {isMySwitchTurn && (
        <div style={{
          textAlign: 'center',
          fontFamily: 'var(--font-pixel)',
          fontSize: '8px',
          color: 'var(--amiga-orange)',
          padding: '6px',
          background: 'rgba(255, 136, 0, 0.1)',
          border: '1px solid var(--amiga-orange)',
          borderRadius: '4px',
          margin: '4px 0',
        }}>
          TAP A BENCH CARD TO SEND IT OUT
        </div>
      )}

      {/* Voluntary switch overlay */}
      {showSwitchFromGrid && !isMySwitchTurn && (
        <div style={{
          textAlign: 'center',
          fontFamily: 'var(--font-pixel)',
          fontSize: '7px',
          color: 'var(--amiga-orange)',
          padding: '4px',
        }}>
          TAP A BENCH CARD TO SWITCH
          <button
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '6px',
              color: '#888',
              background: 'none',
              border: 'none',
              marginLeft: '8px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
            onClick={() => setShowSwitchFromGrid(false)}
          >
            CANCEL
          </button>
        </div>
      )}

      {/* Move grid */}
      {isMyTurn && !isAwaitingSwitch && myActive?.card && (
        <MoveGrid
          moves={myActive.card.specialMoves}
          disabled={submitting || !isMyTurn}
          getRemainingPp={getRemainingPp}
          getIsOnCooldown={getIsOnCooldown}
          isGuardOnCooldown={isGuardOnCooldown}
          onMove={handleMove}
          onSwitchClick={() => setShowSwitchFromGrid(true)}
          allMovesEmpty={allMovesEmpty}
          showSwitch={canVoluntarySwitch && !showSwitchFromGrid}
        />
      )}

      {/* Bottom toolbar */}
      <div className="bottom-toolbar">
        <button
          className={`bottom-toolbar__btn${activePanel === 'items' ? ' bottom-toolbar__btn--active' : ''}`}
          onClick={() => setActivePanel(activePanel === 'items' ? null : 'items')}
        >
          ITEMS ({usableItems.length})
        </button>
        <button
          className={`bottom-toolbar__btn${activePanel === 'taunt' ? ' bottom-toolbar__btn--active' : ''}`}
          onClick={() => setActivePanel(activePanel === 'taunt' ? null : 'taunt')}
        >
          TAUNT
        </button>
        <button
          className={`bottom-toolbar__btn${activePanel === 'log' ? ' bottom-toolbar__btn--active' : ''}`}
          onClick={() => setActivePanel(activePanel === 'log' ? null : 'log')}
        >
          LOG ({turns.length})
        </button>
      </div>

      {/* Slide-up panels */}
      <SlidePanel isOpen={activePanel === 'items'} onClose={() => setActivePanel(null)} title="ITEMS">
        {usableItems.length === 0 ? (
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: '#666', textAlign: 'center', padding: '16px' }}>
            {theme.strings.noItemsLog}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {usableItems.map(item => (
              <ItemButton
                key={item.id}
                itemId={item.id}
                definition={item.definition!}
                disabled={submitting || !isMyTurn}
                onUse={handleUseItem}
                usedAt={item.usedAt}
              />
            ))}
          </div>
        )}
      </SlidePanel>

      <SlidePanel isOpen={activePanel === 'taunt'} onClose={() => setActivePanel(null)} title="TAUNT">
        <TauntBar battleId={battle.id} playerName={playerName} />
      </SlidePanel>

      <SlidePanel isOpen={activePanel === 'log'} onClose={() => setActivePanel(null)} title="BATTLE LOG">
        <BattleTurnLog turns={turns} />
      </SlidePanel>

      {/* Critical hit overlay */}
      <CriticalHitOverlay turns={turns} />

      {/* Card detail modal */}
      {inspectedCard && (
        <CardDetail card={inspectedCard} onClose={() => setInspectedCard(null)} />
      )}
    </div>
  )
}
