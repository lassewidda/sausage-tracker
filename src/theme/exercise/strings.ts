import type { ThemeStrings } from '../types'

export const exerciseStrings: ThemeStrings = {
  // Layout / nav
  menubarTitle: 'GAINS TRACKER',
  metaTitle: 'Gains Tracker - Log Your Workouts, Battle Your Bros',
  metaDescription: 'Track your gym sessions with AI, earn hero cards, and battle other fitness warriors in turn-based combat.',

  // About
  aboutVersion: 'v1.0 — BEAST MODE EDITION',
  aboutParagraphs: [
    'Gains Tracker uses AI to analyze your workout screenshots from apps like Strava, Apple Health, Nike Run Club, Garmin, and Fitbit.',
    'Every workout you log earns you points and generates unique hero cards for the battle arena. The more you train, the stronger your cards.',
    'Challenge other gym warriors to turn-based battles using your collection of fitness-themed hero cards. May the swolest win.',
  ],
  aboutTagline: 'Track gains. Collect cards. Battle bros. No rest days.',

  // Home page
  windowTitle: 'LOG YOUR WORKOUT',
  uploadInstruction: 'Upload a screenshot from your fitness app',
  uploadSubInstruction: 'Supports Strava, Apple Health, Nike Run Club, Garmin, Fitbit, and more',
  uploadDropzoneEmoji: '💪',
  uploadDropzoneLabel: 'Drop your workout screenshot here',
  namePrompt: 'Enter your gym name, warrior:',
  steps: [
    '1. Screenshot your workout from any fitness app',
    '2. Upload it here — our AI counts your workouts',
    '3. Confirm & log to earn points and hero cards',
    '4. Battle other gym warriors with your card collection',
  ],

  // Tips & rules
  tipsTitle: 'GYM TIPS',
  tipsLines: [
    'Supported apps: Strava, Apple Health, Nike Run Club, Garmin Connect, Fitbit, Peloton, Strong, JEFIT, Whoop',
    'Screenshots with multiple workouts visible will count each session',
    'Weekly summaries and dashboard views work great too',
    'The clearer the screenshot, the better the AI detection',
    'Each workout = 1 point toward your weekly hero card',
  ],
  rulesTitle: 'GYM RULES',
  rulesLines: [
    'Workouts must be logged the same day they are completed',
    'Screenshot must show an actual completed workout (not a planned one)',
    'One upload per workout session — no double-dipping',
    'Rest days are important but they don\'t count as workouts, bro',
    'Be honest — fake gains are worse than no gains',
  ],

  // Analysis
  aiDetectedLabel: (count: number, confidence: string) =>
    `AI detected ${count} workout${count !== 1 ? 's' : ''} (${confidence} confidence)`,
  weightLabel: 'Est. Calories Burned',
  weightEstLabel: (caloriesPerWorkout: number, count: number) =>
    `~${caloriesPerWorkout * count} cal (${caloriesPerWorkout} cal/workout x ${count})`,
  adjustCountLabel: 'Adjust workout count:',
  successLabel: (count: number) =>
    `${count} workout${count !== 1 ? 's' : ''} logged! Keep grinding! 💪`,
  pointsLabel: (count: number) =>
    `+${count} point${count !== 1 ? 's' : ''}`,

  // Health warning
  healthWarningThreshold: 4,
  healthWarningTitle: 'OVERTRAINING WARNING',
  healthWarningText: (count: number) =>
    `${count} workouts in one session? That's some serious volume. Are you sure you're not overtraining? Rest and recovery are part of the process, bro.`,
  healthConfirmText: (count: number) =>
    `Yes, I really did ${count} workouts. Beast mode.`,

  // Highscore
  highscoreTitle: 'LEADERBOARD OF GAINS',
  highscoreBanner: 'WHO LIFTS THE MOST?',
  noMealsThisWeek: 'No workouts logged this week. Rest day for everyone?',
  noScoresYet: 'No gains tracked yet. Be the first to log a workout!',

  // Chain
  chainTitle: 'WORKOUT STREAK',
  chainExplanation: 'Log 3+ workouts per week to maintain your streak. Consistency is king.',
  chainEmptyText: 'No active streak. Start logging workouts to build one!',
  chainThreshold: 3,

  // New card
  crateAppearText: 'A gym locker has appeared from your weekly training!',
  openCrateButton: 'OPEN THE LOCKER',

  // Shop
  shopTitle: 'THE GYM PRO SHOP',
  currencyName: 'Protein Coin',
  currencyCode: 'PC',
  currencyTagline: 'Earned through sweat. Spent on gains.',

  // Gallery
  galleryTitle: 'WEEKLY WORKOUT LOG',
  galleryLifetimeScore: (total: number) => `LIFETIME GAINS SCORE: ${String(total).padStart(4, '0')} POINTS`,
  galleryAddButton: '+ LOG NEW WORKOUT',
  galleryEmpty: 'NO WORKOUTS RECORDED YET.',
  galleryEmptySub: 'UPLOAD YOUR FIRST WORKOUT TO GET STARTED!',
  weekGroupItemLabel: (count: number) => `WORKOUT${count !== 1 ? 'S' : ''}`,

  // Feed
  feedTitle: 'WORKOUT FEED — ALL SESSIONS',
  feedCommunityCount: (total: number) => `COMMUNITY WORKOUT COUNT: ${String(total).padStart(4, '0')} 💪`,
  feedAddButton: '+ LOG WORKOUT',
  feedEmpty: 'NO WORKOUTS YET. BE THE FIRST TO LOG A SESSION!',

  // Battle messages
  victoryMessages: [
    'ABSOLUTE GAINS! YOU CRUSHED IT!',
    'THEY SKIPPED LEG DAY... YOU DIDN\'T!',
    'PR ACHIEVED! FLAWLESS VICTORY!',
    'THEY COULDN\'T EVEN LIFT YOUR WARM-UP!',
    'BEAST MODE ACTIVATED!',
    'REP AFTER REP OF PURE DOMINANCE!',
    'THEY NEED A SPOTTER... AND A THERAPIST!',
    'PUMPED UP AND POWERED THROUGH!',
    'NO REST DAYS FOR CHAMPIONS!',
    'SWOLE PATROL REPORTING FOR DUTY!',
  ],
  defeatMessages: [
    'YOU GOT OUTLIFTED!',
    'BACK TO THE BENCH, ROOKIE.',
    'THEY HAD BETTER FORM...',
    'OVERWORKED AND OUTMATCHED!',
    'TIME TO RECONSIDER YOUR ROUTINE!',
    'YOUR MUSCLES FAILED THE REP CHECK!',
    'SOMEONE SKIPPED THEIR PRE-WORKOUT...',
    'THAT WAS HEAVY... FOR YOU.',
    'DROPPED THE WEIGHT ON THAT ONE!',
    'SPOTTERLESS AND SORRY!',
  ],
  drawMessages: [
    'MUTUAL EXHAUSTION... RESPECT.',
    'BOTH SIDES HIT FAILURE!',
    'A TIE? NO ONE GOES HOME SWOLE!',
    'NOBODY GETS THE LAST REP!',
  ],
  victoryEmojis: ['💪', '🎉', '🟡', '🔥', '⭐', '🏆', '💥'],
  tauntPresets: [
    { label: '💪', text: '💪' },
    { label: '🔥', text: '🔥🔥🔥' },
    { label: '💀', text: '💀' },
    { label: '😂', text: '😂' },
    { label: '🏋️', text: '🏋️' },
    { label: '💩', text: '💩' },
    { label: 'GG', text: 'GG!' },
    { label: 'RIP', text: 'R.I.P. your gains' },
    { label: 'WOW', text: 'WOW what a move!' },
    { label: 'OOF', text: 'OOF that hurt...' },
    { label: '???', text: 'What are you doing?!' },
    { label: 'BRO', text: 'Do you even lift, bro?' },
  ],

  // Battle empty states
  noCardsYet: 'NO CARDS YET. LOG WORKOUTS TO EARN WEEKLY CARDS!',
  noItemsLog: 'NO ITEMS. LOG WORKOUTS TO FIND ITEMS!',
  noItemsLogLobby: 'NO ITEMS. LOG WORKOUTS FOR A CHANCE TO FIND ITEMS!',

  // Misc UI
  photoAltText: 'Workout screenshot',
  deleteTooltip: 'Delete this workout',

  // Items unit
  itemName: 'workout',
  itemNamePlural: 'workouts',
  itemEmoji: '💪',
}
