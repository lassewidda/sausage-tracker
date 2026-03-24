export interface ShopItem {
  slug: string
  name: string
  description: string
  price: number
  category: 'merch' | 'card_pack' | 'item'
  flavorText: string
  available: boolean
  rewardCount?: number
  rewardRarity?: 'common' | 'uncommon' | 'rare' | 'mixed'
}

export const SHOP_CATALOG: ShopItem[] = [
  // ── MERCH (all unavailable / coming soon) ────────────────
  {
    slug: 'golden-bratwurst-trophy',
    name: 'The Golden Bratwurst Trophy',
    description: 'A majestic trophy for the ultimate sausage champion.',
    price: 10000,
    category: 'merch',
    flavorText: 'A plastic trophy spray-painted gold. Smells faintly of mustard. The engraving says "WORLD\'S OKAYEST SAUSAGE LOGGER" in a font that was clearly the free option.',
    available: false,
  },
  {
    slug: 'sausage-apron',
    name: 'Sausage Tracker Official Apron',
    description: 'Let the world know you take sausage seriously.',
    price: 5000,
    category: 'merch',
    flavorText: '"I log my sausages" embroidered in comic sans. The pocket is shaped like a frankfurter. Your family will stage an intervention.',
    available: false,
  },
  {
    slug: 'mystery-meat-plushie',
    name: 'Mystery Meat Plushie',
    description: 'A cuddly companion of uncertain origin.',
    price: 3000,
    category: 'merch',
    flavorText: 'Suspiciously warm to the touch. Contents unknown. Makes a squelching noise when squeezed. Not machine washable. Not hand washable. Not washable.',
    available: false,
  },
  {
    slug: 'commemorative-tongs',
    name: 'Commemorative Sausage Tongs',
    description: 'Professional-grade sausage manipulation equipment.',
    price: 2500,
    category: 'merch',
    flavorText: 'For the player who takes grilling personally. Spring-loaded for maximum sausage velocity. Banned at three separate BBQ competitions.',
    available: false,
  },
  {
    slug: 'sausage-wars-tshirt',
    name: '"I Survived the Sausage Wars" T-Shirt',
    description: 'Battle-worn apparel for veterans of the great sausage conflict.',
    price: 4000,
    category: 'merch',
    flavorText: 'Available in sizes S through XXXL. Most buyers need XXXL. Features a dramatic illustration of two bratwursts locked in mortal combat. 100% polyester. 0% regret.',
    available: false,
  },
  {
    slug: 'desktop-sausage-warmer',
    name: 'USB Desktop Sausage Warmer',
    description: 'Keep a single sausage at optimal temperature while you work.',
    price: 6000,
    category: 'merch',
    flavorText: 'Your IT department will have questions. You will have a warm sausage. Everyone wins. Draws 500W through a USB-A port. Do not ask how.',
    available: false,
  },

  // ── CARD PACKS ────────────────────────────────────────────
  {
    slug: 'budget-banger-pack',
    name: 'Budget Banger Pack',
    description: '1 random card. Lower your expectations accordingly.',
    price: 100,
    category: 'card_pack',
    flavorText: 'Scraped together from the clearance bin at the sausage card factory. The card inside may or may not be slightly damp. No refunds.',
    available: true,
    rewardCount: 1,
    rewardRarity: 'common',
  },
  {
    slug: 'grillmasters-selection',
    name: 'Grillmaster\'s Selection',
    description: '3 random cards, at least 1 guaranteed uncommon or better.',
    price: 500,
    category: 'card_pack',
    flavorText: 'Hand-picked by a grillmaster with 40 years of experience and questionable hygiene. These cards have seen things. Good things, mostly.',
    available: true,
    rewardCount: 3,
    rewardRarity: 'mixed',
  },
  {
    slug: 'forbidden-crate',
    name: 'The Forbidden Crate',
    description: '5 random cards with 1 guaranteed rare. Handle with oven mitts.',
    price: 2000,
    category: 'card_pack',
    flavorText: 'Found in the back of an abandoned meat locker. Glows faintly when exposed to moonlight. The label reads "DO NOT OPEN" but you\'re not a coward, are you?',
    available: true,
    rewardCount: 5,
    rewardRarity: 'rare',
  },

  // ── IN-GAME ITEMS ─────────────────────────────────────────
  {
    slug: 'mystery-condiment',
    name: 'Mystery Condiment',
    description: '1 random common item. Could be ketchup. Could be regret.',
    price: 50,
    category: 'item',
    flavorText: 'Dispensed from an unmarked squeeze bottle found behind the register. The color is... creative.',
    available: true,
    rewardCount: 1,
    rewardRarity: 'common',
  },
  {
    slug: 'premium-provisions',
    name: 'Premium Provisions',
    description: '1 random uncommon item. Slightly less suspicious.',
    price: 200,
    category: 'item',
    flavorText: 'From the "employees only" shelf. Still in its original packaging. The expiry date is in a language you don\'t recognize.',
    available: true,
    rewardCount: 1,
    rewardRarity: 'uncommon',
  },
  {
    slug: 'chefs-secret-stash',
    name: 'Chef\'s Secret Stash',
    description: '1 guaranteed rare item. The chef would kill you if they knew.',
    price: 750,
    category: 'item',
    flavorText: 'Hidden behind a false wall in the kitchen. Protected by a complex lock that was actually just a twist-off cap. Worth every frankfurter.',
    available: true,
    rewardCount: 1,
    rewardRarity: 'rare',
  },
  {
    slug: 'bulk-ketchup-crate',
    name: 'Bulk Ketchup Crate',
    description: '3 random common items. Quantity over quality.',
    price: 150,
    category: 'item',
    flavorText: 'A cardboard box held together with optimism and grease stains. Contains three items that may or may not be ketchup-related. Volume discount!',
    available: true,
    rewardCount: 3,
    rewardRarity: 'common',
  },
]

export function getShopItem(slug: string): ShopItem | undefined {
  return SHOP_CATALOG.find(item => item.slug === slug)
}

export function getShopItemsByCategory(category: ShopItem['category']): ShopItem[] {
  return SHOP_CATALOG.filter(item => item.category === category)
}
