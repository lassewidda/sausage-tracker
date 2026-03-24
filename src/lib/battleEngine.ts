import type { HeroCard, BattleDeckCard } from '@/types'
import theme from '@/theme'

export interface ParsedMove {
  name: string
  baseDamage: number
  maxPp: number
}

export function parseMoveDamage(move: string): ParsedMove {
  // Format: "Move Name (damage/pp)" or "Move Name (damage)"
  const match = move.match(/^(.+?)\s*\((\d+)(?:\/(\d+))?\)\s*$/)
  if (match) {
    return {
      name: match[1].trim(),
      baseDamage: parseInt(match[2]),
      maxPp: match[3] ? parseInt(match[3]) : 99,
    }
  }
  return { name: move, baseDamage: 25, maxPp: 99 }
}

function getTypes(heroType: string): string[] {
  return heroType.split('/').map(t => t.trim().toUpperCase())
}

function getTypeMultiplier(attackerTypes: string[], defenderTypes: string[]): number {
  let multiplier = 1.0

  for (const atkType of attackerTypes) {
    const chart = theme.typeChart[atkType]
    if (!chart) continue
    for (const defType of defenderTypes) {
      const mod = chart[defType]
      if (mod) multiplier *= mod
    }
  }

  return multiplier
}

export interface DamageResult {
  damage: number
  multiplier: number
  moveName: string
  baseDamage: number
  isCritical: boolean
}

// 12.5% crit chance, 1.5x crit multiplier
const CRIT_CHANCE = 0.125
const CRIT_MULTIPLIER = 1.5

export function calculateDamage(
  attacker: HeroCard,
  defender: HeroCard,
  moveIndex: number
): DamageResult {
  const move = attacker.specialMoves[moveIndex] ?? attacker.specialMoves[0]
  const { name, baseDamage } = parseMoveDamage(move)
  const attackerTypes = getTypes(attacker.heroType)
  const defenderTypes = getTypes(defender.heroType)
  const multiplier = getTypeMultiplier(attackerTypes, defenderTypes)

  const isCritical = Math.random() < CRIT_CHANCE

  // Rebalanced formula: additive attack+baseDamage, softer defense scaling
  // Target: ~15-30 damage per hit against typical stats, games finish in 10-20 turns
  const raw = ((attacker.attack + baseDamage) / 2.5) * multiplier * (60 / (60 + defender.defense))
  const critRaw = isCritical ? raw * CRIT_MULTIPLIER : raw
  const damage = Math.max(1, Math.floor(critRaw))

  return { damage, multiplier, moveName: name, baseDamage, isCritical }
}

// Exported for UI type matchup preview
export function getTypeMatchupMultiplier(attackerType: string, defenderType: string): number {
  const atkTypes = getTypes(attackerType)
  const defTypes = getTypes(defenderType)
  return getTypeMultiplier(atkTypes, defTypes)
}

export function determineTurnOrder(
  card1: { playerName: string; speed: number },
  card2: { playerName: string; speed: number }
): string {
  if (card1.speed !== card2.speed) {
    return card1.speed > card2.speed ? card1.playerName : card2.playerName
  }
  return card1.playerName < card2.playerName ? card1.playerName : card2.playerName
}

export function checkBattleEnd(
  challengerDeck: BattleDeckCard[],
  opponentDeck: BattleDeckCard[]
): string | null {
  const challengerAlive = challengerDeck.some(c => !c.isKnockedOut)
  const opponentAlive = opponentDeck.some(c => !c.isKnockedOut)

  if (!challengerAlive && !opponentAlive) return 'draw'
  if (!challengerAlive) return opponentDeck[0]?.playerName ?? null
  if (!opponentAlive) return challengerDeck[0]?.playerName ?? null
  return null
}

export function calculateElo(
  winnerElo: number,
  loserElo: number,
  K = 32
): { newWinnerElo: number; newLoserElo: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400))
  const expectedLoser = 1 - expectedWinner

  return {
    newWinnerElo: Math.round(winnerElo + K * (1 - expectedWinner)),
    newLoserElo: Math.round(loserElo + K * (0 - expectedLoser)),
  }
}

