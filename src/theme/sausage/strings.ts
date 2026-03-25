import type { ThemeStrings } from '@/theme/types'

export const STRINGS: ThemeStrings = {
  // Layout / nav
  menubarTitle: 'SAUSAGE TRACKER V1.1',
  metaTitle: 'Sausage Tracker',
  metaDescription: 'Log sausages, build hero cards, battle your friends',

  // About
  aboutVersion: 'SAUSAGE TRACKER V1.1',
  aboutParagraphs: [
    'Photo uploader where AI counts your sausages. Each week, your eating habits generate a unique hero card with sausage-pun moves and stats based on your consumption.',
    'Challenge friends in turn-based card battles with type advantages, items, deck building, and ELO rankings. Includes live taunts and AI-generated battle recaps.',
    'Built with Next.js, Claude Haiku, and an unhealthy obsession with processed meat.',
  ],
  aboutTagline: 'About Sausage Tracker',

  // Home page
  windowTitle: 'ADD MEAL - SAUSAGE TRACKER',
  uploadInstruction: 'UPLOAD A PHOTO OF YOUR MEAL. AI WILL COUNT THE SAUSAGES.',
  uploadSubInstruction: 'EACH SAUSAGE EARNS YOU ONE POINT.',
  uploadDropzoneEmoji: '\u{1F32D}',
  uploadDropzoneLabel: 'DROP MEAL PHOTO HERE',
  namePrompt: 'ENTER YOUR NAME TO START TRACKING SAUSAGES',
  steps: ['1. UPLOAD', '2. ANALYZE', '3. CONFIRM', '4. SCORE'],

  // Tips & rules
  tipsTitle: 'TIPS',
  tipsLines: [
    'SAUSAGES COUNTED: BRATWURST, FRANKFURTERS, CHORIZO, HOT DOGS, CHIPOLATAS, MERGUEZ, WEISSWURST, BANGERS AND MORE',
    'YOU CAN ADJUST THE AI COUNT BEFORE CONFIRMING',
    'BEST RESULTS: CLEAR PHOTO, GOOD LIGHTING, SAUSAGES VISIBLE',
  ],
  rulesTitle: 'RULES',
  rulesLines: [
    'NO RETROSPECTIVE LOGGING. SAUSAGES MUST BE LOGGED THE SAME DAY THEY ARE EATEN. LOGGING MEALS FROM YESTERDAY, LAST WEEK OR EARLIER IS NOT ALLOWED.',
    'PHOTO MUST SHOW THE ACTUAL MEAL YOU ARE EATING RIGHT NOW.',
  ],

  // Analysis
  aiDetectedLabel: (count: number, confidence: string) =>
    `AI DETECTED: ${count} SAUSAGE${count !== 1 ? 'S' : ''} \u2014 ${confidence.toUpperCase()} CONFIDENCE`,
  weightLabel: 'EST. WEIGHT:',
  weightEstLabel: (weightPerItem: number, count: number) =>
    `~${weightPerItem * count}G (${weightPerItem}G \u00d7 ${count})`,
  adjustCountLabel: 'ADJUST COUNT IF NEEDED:',
  successLabel: (count: number) =>
    `SAUSAGE${count !== 1 ? 'S' : ''} RECORDED! ${count} POINT${count !== 1 ? 'S' : ''} ADDED TO YOUR SCORE`,
  pointsLabel: (count: number) =>
    `CONFIRM  +${count} POINT${count !== 1 ? 'S' : ''}`,

  // Health warning
  healthWarningThreshold: 5,
  healthWarningTitle: 'HEALTH WARNING',
  healthWarningText: (count: number) =>
    `${count} SAUSAGES IN ONE MEAL IS A LOT. EATING THIS MANY SAUSAGES MAY NEGATIVELY IMPACT YOUR HEALTH. PLEASE CONFIRM YOU REALLY ATE THIS MANY.`,
  healthConfirmText: (count: number) =>
    `I CONFIRM I ATE ${count} SAUSAGES AND UNDERSTAND THIS MAY IMPACT MY HEALTH NEGATIVELY`,

  // Highscore
  highscoreTitle: 'SAUSAGE HIGHSCORE',
  highscoreBanner: 'WHO ATE THE MOST SAUSAGES?',
  noMealsThisWeek: 'NO MEALS THIS WEEK YET',
  noScoresYet: 'NO SCORES YET \u2014 LOG A MEAL!',

  // Chain
  chainTitle: 'THE SAUSAGE CHAIN',
  chainExplanation: 'EACH LINK = 1 WEEK WITH 3+ SAUSAGES. MISS A WEEK AND YOUR CHAIN BREAKS!',
  chainEmptyText: 'NO CHAINS YET \u2014 LOG 3+ SAUSAGES IN A WEEK TO START YOURS!',
  chainThreshold: 3,

  // New card
  crateAppearText: 'ITEM FOUND!',
  openCrateButton: 'OPEN',

  // Shop
  shopTitle: 'THE SAUSAGE EMPORIUM',
  currencyName: 'FRANKFURTERS',
  currencyCode: 'FR',
  currencyTagline: 'THE OFFICIAL CURRENCY OF SAUSAGE TRACKER',

  // Gallery
  galleryTitle: 'WEEKLY SAUSAGE LOG',
  galleryLifetimeScore: (total: number) => `LIFETIME SAUSAGE SCORE: ${String(total).padStart(4, '0')} POINTS`,
  galleryAddButton: '+ ADD NEW MEAL',
  galleryEmpty: 'NO MEALS RECORDED YET.',
  galleryEmptySub: 'UPLOAD YOUR FIRST MEAL TO GET STARTED!',
  weekGroupItemLabel: (count: number) => `SAUSAGE${count !== 1 ? 'S' : ''}`,

  // Feed
  feedTitle: 'SAUSAGE FEED — ALL MEALS',
  feedCommunityCount: (total: number) => `COMMUNITY SAUSAGE COUNT: ${String(total).padStart(4, '0')} \u{1F32D}`,
  feedAddButton: '+ ADD MEAL',
  feedEmpty: 'NO MEALS YET. BE THE FIRST TO LOG A SAUSAGE!',

  // Items unit
  itemName: 'sausage',
  itemNamePlural: 'sausages',
  itemEmoji: '\u{1F32D}',
}
