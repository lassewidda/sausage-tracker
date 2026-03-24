import type { ThemeConfig } from './types'
import { sausageTheme } from './sausage'
import { exerciseTheme } from './exercise'

const THEME = process.env.NEXT_PUBLIC_THEME || 'sausage'

const theme: ThemeConfig = THEME === 'exercise' ? exerciseTheme : sausageTheme

export default theme
export type { ThemeConfig, TypeTheme, StarterCard, ShopItem, ThemeStrings, ThemePrompts } from './types'
