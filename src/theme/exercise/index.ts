import type { ThemeConfig } from '../types'
import { exercisePrompts } from './prompts'
import { exerciseTypeChart, exerciseTypeThemes, exerciseDefaultTypeTheme } from './battleTypes'
import { exerciseStarters } from './starters'
import { exerciseItemCatalog } from './items'
import { exerciseShopCatalog } from './shop'
import { exerciseStrings } from './strings'

export const exerciseTheme: ThemeConfig = {
  appName: 'Gains Tracker',
  appVersion: '1.0',

  prompts: exercisePrompts,

  typeChart: exerciseTypeChart,
  typeThemes: exerciseTypeThemes,
  defaultTypeTheme: exerciseDefaultTypeTheme,

  starterCards: exerciseStarters,

  itemCatalog: exerciseItemCatalog,
  shopCatalog: exerciseShopCatalog,

  strings: exerciseStrings,

  fallbackCardTitle: 'Gym Newbie',
  fallbackCardType: 'CARDIO/STRENGTH',
  fallbackCardMoves: [
    'Awkward Bench Press (30/6)',
    'Confused Dumbbell Curl (25/7)',
    'Treadmill Jog of Shame (20/8)',
  ],
}
