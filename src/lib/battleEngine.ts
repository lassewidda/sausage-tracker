import type { HeroCard, BattleDeckCard } from '@/types'

// Sausage-themed type advantage matrix
// Super effective = 1.5x, not very effective = 0.66x
const TYPE_CHART: Record<string, Record<string, number>> = {
  BRATWURST:    { FRANKFURTER: 1.5, VEGGIE: 1.5, WEISSWURST: 0.66 },
  FRANKFURTER:  { WEISSWURST: 1.5, VEGGIE: 1.5, MUSTARD: 0.66, CHORIZO: 0.66 },
  CHORIZO:      { FRANKFURTER: 1.5, WEISSWURST: 1.5, KIELBASA: 1.5, SAUERKRAUT: 0.66 },
  KIELBASA:     { BRATWURST: 1.5, ANDOUILLE: 1.5, CHORIZO: 0.66, CURRYWURST: 0.66 },
  ANDOUILLE:    { FRANKFURTER: 1.5, CURRYWURST: 1.5, KIELBASA: 0.66, BLOOD_SAUSAGE: 0.66 },
  WEISSWURST:   { KIELBASA: 1.5, BLOOD_SAUSAGE: 1.5, CHORIZO: 0.66, GRILLED: 0.66 },
  CURRYWURST:   { KIELBASA: 1.5, BRATWURST: 1.5, ANDOUILLE: 0.66, SAUERKRAUT: 0.66 },
  BLOOD_SAUSAGE:{ VEGGIE: 1.5, ANDOUILLE: 1.5, WEISSWURST: 0.66, MUSTARD: 0.66 },
  VEGGIE:       { SAUERKRAUT: 1.5, MUSTARD: 1.5, BRATWURST: 0.66, BLOOD_SAUSAGE: 0.66, CHORIZO: 0.66 },
  MUSTARD:      { FRANKFURTER: 1.5, BLOOD_SAUSAGE: 1.5, SAUERKRAUT: 0.66, VEGGIE: 0.66 },
  SAUERKRAUT:   { MUSTARD: 1.5, CHORIZO: 1.5, CURRYWURST: 1.5, VEGGIE: 0.66, BRATWURST: 0.66 },
  GRILLED:      { WEISSWURST: 1.5, VEGGIE: 1.5, SAUERKRAUT: 0.66, MUSTARD: 0.66 },
  // Legacy types still work with neutral multiplier
  FIRE: { GRASS: 1.5, ICE: 1.5 },
  WATER: { FIRE: 1.5 },
  MEAT: {},
  NORMAL: {},
  DARK: {},
  STEEL: {},
  POISON: {},
  ELECTRIC: {},
  ICE: {},
  GRASS: {},
  SMOKED: {},
}

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
    const chart = TYPE_CHART[atkType]
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

export interface StarterCard {
  heroTitle: string
  heroType: string
  hp: number
  attack: number
  defense: number
  speed: number
  specialMoves: string[]
  weakness: string
  catchphrase: string
  flavorText: string
  weekKey: string
}

export function getStarterCards(): StarterCard[] {
  return [
    {
      heroTitle: 'Soggy Microwave Frank',
      heroType: 'FRANKFURTER/MUSTARD',
      hp: 45, attack: 15, defense: 10, speed: 8,
      specialMoves: ['Lukewarm Splash (25/10)', 'Sad Sizzle (35/5)', 'Ketchup Drizzle (45/2)'],
      weakness: 'Any form of seasoning',
      catchphrase: 'I was frozen five minutes ago...',
      flavorText: 'Found behind the office microwave. Still slightly cold in the middle.',
      weekKey: 'STARTER-1',
    },
    {
      heroTitle: 'The Uncooked Rookie',
      heroType: 'BRATWURST/VEGGIE',
      hp: 40, attack: 10, defense: 20, speed: 6,
      specialMoves: ['Raw Slap (20/15)', 'Refrigerator Chill (30/6)', 'Expiry Date Panic (40/3)'],
      weakness: 'Room temperature',
      catchphrase: 'Please... just cook me...',
      flavorText: 'Straight out of the package with the little absorbent pad still attached.',
      weekKey: 'STARTER-2',
    },
    {
      heroTitle: 'Leftover Link',
      heroType: 'KIELBASA/BLOOD_SAUSAGE',
      hp: 50, attack: 12, defense: 12, speed: 15,
      specialMoves: ['Day-Old Toss (20/12)', 'Suspicious Smell (30/6)', 'Microwave Spin (40/3)'],
      weakness: 'Being sniffed before eating',
      catchphrase: 'I was great yesterday, I swear!',
      flavorText: 'Three days in the back of the fridge. Character building.',
      weekKey: 'STARTER-3',
    },
    {
      heroTitle: 'Bargain Bin Banger',
      heroType: 'ANDOUILLE/SAUERKRAUT',
      hp: 35, attack: 18, defense: 8, speed: 12,
      specialMoves: ['Discount Slam (30/8)', 'Shrink-Wrap Shield (20/12)', 'Best Before Blitz (45/2)'],
      weakness: 'Quality control',
      catchphrase: '50% off and worth every penny!',
      flavorText: 'The yellow sticker special. Questionable origin, unbeatable price.',
      weekKey: 'STARTER-4',
    },
    {
      heroTitle: 'Mystery Meat Cylinder',
      heroType: 'CURRYWURST/CHORIZO',
      hp: 55, attack: 8, defense: 15, speed: 5,
      specialMoves: ['Ambiguous Ooze (20/15)', 'Label Confusion (35/5)', 'Preservative Burst (45/2)'],
      weakness: 'Ingredient lists',
      catchphrase: 'You don\'t want to know what\'s inside...',
      flavorText: 'Contents: meat (probably). May contain traces of everything.',
      weekKey: 'STARTER-5',
    },
  ]
}
