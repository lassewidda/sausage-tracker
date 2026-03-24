import theme from '@/theme'
export type { ShopItem } from '@/theme/types'
import type { ShopItem } from '@/theme/types'

export function getShopItem(slug: string): ShopItem | undefined {
  return theme.shopCatalog.find(item => item.slug === slug)
}

export function getShopItemsByCategory(category: ShopItem['category']): ShopItem[] {
  return theme.shopCatalog.filter(item => item.category === category)
}
