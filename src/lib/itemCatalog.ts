import type { ItemDefinition, ItemRarity } from '@/types'
import theme from '@/theme'

const COMMON_ITEMS = Object.values(theme.itemCatalog).filter(i => i.rarity === 'common')
const UNCOMMON_ITEMS = Object.values(theme.itemCatalog).filter(i => i.rarity === 'uncommon')
const RARE_ITEMS = Object.values(theme.itemCatalog).filter(i => i.rarity === 'rare')

const DROP_CHANCE = 0.18

const RARITY_WEIGHTS: { rarity: ItemRarity; weight: number; items: ItemDefinition[] }[] = [
  { rarity: 'common', weight: 60, items: COMMON_ITEMS },
  { rarity: 'uncommon', weight: 30, items: UNCOMMON_ITEMS },
  { rarity: 'rare', weight: 10, items: RARE_ITEMS },
]

export function rollItemDrop(): ItemDefinition | null {
  if (Math.random() > DROP_CHANCE) return null

  const roll = Math.random() * 100
  let cumulative = 0
  for (const tier of RARITY_WEIGHTS) {
    cumulative += tier.weight
    if (roll < cumulative) {
      const item = tier.items[Math.floor(Math.random() * tier.items.length)]
      return item
    }
  }

  return COMMON_ITEMS[0]
}

export function getItemDefinition(itemKey: string): ItemDefinition | undefined {
  return theme.itemCatalog[itemKey]
}

export function getItemsByRarity(rarity: string): ItemDefinition[] {
  return Object.values(theme.itemCatalog).filter(item => item.rarity === rarity)
}
