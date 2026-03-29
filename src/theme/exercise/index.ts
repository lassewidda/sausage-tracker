import type { ThemeConfig } from '../types'
import { exercisePrompts } from './prompts'
import { exerciseTypeChart, exerciseTypeThemes, exerciseDefaultTypeTheme } from './battleTypes'
import { exerciseStarters } from './starters'
import { exerciseItemCatalog } from './items'
import { exerciseShopCatalog } from './shop'
import { exerciseStrings } from './strings'

export const exerciseTheme: ThemeConfig = {
  appName: 'PowerUp',
  appVersion: '1.0',

  prompts: exercisePrompts,

  typeChart: exerciseTypeChart,
  typeThemes: exerciseTypeThemes,
  defaultTypeTheme: exerciseDefaultTypeTheme,

  starterCards: exerciseStarters,

  itemCatalog: exerciseItemCatalog,
  shopCatalog: exerciseShopCatalog,

  strings: exerciseStrings,

  // Colors — Ocean Blue & White
  colors: {
    bg: '#1A2744',
    accent: '#4A90D9',
    accentDark: '#3570B0',
    windowBody: '#243352',
    textMuted: '#7A8DA8',
    textDark: '#D0D8E8',
    textLight: '#FFFFFF',
    bevelLight: '#3A5070',
    bevelMid: '#2A3D5C',
    bevelShadow: '#142035',
    bevelDeep: '#0D1520',
    crtGlow: '#5AA0E8',
    crtGlowDim: '#2A5080',
    bodyBg: '#121D30',
  },

  // Feature flags
  features: {
    challenge: true,
    progress: true,
  },

  fallbackCardTitle: 'Gym Newbie',
  fallbackCardType: 'CARDIO/STRENGTH',
  fallbackCardMoves: [
    'Awkward Bench Press (30/6)',
    'Confused Dumbbell Curl (25/7)',
    'Treadmill Jog of Shame (20/8)',
  ],
}
