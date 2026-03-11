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
