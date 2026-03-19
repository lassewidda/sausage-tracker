import type { HeroCard, BattleDeckCard } from '@/types'

// Type advantage matrix
const TYPE_CHART: Record<string, Record<string, number>> = {
  FIRE:     { GRASS: 1.5, ICE: 1.5, STEEL: 1.5, WATER: 0.75, FIRE: 0.75 },
  WATER:    { FIRE: 1.5, GRILLED: 1.5, SMOKED: 1.5, GRASS: 0.75, WATER: 0.75 },
  GRASS:    { WATER: 1.5, POISON: 0.75, FIRE: 0.75, ICE: 0.75 },
  ELECTRIC: { WATER: 1.5, STEEL: 1.5, GRASS: 0.75, ELECTRIC: 0.75 },
  ICE:      { GRASS: 1.5, DARK: 1.5, FIRE: 0.75, STEEL: 0.75, ICE: 0.75 },
  DARK:     { NORMAL: 1.5, POISON: 1.5, DARK: 0.75, STEEL: 0.75 },
  STEEL:    { ICE: 1.5, NORMAL: 1.5, FIRE: 0.75, WATER: 0.75 },
  POISON:   { GRASS: 1.5, MEAT: 1.5, STEEL: 0.75, POISON: 0.75 },
  NORMAL:   { STEEL: 0.75, DARK: 0.75 },
  SMOKED:   { MEAT: 1.5, GRASS: 1.5, WATER: 0.75 },
  GRILLED:  { MEAT: 1.5, ICE: 1.5, WATER: 0.75 },
  MEAT:     {}, // MEAT gives 1.1x bonus always (handled separately)
}

export function parseMoveDamage(move: string): { name: string; baseDamage: number } {
  const match = move.match(/^(.+?)\s*\((\d+)\)\s*$/)
  if (match) {
    return { name: match[1].trim(), baseDamage: parseInt(match[2]) }
  }
  return { name: move, baseDamage: 20 }
}

function getTypes(heroType: string): string[] {
  return heroType.split('/').map(t => t.trim().toUpperCase())
}

function getTypeMultiplier(attackerTypes: string[], defenderTypes: string[]): number {
  let multiplier = 1.0

  for (const atkType of attackerTypes) {
    // MEAT bonus: always 1.1x
    if (atkType === 'MEAT') {
      multiplier *= 1.1
      continue
    }
    const chart = TYPE_CHART[atkType]
    if (!chart) continue
    for (const defType of defenderTypes) {
      if (defType === 'MEAT') continue // MEAT as defender doesn't modify incoming
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
}

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

  const raw = (attacker.attack * baseDamage / 100) * multiplier * (100 / (100 + defender.defense))
  const damage = Math.max(1, Math.floor(raw))

  return { damage, multiplier, moveName: name, baseDamage }
}

export function determineTurnOrder(
  card1: { playerName: string; speed: number },
  card2: { playerName: string; speed: number }
): string {
  if (card1.speed !== card2.speed) {
    return card1.speed > card2.speed ? card1.playerName : card2.playerName
  }
  // Tie-break: alphabetical
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
      heroType: 'NORMAL/WATER',
      hp: 30, attack: 5, defense: 5, speed: 3,
      specialMoves: ['Lukewarm Splash (10)', 'Sad Sizzle (15)', 'Ketchup Drizzle (12)'],
      weakness: 'Any form of seasoning',
      catchphrase: 'I was frozen five minutes ago...',
      flavorText: 'Found behind the office microwave. Still slightly cold in the middle.',
      weekKey: 'STARTER-1',
    },
    {
      heroTitle: 'The Uncooked Rookie',
      heroType: 'NORMAL/MEAT',
      hp: 25, attack: 3, defense: 8, speed: 2,
      specialMoves: ['Raw Slap (8)', 'Refrigerator Chill (12)', 'Expiry Date Panic (15)'],
      weakness: 'Room temperature',
      catchphrase: 'Please... just cook me...',
      flavorText: 'Straight out of the package with the little absorbent pad still attached.',
      weekKey: 'STARTER-2',
    },
    {
      heroTitle: 'Leftover Link',
      heroType: 'NORMAL/DARK',
      hp: 35, attack: 4, defense: 4, speed: 6,
      specialMoves: ['Day-Old Toss (10)', 'Suspicious Smell (14)', 'Microwave Spin (11)'],
      weakness: 'Being sniffed before eating',
      catchphrase: 'I was great yesterday, I swear!',
      flavorText: 'Three days in the back of the fridge. Character building.',
      weekKey: 'STARTER-3',
    },
    {
      heroTitle: 'Bargain Bin Banger',
      heroType: 'NORMAL/STEEL',
      hp: 20, attack: 6, defense: 3, speed: 4,
      specialMoves: ['Discount Slam (12)', 'Shrink-Wrap Shield (8)', 'Best Before Blitz (14)'],
      weakness: 'Quality control',
      catchphrase: '50% off and worth every penny!',
      flavorText: 'The yellow sticker special. Questionable origin, unbeatable price.',
      weekKey: 'STARTER-4',
    },
    {
      heroTitle: 'Mystery Meat Cylinder',
      heroType: 'NORMAL/POISON',
      hp: 40, attack: 2, defense: 6, speed: 1,
      specialMoves: ['Ambiguous Ooze (10)', 'Label Confusion (13)', 'Preservative Burst (11)'],
      weakness: 'Ingredient lists',
      catchphrase: 'You don\'t want to know what\'s inside...',
      flavorText: 'Contents: meat (probably). May contain traces of everything.',
      weekKey: 'STARTER-5',
    },
  ]
}
