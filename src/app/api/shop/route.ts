import { NextResponse } from 'next/server'
import { getPlayerBalance, deductBalance, recordShopPurchase, addPlayerItem } from '@/lib/db'
import { SHOP_CATALOG, getShopItem } from '@/lib/shopCatalog'
import { getItemsByRarity } from '@/lib/itemCatalog'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const playerName = (searchParams.get('playerName') || '').toLowerCase()

  const balance = playerName ? await getPlayerBalance(playerName) : 0
  return NextResponse.json({ catalog: SHOP_CATALOG, balance })
}

export async function POST(request: Request) {
  const body = await request.json()
  const playerName = (body.playerName || '').toLowerCase()
  const slug = body.slug as string

  if (!playerName || !slug) {
    return NextResponse.json({ error: 'Missing playerName or slug' }, { status: 400 })
  }

  const item = getShopItem(slug)
  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }

  if (!item.available) {
    return NextResponse.json({ error: 'This item is not available for purchase' }, { status: 400 })
  }

  // Attempt to deduct balance
  const success = await deductBalance(playerName, item.price)
  if (!success) {
    const balance = await getPlayerBalance(playerName)
    return NextResponse.json({
      error: 'Not enough Frankfurters',
      balance,
      needed: item.price,
    }, { status: 402 })
  }

  // Record the purchase
  await recordShopPurchase(playerName, slug, item.price)

  // Grant rewards for item purchases
  const rewards: string[] = []
  if (item.category === 'item' && item.rewardCount && item.rewardRarity) {
    const pool = getItemsByRarity(item.rewardRarity)
    for (let i = 0; i < item.rewardCount; i++) {
      const randomItem = pool[Math.floor(Math.random() * pool.length)]
      if (randomItem) {
        await addPlayerItem(playerName, randomItem.itemKey)
        rewards.push(randomItem.name)
      }
    }
  }

  // Card packs would grant cards — but that requires generating cards
  // which is a heavier operation. For now, just record the purchase.
  if (item.category === 'card_pack') {
    // TODO: Generate random hero cards based on rewardCount/rewardRarity
    rewards.push(`${item.rewardCount} card(s) — card pack opening coming soon!`)
  }

  const newBalance = await getPlayerBalance(playerName)
  return NextResponse.json({ success: true, balance: newBalance, rewards })
}
