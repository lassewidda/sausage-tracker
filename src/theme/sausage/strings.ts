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
  chainNoStreakText: '— NO CHAIN YET —',
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

  // Battle messages
  victoryMessages: [
    'YOUR SAUSAGES REIGN SUPREME!',
    'THE WURST IS YET TO COME... FOR THEM!',
    'FRANKTASTIC VICTORY!',
    'THEY\'VE BEEN THOROUGHLY GRILLED!',
    'ABSOLUTE BANGER OF A WIN!',
    'MUSTARD-CLASS DOMINANCE!',
    'YOU REALLY LINKED THOSE COMBOS!',
    'EXTRA CRISPY VICTORY!',
    'THEY GOT SMOKED!',
    'BRATWURST BRILLIANCE!',
  ],
  defeatMessages: [
    'YOUR LINKS HAVE BEEN SEVERED!',
    'ROASTED... LITERALLY.',
    'YOU\'VE BEEN WURST\'D!',
    'BACK TO THE FRIDGE WITH YOU!',
    'OVERCOOKED AND OUTMATCHED!',
    'YOUR CASING HAS BEEN BUSTED!',
    'SERVED WITH A SIDE OF DEFEAT!',
    'THAT WAS RARE... MEDIUM RARE... WELL DONE.',
    'KETCHUP ON YOUR GRAVE!',
    'TIME TO RECONSIDER YOUR CONDIMENTS!',
  ],
  drawMessages: [
    'MUTUAL DESTRUCTION... RESPECT.',
    'BOTH SIDES WELL DONE.',
    'A TIE? HOW UNAPPETIZING!',
    'NOBODY GETS THE LAST SAUSAGE!',
  ],
  victoryEmojis: ['\u{1F32D}', '\u{1F389}', '\u{1F7E1}', '\u{1F525}', '\u2B50', '\u{1F3C6}', '\u{1F4A5}'],
  tauntPresets: [
    { label: '\u{1F32D}', text: '\u{1F32D}' },
    { label: '\u{1F525}', text: '\u{1F525}\u{1F525}\u{1F525}' },
    { label: '\u{1F480}', text: '\u{1F480}' },
    { label: '\u{1F602}', text: '\u{1F602}' },
    { label: '\u{1F356}', text: '\u{1F356}' },
    { label: '\u{1F4A9}', text: '\u{1F4A9}' },
    { label: 'GG', text: 'GG!' },
    { label: 'RIP', text: 'R.I.P. your sausage' },
    { label: 'WOW', text: 'WOW what a move!' },
    { label: 'OOF', text: 'OOF that hurt...' },
    { label: '???', text: 'What are you doing?!' },
    { label: 'YUM', text: 'Mmm tasty sausage!' },
  ],

  // Battle empty states
  noCardsYet: 'NO CARDS YET. LOG MEALS TO EARN WEEKLY CARDS!',
  noItemsLog: 'NO ITEMS. LOG MEALS TO FIND ITEMS!',
  noItemsLogLobby: 'NO ITEMS. LOG MEALS FOR A CHANCE TO FIND ITEMS!',

  // Loading messages
  lobbyLoadingMessages: [
    'BOILING THE SAUSAGES...',
    'APPLYING MUSTARD...',
    'GRILLING THE BRATWURST...',
    'WARMING UP THE BUNS...',
    'CONSULTING THE WURST ORACLE...',
    'COUNTING SAUSAGE LINKS...',
    'SHARPENING THE TONGS...',
    'LIGHTING THE GRILL...',
  ],

  // Misc UI
  photoAltText: 'Meal photo',
  deleteTooltip: 'Delete this meal',

  // Items unit
  itemName: 'sausage',
  itemNamePlural: 'sausages',
  itemEmoji: '\u{1F32D}',
}
