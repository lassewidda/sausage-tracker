import type { ItemDefinition } from '@/types'

export interface TypeTheme {
  bg: string
  gradient: string
  border: string
  glow: string
  accent: string
  bodyColor: string
  accentColor: string
  particle: string
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

export interface ShopItem {
  slug: string
  name: string
  description: string
  price: number
  category: 'merch' | 'card_pack' | 'item'
  flavorText: string
  available: boolean
  rewardCount?: number
  rewardRarity?: 'common' | 'uncommon' | 'rare' | 'mixed'
}

export interface ThemeStrings {
  // Layout / nav
  menubarTitle: string
  metaTitle: string
  metaDescription: string

  // About
  aboutVersion: string
  aboutParagraphs: string[]
  aboutTagline: string

  // Home page
  windowTitle: string
  uploadInstruction: string
  uploadSubInstruction: string
  uploadDropzoneEmoji: string
  uploadDropzoneLabel: string
  namePrompt: string
  steps: string[]

  // Tips & rules
  tipsTitle: string
  tipsLines: string[]
  rulesTitle: string
  rulesLines: string[]

  // Analysis
  aiDetectedLabel: (count: number, confidence: string) => string
  weightLabel: string
  weightEstLabel: (weightPerItem: number, count: number) => string
  adjustCountLabel: string
  successLabel: (count: number) => string
  pointsLabel: (count: number) => string

  // Health warning
  healthWarningThreshold: number
  healthWarningTitle: string
  healthWarningText: (count: number) => string
  healthConfirmText: (count: number) => string

  // Highscore
  highscoreTitle: string
  highscoreBanner: string
  noMealsThisWeek: string
  noScoresYet: string

  // Chain
  chainTitle: string
  chainExplanation: string
  chainEmptyText: string
  chainThreshold: number

  // New card
  crateAppearText: string
  openCrateButton: string

  // Shop
  shopTitle: string
  currencyName: string
  currencyCode: string
  currencyTagline: string

  // Items unit
  itemName: string
  itemNamePlural: string
  itemEmoji: string
}

export interface HeroCardPromptData {
  playerName: string
  totalItems: number
  totalWeight: number
  mealCount: number
  maxInOneMeal: number
  activeWeeks: number
  chainLength: number
  recentDescriptions: string
  existingTitlesList: string
  existingTypesList: string
}

export interface WeeklySummaryPromptData {
  playerName: string
  weekLabel: string
  mealList: string
  totalItems: number
  totalWeight: number
  mealCount: number
  chainStatus: string
  trend: string
}

export interface BattleSummaryPromptData {
  challenger: string
  opponent: string
  winner: string | null
  turnLog: string
}

export interface ThemePrompts {
  visionSystemPrompt: string
  visionUserPrompt: string
  heroCardPrompt: (data: HeroCardPromptData) => string
  weeklySummaryPrompt: (data: WeeklySummaryPromptData) => string
  battleSummaryPrompt: (data: BattleSummaryPromptData) => string
  descriptionRewritePrompt: (description: string, oldCount: number, newCount: number) => string
}

export interface ThemeConfig {
  // Identity
  appName: string
  appVersion: string

  // Prompts
  prompts: ThemePrompts

  // Type system
  typeChart: Record<string, Record<string, number>>
  typeThemes: Record<string, TypeTheme>
  defaultTypeTheme: TypeTheme

  // Starter cards
  starterCards: StarterCard[]

  // Items & shop
  itemCatalog: Record<string, ItemDefinition>
  shopCatalog: ShopItem[]

  // UI strings
  strings: ThemeStrings

  // Colors (CSS variable overrides)
  colors: ThemeColors

  // Fallbacks
  fallbackCardTitle: string
  fallbackCardType: string
  fallbackCardMoves: string[]
}

export interface ThemeColors {
  bg: string
  accent: string
  accentDark: string
  windowBody: string
  textMuted: string
  textDark: string
  textLight: string
  bevelLight: string
  bevelMid: string
  bevelShadow: string
  bevelDeep: string
  crtGlow: string
  crtGlowDim: string
  bodyBg: string           // background-image base gradient
}
