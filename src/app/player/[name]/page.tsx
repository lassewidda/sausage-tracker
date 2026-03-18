import { getHeroCard, insertHeroCard, getPlayerAllTimeStats } from '@/lib/db'
import { generateHeroCard } from '@/lib/claude'
import { HeroCardDisplay } from '@/components/player/HeroCardDisplay'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ name: string }>
}

export default async function PlayerPage({ params }: Props) {
  const { name } = await params
  const playerName = decodeURIComponent(name)

  // Check for existing card
  let card = await getHeroCard(playerName)

  // Get stats to check player exists
  const stats = await getPlayerAllTimeStats(playerName)

  if (stats.mealCount === 0) {
    return (
      <main className="container">
        <Link href="/highscore" style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: '10px',
          color: 'var(--amiga-black)',
          textDecoration: 'underline',
          display: 'inline-block',
          marginBottom: '16px',
        }}>
          ← BACK TO HIGHSCORE
        </Link>
        <div className="amiga-window">
          <div className="amiga-window__titlebar">
            <div className="amiga-window__gadget" />
            <span className="amiga-window__title">PLAYER NOT FOUND</span>
            <div className="amiga-window__gadget" />
          </div>
          <div className="amiga-window__body">
            <div className="amiga-info" style={{ textAlign: 'center' }}>
              NO SAUSAGE DATA FOR &quot;{playerName.toUpperCase()}&quot;
            </div>
          </div>
        </div>
      </main>
    )
  }

  // Generate card if none exists
  if (!card) {
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

    card = await insertHeroCard({
      playerName,
      heroTitle: generated.heroTitle,
      heroType: generated.heroType,
      hp: generated.hp,
      attack: generated.attack,
      defense: generated.defense,
      speed: generated.speed,
      specialMoves: generated.specialMoves,
      weakness: generated.weakness,
      catchphrase: generated.catchphrase,
      flavorText: generated.flavorText,
    })
  }

  return (
    <main className="container">
      <Link href="/highscore" style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '10px',
        color: 'var(--amiga-black)',
        textDecoration: 'underline',
        display: 'inline-block',
        marginBottom: '16px',
      }}>
        ← BACK TO HIGHSCORE
      </Link>
      <HeroCardDisplay card={card} stats={stats} />
    </main>
  )
}
