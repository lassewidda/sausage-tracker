export interface Meal {
  id: string
  imageUrl: string
  blobPath: string
  itemCount: number
  aiSuggestedCount: number | null
  aiDescription: string | null
  estimatedGrams: number | null
  exerciseType?: string | null
  createdAt: string
  weekKey: string
  playerName: string
}

export interface LeaderboardEntry {
  playerName: string
  totalItems: number
  totalGrams: number
  rank: number
  cardioCount?: number
  strengthCount?: number
  challengesCompleted?: number
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
  detectedTypes: string[]
  weightPerItem: number
  exerciseType?: string
}

export interface WeekGroup {
  weekKey: string
  weekLabel: string
  totalItems: number
  totalGrams: number
  meals: Meal[]
}

export interface GalleryData {
  weeks: WeekGroup[]
  grandTotal: number
  grandTotalGrams: number
}

export interface ChainEntry {
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

export type BattleStatus = 'waiting' | 'selecting' | 'battling' | 'awaiting_switch' | 'finished'

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
  switchPlayer: string | null
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
  lastMoveUsed: string | null
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
  isCritical: boolean
  isMiss: boolean
  isGuard: boolean
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
  totalItems: number
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
  usedAt: string | null
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

// ── Weekly Challenges ──────────────────────────────────────

export interface Team {
  name: string
  members: string[]
}

export interface WeeklyChallenge {
  id: string
  weekKey: string
  bingoItems: string[]
  exerciseMinimum: number
  exerciseRequirements?: Record<string, number> | null
  challengeMode: 'individual' | 'group'
  teams: Team[] | null
  createdAt: string
}

export interface ChallengePhoto {
  id: string
  challengeId: string
  playerName: string
  bingoItem: string
  imageUrl: string
  blobPath: string
  createdAt: string
}

export interface ChallengeParticipant {
  playerName: string
  photos: ChallengePhoto[]
  exerciseCount: number
  exerciseTypeCounts?: Record<string, number>
  completedBingoItems: string[]
  isComplete: boolean
}

export interface TeamProgress {
  team: Team
  photos: ChallengePhoto[]
  completedBingoItems: string[]
  memberProgress: ChallengeParticipant[]
  isComplete: boolean
}

export interface ChallengeView {
  challenge: WeeklyChallenge | null
  participants: ChallengeParticipant[]
  teamProgress?: TeamProgress[]
}

export interface ChallengeLeaderboardEntry {
  playerName: string
  completedChallenges: number
}

export interface GroupLeaderboardEntry {
  teamName: string
  completedChallenges: number
}

// ── Player Goals ──────────────────────────────────────────

export interface PlayerGoal {
  playerName: string
  cardioTarget: number
  strengthTarget: number
}

export interface GoalStreakEntry {
  playerName: string
  streakWeeks: number
  totalGoalWeeks: number
  cardioTarget: number
  strengthTarget: number
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
