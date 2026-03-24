import { getHeroCard, insertHeroCard, getPlayerAllTimeStats, getWeekKey } from '@/lib/db'
import { generateHeroCard } from '@/lib/claude'
import { HeroCardDisplay } from '@/components/player/HeroCardDisplay'
import { RegenerateButton } from '@/components/player/RegenerateButton'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Props {
  params: { name: string }
}

export default async function PlayerPage({ params }: Props) {
  const playerName = decodeURIComponent(params.name)

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
    try {
      const generated = await generateHeroCard({
        playerName,
        totalItems: stats.totalItems,
        totalGrams: stats.totalGrams,
        mealCount: stats.mealCount,
        maxInOneMeal: stats.maxInOneMeal,
        activeWeeks: stats.activeWeeks,
        chainLength: stats.chainLength,
        recentMeals: stats.recentMeals,
      })

      card = await insertHeroCard({
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
        weekKey: getWeekKey(),
      })
    } catch (err) {
      console.error('Hero card generation failed:', err)
      // Return a fallback page instead of crashing
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
              <span className="amiga-window__title">ERROR</span>
              <div className="amiga-window__gadget" />
            </div>
            <div className="amiga-window__body">
              <div className="amiga-info" style={{ textAlign: 'center' }}>
                HERO CARD GENERATION FAILED FOR {playerName.toUpperCase()}. TRY AGAIN LATER.
              </div>
            </div>
          </div>
        </main>
      )
    }
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
      <RegenerateButton playerName={playerName} cardCreatedAt={card.createdAt} />
    </main>
  )
}
