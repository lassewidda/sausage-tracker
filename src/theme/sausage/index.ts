import type { ThemeConfig } from '@/theme/types'
import { sausagePrompts } from './prompts'
import { TYPE_CHART, TYPE_THEMES, DEFAULT_TYPE_THEME } from './battleTypes'
import { STARTER_CARDS } from './starters'
import { ITEM_CATALOG } from './items'
import { SHOP_CATALOG } from './shop'
import { STRINGS } from './strings'

export const sausageTheme: ThemeConfig = {
  // Identity
  appName: 'Sausage Tracker',
  appVersion: '1.1',

  // Prompts
  prompts: sausagePrompts,

  // Type system
  typeChart: TYPE_CHART,
  typeThemes: TYPE_THEMES,
  defaultTypeTheme: DEFAULT_TYPE_THEME,

  // Starter cards
  starterCards: STARTER_CARDS,

  // Items & shop
  itemCatalog: ITEM_CATALOG,
  shopCatalog: SHOP_CATALOG,

  // UI strings
  strings: STRINGS,

  // Fallbacks
  fallbackCardTitle: 'Mystery Sausage',
  fallbackCardType: 'BRATWURST/GRILLED',
  fallbackCardMoves: ['Link Slap (20/12)', 'Casing Crush (30/6)', 'Mustard Megablast (45/2)'],
}
