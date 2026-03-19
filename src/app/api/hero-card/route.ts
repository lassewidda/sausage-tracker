import { NextResponse } from 'next/server'
import { getHeroCard, getPlayerDeck, insertHeroCard, getPlayerAllTimeStats, getWeekKey } from '@/lib/db'
import { generateHeroCard } from '@/lib/claude'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const playerName = (searchParams.get('playerName') || '').toLowerCase()
  if (!playerName) return NextResponse.json({ error: 'Missing playerName' }, { status: 400 })

  const deck = await getPlayerDeck(playerName)
  return NextResponse.json(deck)
}

export async function POST(request: Request) {
  const body = await request.json()
  const playerName = (body.playerName || '').toLowerCase()

  if (!playerName || typeof playerName !== 'string') {
    return NextResponse.json({ error: 'Missing playerName' }, { status: 400 })
  }

  const weekKey = getWeekKey()

  // Check if card already exists for this week
  const existing = await getHeroCard(playerName, weekKey)
  if (existing) {
    return NextResponse.json({
      error: 'Already generated this week',
      card: existing,
    }, { status: 429 })
  }

  const stats = await getPlayerAllTimeStats(playerName)
  if (stats.mealCount === 0) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 })
  }

  const generated = await generateHeroCard({
    playerName,
    totalSausages: stats.totalSausages,
    totalGrams: stats.totalGrams,
    mealCount: stats.mealCount,
    maxInOneMeal: stats.maxInOneMeal,
    activeWeeks: stats.activeWeeks,
    chainLength: stats.chainLength,
    recentMeals: stats.recentMeals,
  })

  const card = await insertHeroCard({
    playerName,
    heroTitle: generated.heroTitle || 'The Sausage Warrior',
    heroType: generated.heroType || 'FIRE/MEAT',
    hp: generated.hp || 100,
    attack: generated.attack || 50,
    defense: generated.defense || 50,
    speed: generated.speed || 50,
    specialMoves: Array.isArray(generated.specialMoves) ? generated.specialMoves : ['Sausage Slam (40)', 'Mustard Blast (30)', 'Link Storm (50)'],
    weakness: generated.weakness || 'Vegetarian restaurants',
    catchphrase: generated.catchphrase || 'Fear the sausage!',
    flavorText: generated.flavorText || 'A mighty warrior of the cylindrical meat arts.',
    weekKey,
  })

  return NextResponse.json(card)
}
