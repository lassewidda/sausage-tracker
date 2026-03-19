import type { ItemDefinition, ItemRarity } from '@/types'

export const ITEM_CATALOG: Record<string, ItemDefinition> = {
  // Common (60% of drops)
  ketchup_packet: {
    itemKey: 'ketchup_packet',
    name: 'Ketchup Packet',
    description: 'Heal 20 HP to your active card',
    rarity: 'common',
    effectType: 'heal',
    effectValue: 20,
    flavorText: 'Stolen from a fast food counter. The good stuff.',
  },
  mustard_squirt: {
    itemKey: 'mustard_squirt',
    name: 'Mustard Squirt',
    description: 'Boost ATK by +5 for 3 turns',
    rarity: 'common',
    effectType: 'buff_atk',
    effectValue: 5,
    effectDuration: 3,
    flavorText: 'Dijon? Yellow? Who cares — it burns with power.',
  },
  stale_bun_shield: {
    itemKey: 'stale_bun_shield',
    name: 'Stale Bun Shield',
    description: 'Boost DEF by +8 for 3 turns',
    rarity: 'common',
    effectType: 'buff_def',
    effectValue: 8,
    effectDuration: 3,
    flavorText: 'Hard as a rock. Perfect for blocking attacks.',
  },
  relish_boost: {
    itemKey: 'relish_boost',
    name: 'Relish Boost',
    description: 'Boost SPD by +5 for 3 turns',
    rarity: 'common',
    effectType: 'buff_spd',
    effectValue: 5,
    effectDuration: 3,
    flavorText: 'Sweet, tangy, and surprisingly aerodynamic.',
  },

  // Uncommon (30% of drops)
  jalapeno_stick: {
    itemKey: 'jalapeno_stick',
    name: 'Jalapeño Stick',
    description: 'Deal 25 direct damage (ignores defense)',
    rarity: 'uncommon',
    effectType: 'direct_damage',
    effectValue: 25,
    flavorText: 'Handle with gloves. Or don\'t — we\'re not your mom.',
  },
  grease_splash: {
    itemKey: 'grease_splash',
    name: 'Grease Splash',
    description: 'Lower opponent DEF by -8 for 3 turns',
    rarity: 'uncommon',
    effectType: 'debuff_def',
    effectValue: 8,
    effectDuration: 3,
    flavorText: 'Collected from the bottom of the grill. Slippery.',
  },
  sauerkraut_wrap: {
    itemKey: 'sauerkraut_wrap',
    name: 'Sauerkraut Wrap',
    description: 'Heal 40 HP to your active card',
    rarity: 'uncommon',
    effectType: 'heal',
    effectValue: 40,
    flavorText: 'Fermented cabbage heals all wounds. Science says so.',
  },
  curry_powder_bomb: {
    itemKey: 'curry_powder_bomb',
    name: 'Curry Powder Bomb',
    description: 'Deal 15 damage + lower ATK by -5 for 3 turns',
    rarity: 'uncommon',
    effectType: 'debuff_atk',
    effectValue: 5,
    effectDuration: 3,
    flavorText: 'A cloud of spice that makes eyes water and muscles weak.',
  },

  // Rare (10% of drops)
  golden_bratwurst: {
    itemKey: 'golden_bratwurst',
    name: 'Golden Bratwurst',
    description: 'Heal 60 HP to your active card',
    rarity: 'rare',
    effectType: 'heal',
    effectValue: 60,
    flavorText: 'Legend says it was grilled by the gods themselves.',
  },
  forbidden_condiment: {
    itemKey: 'forbidden_condiment',
    name: 'The Forbidden Condiment',
    description: 'Deal 40 direct damage (ignores defense)',
    rarity: 'rare',
    effectType: 'direct_damage',
    effectValue: 40,
    flavorText: 'No one knows the recipe. Those who tasted it never spoke again.',
  },
}

const COMMON_ITEMS = Object.values(ITEM_CATALOG).filter(i => i.rarity === 'common')
const UNCOMMON_ITEMS = Object.values(ITEM_CATALOG).filter(i => i.rarity === 'uncommon')
const RARE_ITEMS = Object.values(ITEM_CATALOG).filter(i => i.rarity === 'rare')

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
  return ITEM_CATALOG[itemKey]
}
