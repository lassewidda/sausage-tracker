import type { ThemeStrings } from '../types'

export const exerciseStrings: ThemeStrings = {
  // Layout / nav
  menubarTitle: 'POWERUP',
  metaTitle: 'PowerUp - Log Workouts, Earn Cards, Battle Friends',
  metaDescription: 'Track your runs, lifts, rides and workouts with AI. Earn hero cards and battle other fitness warriors in turn-based combat.',

  // About
  aboutVersion: 'v1.0 — BEAST MODE EDITION',
  aboutParagraphs: [
    'PowerUp uses AI to analyze your workout screenshots from apps like Strava, Apple Health, Nike Run Club, Garmin, and Fitbit — or just a photo from your run.',
    'Every workout you log earns you points and generates unique hero cards for the battle arena. The more you train, the stronger your cards.',
    'Challenge other fitness warriors to turn-based battles using your collection of exercise-themed hero cards. Runners, lifters, cyclists — all welcome.',
  ],
  aboutTagline: 'Track gains. Collect cards. Battle friends. No rest days.',

  // Home page
  windowTitle: 'LOG YOUR WORKOUT TO POWERUP',
  uploadInstruction: 'Upload a screenshot or photo from your workout',
  uploadSubInstruction: '',
  uploadDropzoneEmoji: '💪',
  uploadDropzoneLabel: 'Drop your workout photo here',
  namePrompt: 'Enter your athlete name:',
  steps: [
    '1. Screenshot your workout app or snap a photo during your session',
    '2. Upload it here — our AI detects the exercise type',
    '3. Confirm cardio or strength to log your workout',
    '4. Earn hero cards and battle your friends',
  ],

  // Tips & rules
  tipsTitle: 'WORKOUT TIPS',
  tipsLines: [
    'Supported apps: Strava, Apple Health, Nike Run Club, Garmin Connect, Fitbit...',
    'You can also upload photos taken during your run, ride, hike, or gym session',
    'Each upload counts as one workout — pick cardio or strength',
    'The clearer the photo, the better the AI detection',
    'Each workout = 1 point toward your weekly hero card',
  ],
  rulesTitle: 'HOUSE RULES',
  rulesLines: [
    'Workouts must be logged the same day they are completed',
    'Photo must show an actual completed workout (not a planned one)',
    'One upload per workout session — no double-dipping',
    'Rest days are important but they don\'t count as workouts',
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
    `${count} workout${count !== 1 ? 's' : ''} logged! Keep moving! 🔥`,
  pointsLabel: (count: number) =>
    `+${count} point${count !== 1 ? 's' : ''}`,

  // Health warning
  healthWarningThreshold: 4,
  healthWarningTitle: 'OVERTRAINING WARNING',
  healthWarningText: (count: number) =>
    `${count} workouts in one session? That's some serious volume. Are you sure you're not overtraining? Rest and recovery are part of the process.`,
  healthConfirmText: (count: number) =>
    `Yes, I really did ${count} workouts. I'm built different.`,

  // Highscore
  highscoreTitle: 'LEADERBOARD OF GAINS',
  highscoreBanner: [
    'WHO LIFTS THE MOST?',
    'WHO\'S BEEN GRINDING?',
    'GAINS CHECK!',
    'WHO SKIPPED LEG DAY?',
    'SWEAT LEADERBOARD',
    'FLEX OFF RANKINGS',
    'WHO\'S ACTUALLY WORKING OUT?',
    'THE GRIND NEVER STOPS',
    'NO PAIN NO GAIN BOARD',
    'WHO\'S EARNING THEIR PROTEIN?',
    'BEASTMODE RANKINGS',
    'WHO SHOWED UP THIS WEEK?',
    'ARE YOU EVEN TRYING?',
    'WHO RAN THE MOST KM?',
    'CARDIO KINGS & QUEENS',
    'MILE AFTER MILE AFTER MILE',
    'DID YOU EVEN BREAK A SWEAT?',
    'THE STRAVA STALKER BOARD',
    'WHO NEEDS A REST DAY?',
    'STEPS, REPS & GLORY',
  ],
  noMealsThisWeek: 'No workouts logged this week. Rest day for everyone?',
  noScoresYet: 'No gains tracked yet. Be the first to log a workout!',

  // Chain
  chainTitle: 'WORKOUT STREAK',
  chainExplanation: 'Log 3+ workouts per week to maintain your streak. Consistency is king.',
  chainEmptyText: 'No active streak. Start logging workouts to build one!',
  chainNoStreakText: '— NO STREAK YET —',
  chainThreshold: 3,

  // New card
  crateAppearText: 'A reward has appeared from your weekly training!',
  openCrateButton: 'OPEN THE REWARD',

  // Shop
  shopTitle: 'THE PRO SHOP',
  currencyName: 'Protein Coin',
  currencyCode: 'PC',
  currencyTagline: 'Earned through sweat. Spent on gains.',

  // Gallery
  galleryTitle: 'WEEKLY WORKOUT LOG',
  galleryLifetimeScore: (total: number) => `LIFETIME SCORE: ${String(total).padStart(4, '0')} POINTS`,
  galleryAddButton: '+ LOG NEW WORKOUT',
  galleryEmpty: 'NO WORKOUTS RECORDED YET.',
  galleryEmptySub: 'UPLOAD YOUR FIRST WORKOUT TO GET STARTED!',
  weekGroupItemLabel: (count: number) => `WORKOUT${count !== 1 ? 'S' : ''}`,

  // Feed
  feedTitle: 'WORKOUT FEED — ALL SESSIONS',
  feedCommunityCount: (total: number) => `COMMUNITY WORKOUT COUNT: ${String(total).padStart(4, '0')} 🔥`,
  feedAddButton: '+ LOG WORKOUT',
  feedEmpty: 'NO WORKOUTS YET. BE THE FIRST TO LOG A SESSION!',

  // Battle messages
  victoryMessages: [
    'ABSOLUTE DOMINANCE! YOU CRUSHED IT!',
    'THEY COULDN\'T KEEP UP WITH YOUR PACE!',
    'PR ACHIEVED! FLAWLESS VICTORY!',
    'YOU LEFT THEM IN YOUR DUST!',
    'BEAST MODE ACTIVATED!',
    'OUTRAN, OUTLIFTED, OUTCLASSED!',
    'THEY NEED A RECOVERY DAY AFTER THAT!',
    'POWERED THROUGH LIKE A CHAMPION!',
    'NO REST DAYS FOR WINNERS!',
    'CROSSED THE FINISH LINE FIRST!',
    'THAT WAS A SPRINT FINISH FOR THE AGES!',
    'PEDAL TO THE METAL! UNSTOPPABLE!',
  ],
  defeatMessages: [
    'YOU GOT OUTPACED!',
    'BACK TO TRAINING, ROOKIE.',
    'THEY HAD BETTER ENDURANCE...',
    'OVERWORKED AND OUTMATCHED!',
    'TIME TO CHANGE UP YOUR ROUTINE!',
    'THEY BLEW PAST YOU ON THE LAST LAP!',
    'SOMEONE FORGOT THEIR PRE-WORKOUT...',
    'YOU HIT THE WALL ON THAT ONE!',
    'DROPPED OFF THE PACE!',
    'BONKED HARD! NEED MORE FUEL!',
    'THEY HAD MORE IN THE TANK!',
  ],
  drawMessages: [
    'MUTUAL EXHAUSTION... RESPECT.',
    'BOTH SIDES HIT THE WALL!',
    'A TIE? NOBODY GETS THE PODIUM!',
    'PHOTO FINISH — TOO CLOSE TO CALL!',
  ],
  victoryEmojis: ['💪', '🎉', '🟡', '🔥', '⭐', '🏆', '💥'],
  tauntPresets: [
    { label: '💪', text: '💪' },
    { label: '🔥', text: '🔥🔥🔥' },
    { label: '💀', text: '💀' },
    { label: '😂', text: '😂' },
    { label: '🏋️', text: '🏋️' },
    { label: '🏃', text: '🏃💨' },
    { label: 'GG', text: 'GG!' },
    { label: 'RIP', text: 'R.I.P. your PR' },
    { label: 'WOW', text: 'WOW what a move!' },
    { label: 'OOF', text: 'OOF that hurt...' },
    { label: 'BYE', text: 'See you at the finish line!' },
    { label: 'LOL', text: 'Did you even warm up?!' },
  ],

  // Battle empty states
  noCardsYet: 'NO CARDS YET. LOG WORKOUTS TO EARN WEEKLY CARDS!',
  noItemsLog: 'NO ITEMS. LOG WORKOUTS TO FIND ITEMS!',
  noItemsLogLobby: 'NO ITEMS. LOG WORKOUTS FOR A CHANCE TO FIND ITEMS!',

  // Loading messages
  lobbyLoadingMessages: [
    'LACING UP THE SHOES...',
    'LOADING THE SQUAT RACK...',
    'MIXING THE PRE-WORKOUT...',
    'INFLATING THE TIRES...',
    'WARMING UP THE MUSCLES...',
    'CONSULTING THE GAINS GODS...',
    'STRETCHING THE HAMSTRINGS...',
    'CHECKING THE STRAVA...',
    'CALIBRATING THE GARMIN...',
    'FINDING THE CADENCE...',
  ],

  // Misc UI
  photoAltText: 'Workout screenshot',
  deleteTooltip: 'Delete this workout',

  // Items unit
  itemName: 'workout',
  itemNamePlural: 'workouts',
  itemEmoji: '💪',
}
