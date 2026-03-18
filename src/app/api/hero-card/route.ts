import { NextResponse } from 'next/server'
import { getHeroCard, insertHeroCard, getPlayerAllTimeStats } from '@/lib/db'
import { generateHeroCard } from '@/lib/claude'

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

export async function POST(request: Request) {
  const { playerName } = await request.json()

  if (!playerName || typeof playerName !== 'string') {
    return NextResponse.json({ error: 'Missing playerName' }, { status: 400 })
  }

  // Check existing card and cooldown
  const existing = await getHeroCard(playerName)
  if (existing) {
    const age = Date.now() - new Date(existing.createdAt).getTime()
    if (age < ONE_WEEK_MS) {
      const nextDate = new Date(new Date(existing.createdAt).getTime() + ONE_WEEK_MS)
      return NextResponse.json({
        error: 'Too soon',
        nextRegenerateAt: nextDate.toISOString(),
      }, { status: 429 })
    }
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
  })

  return NextResponse.json(card)
}
