export interface Meal {
  id: string
  imageUrl: string
  blobPath: string
  sausageCount: number
  aiSuggestedCount: number | null
  aiDescription: string | null
  estimatedGrams: number | null
  createdAt: string
  weekKey: string
  playerName: string
}

export interface LeaderboardEntry {
  playerName: string
  totalSausages: number
  totalGrams: number
  rank: number
}

export interface Leaderboard {
  allTime: LeaderboardEntry[]
  thisWeek: LeaderboardEntry[]
  weekKey: string
}

export interface AnalysisResult {
  count: number
  description: string
  confidence: 'high' | 'medium' | 'low'
  sausageTypes: string[]
  gramsPerSausage: number
}

export interface WeekGroup {
  weekKey: string
  weekLabel: string
  totalSausages: number
  totalGrams: number
  meals: Meal[]
}

export interface GalleryData {
  weeks: WeekGroup[]
  grandTotal: number
  grandTotalGrams: number
}

export interface SausageChainEntry {
  playerName: string
  streakWeeks: number
}

export interface HeroCard {
  id: string
  playerName: string
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
  createdAt: string
}

export type BattleStatus = 'waiting' | 'selecting' | 'battling' | 'finished'

export interface Battle {
  id: string
  challenger: string
  opponent: string | null
  status: BattleStatus
  challengerReady: boolean
  opponentReady: boolean
  currentTurn: number
  turnPlayer: string | null
  winner: string | null
  summary: string | null
  createdAt: string
  updatedAt: string
}

export interface BattleDeckCard {
  id: string
  battleId: string
  playerName: string
  cardId: string
  position: number
  currentHp: number
  isActive: boolean
  isKnockedOut: boolean
  card?: HeroCard
}

export interface BattleTurn {
  id: string
  battleId: string
  turnNumber: number
  attacker: string
  attackerCardId: string
  defenderCardId: string
  moveUsed: string
  moveDamage: number
  typeMultiplier: number
  damageDealt: number
  defenderHpAfter: number
  isKnockout: boolean
  itemUsed: string | null
  itemEffect: string | null
  createdAt: string
}

export interface BattleStats {
  playerName: string
  wins: number
  losses: number
  eloRating: number
}

export interface BattleTaunt {
  id: string
  battleId: string
  playerName: string
  message: string
  createdAt: string
}

export interface BattleState {
  battle: Battle
  challengerDeck: BattleDeckCard[]
  opponentDeck: BattleDeckCard[]
  turns: BattleTurn[]
  taunts: BattleTaunt[]
  effects: BattleEffect[]
}

export interface WeeklySummary {
  id: string
  playerName: string
  weekKey: string
  summaryText: string
  totalSausages: number
  totalGrams: number
  mealCount: number
  chainLength: number
  createdAt: string
  imageUrls?: string[]
}

// ── Items & Inventory ──────────────────────────────────────

export type ItemRarity = 'common' | 'uncommon' | 'rare'
export type ItemEffectType = 'heal' | 'buff_atk' | 'buff_def' | 'buff_spd' | 'direct_damage' | 'debuff_atk' | 'debuff_def'

export interface ItemDefinition {
  itemKey: string
  name: string
  description: string
  rarity: ItemRarity
  effectType: ItemEffectType
  effectValue: number
  effectDuration?: number
  flavorText: string
}

export interface PlayerItem {
  id: string
  playerName: string
  itemKey: string
  obtainedAt: string
}

export interface BattleEffect {
  id: string
  battleId: string
  targetCardId: string
  effectType: ItemEffectType
  effectValue: number
  remainingTurns: number
  sourcePlayer: string
}

export type UploadPhase =
  | 'idle'
  | 'uploading'
  | 'analyzing'
  | 'confirming'
  | 'saving'
  | 'success'

export interface UploadState {
  phase: UploadPhase
  preview?: string
  blobUrl?: string
  blobPath?: string
  analysis?: AnalysisResult
  confirmedCount?: number
  error?: string
}
