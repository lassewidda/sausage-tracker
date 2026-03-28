import { getHeroCard, insertHeroCard, getPlayerAllTimeStats, getPlayerProfileData, getWeekKey } from '@/lib/db'
import { generateHeroCard } from '@/lib/claude'
import { HeroCardDisplay } from '@/components/player/HeroCardDisplay'
import { RegenerateButton } from '@/components/player/RegenerateButton'
import { Window } from '@/components/amiga/Window'
import Link from 'next/link'
import type { HeroCard } from '@/types'
import theme from '@/theme'

export const dynamic = 'force-dynamic'

const IS_EXERCISE = process.env.NEXT_PUBLIC_THEME === 'exercise'

interface Props {
  params: { name: string }
}

function getSubtitle(stats: { mealCount: number; cardioCount: number; strengthCount: number; chainLength: number; activeWeeks: number }) {
  if (IS_EXERCISE) {
    if (stats.chainLength >= 10) return 'UNSTOPPABLE FITNESS MACHINE'
    if (stats.mealCount >= 100) return 'LEGENDARY GYM RAT'
    if (stats.cardioCount > stats.strengthCount * 2) return 'CARDIO DEMON'
    if (stats.strengthCount > stats.cardioCount * 2) return 'IRON PUMPER'
    if (stats.chainLength >= 4) return 'STREAK WARRIOR'
    if (stats.mealCount >= 20) return 'DEDICATED ATHLETE'
    if (stats.activeWeeks >= 3) return 'RISING CONTENDER'
    return 'FRESH RECRUIT'
  }
  if (stats.chainLength >= 10) return 'SAUSAGE OVERLORD'
  if (stats.mealCount >= 100) return 'LEGENDARY MEAT MASTER'
  if (stats.mealCount >= 20) return 'SEASONED SAUSAGE VETERAN'
  if (stats.chainLength >= 4) return 'STREAK KEEPER'
  return 'SAUSAGE APPRENTICE'
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

function exerciseTypeBadge(type: string | null): { label: string; color: string } {
  if (type === 'cardio') return { label: 'CARDIO', color: '#FF4444' }
  if (type === 'strength') return { label: 'STRENGTH', color: '#4488FF' }
  return { label: IS_EXERCISE ? 'EXERCISE' : 'MEAL', color: '#FF8800' }
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
        <Window title="PLAYER NOT FOUND">
          <div className="amiga-info" style={{ textAlign: 'center' }}>
            NO {IS_EXERCISE ? 'EXERCISE' : 'SAUSAGE'} DATA FOR &quot;{playerName.toUpperCase()}&quot;
          </div>
        </Window>
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
        heroTitle: generated.heroTitle || (IS_EXERCISE ? 'The Fitness Warrior' : 'The Sausage Warrior'),
        heroType: generated.heroType || 'FIRE/MEAT',
        hp: generated.hp || 100,
        attack: generated.attack || 50,
        defense: generated.defense || 50,
        speed: generated.speed || 50,
        specialMoves: Array.isArray(generated.specialMoves) ? generated.specialMoves : ['Power Slam (40)', 'Quick Strike (30)', 'Mega Burst (50)'],
        weakness: generated.weakness || 'Rest days',
        catchphrase: generated.catchphrase || 'No pain no gain!',
        flavorText: generated.flavorText || 'A mighty warrior of the fitness arts.',
        weekKey: getWeekKey(),
      })
    } catch (err) {
      console.error('Hero card generation failed:', err)
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
          <Window title="ERROR">
            <div className="amiga-info" style={{ textAlign: 'center' }}>
              HERO CARD GENERATION FAILED FOR {playerName.toUpperCase()}. TRY AGAIN LATER.
            </div>
          </Window>
        </main>
      )
    }
  }

  // Fetch profile data
  const profile = await getPlayerProfileData(playerName)
  const subtitle = getSubtitle(stats)

  const statCards: { value: string; label: string; accent: string }[] = [
    { value: `${stats.mealCount}`, label: IS_EXERCISE ? 'WORKOUTS' : 'MEALS', accent: '#FF8800' },
    { value: `${stats.cardioCount}`, label: 'CARDIO', accent: '#FF4444' },
    { value: `${stats.strengthCount}`, label: 'STRENGTH', accent: '#4488FF' },
    { value: `${stats.chainLength}w`, label: 'STREAK', accent: '#44FF44' },
    { value: `${profile.challengesCompleted}`, label: 'CHALLENGES', accent: '#FFD700' },
    { value: profile.rank > 0 ? `#${profile.rank}` : '-', label: `OF ${profile.totalPlayers}`, accent: '#FF44FF' },
  ]

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

      {/* Header */}
      <Window title={`PLAYER PROFILE: ${playerName.toUpperCase()}`}>
        <div style={{ textAlign: 'center', padding: '16px 8px' }}>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '20px',
            color: 'var(--amiga-orange, #FF8800)',
            textShadow: '2px 2px 0 #000',
            marginBottom: '8px',
            letterSpacing: '2px',
          }}>
            {playerName.toUpperCase()}
          </div>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            color: '#AAA',
            letterSpacing: '1px',
          }}>
            {subtitle}
          </div>
        </div>
      </Window>

      {/* Stats Grid */}
      <Window title="STATS">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          padding: '8px',
        }}>
          {statCards.map((s, i) => (
            <div key={i} style={{
              background: '#1a1a2e',
              border: `2px solid ${s.accent}`,
              borderRadius: '4px',
              padding: '12px 8px',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '18px',
                color: s.accent,
                textShadow: `0 0 8px ${s.accent}44`,
                marginBottom: '6px',
              }}>
                {s.value}
              </div>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '7px',
                color: '#888',
                letterSpacing: '1px',
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </Window>

      {/* Recent Activity */}
      <Window title="RECENT ACTIVITY">
        {profile.recentActivity.length === 0 ? (
          <div className="amiga-info" style={{ textAlign: 'center' }}>
            NO ACTIVITY YET
          </div>
        ) : (
          <div style={{ padding: '4px' }}>
            {profile.recentActivity.map((a) => {
              const badge = exerciseTypeBadge(a.exerciseType)
              const desc = a.description
                ? (a.description.length > 60 ? a.description.slice(0, 57) + '...' : a.description)
                : (IS_EXERCISE ? 'Exercise session' : 'Meal logged')
              return (
                <Link key={a.id} href={`/feed?week=${encodeURIComponent(a.weekKey)}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderBottom: '1px solid #333',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '8px',
                  textDecoration: 'none',
                }}>
                  <span style={{
                    background: badge.color,
                    color: '#000',
                    padding: '2px 6px',
                    fontSize: '7px',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    minWidth: '60px',
                    textAlign: 'center',
                  }}>
                    {badge.label}
                  </span>
                  <span style={{ color: '#CCC', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {desc}
                  </span>
                  <span style={{ color: '#666', whiteSpace: 'nowrap', fontSize: '7px' }}>
                    {timeAgo(a.createdAt)}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </Window>

      {/* Hero Card Collection */}
      <Window title={`HERO CARDS (${profile.cards.length})`}>
        {card && (
          <div style={{ marginBottom: '16px' }}>
            <HeroCardDisplay card={card} stats={stats} />
            <RegenerateButton playerName={playerName} cardCreatedAt={card.createdAt} />
          </div>
        )}
        {profile.cards.length > 1 && (
          <div style={{ padding: '8px' }}>
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '9px',
              color: '#FF8800',
              marginBottom: '8px',
            }}>
              COLLECTION
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '8px',
            }}>
              {profile.cards
                .filter(c => c.id !== card?.id)
                .map((c: HeroCard) => (
                  <CompactCard key={c.id} card={c} />
                ))}
            </div>
          </div>
        )}
      </Window>

      {/* Battle Record */}
      <Window title="BATTLE RECORD">
        <div style={{ padding: '16px', textAlign: 'center' }}>
          {profile.battleStats.wins === 0 && profile.battleStats.losses === 0 ? (
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              color: '#666',
            }}>
              NO BATTLES YET
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '20px',
                  color: '#44FF44',
                }}>
                  {profile.battleStats.wins}
                </div>
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color: '#888',
                }}>
                  WINS
                </div>
              </div>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '14px',
                color: '#666',
              }}>
                -
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '20px',
                  color: '#FF4444',
                }}>
                  {profile.battleStats.losses}
                </div>
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color: '#888',
                }}>
                  LOSSES
                </div>
              </div>
              <div style={{
                borderLeft: '2px solid #333',
                paddingLeft: '24px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '20px',
                  color: '#FFD700',
                }}>
                  {profile.battleStats.eloRating}
                </div>
                <div style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '7px',
                  color: '#888',
                }}>
                  ELO
                </div>
              </div>
            </div>
          )}
        </div>
      </Window>
    </main>
  )
}

function CompactCard({ card }: { card: HeroCard }) {
  const types = card.heroType.split('/')
  return (
    <div style={{
      background: '#1a1a2e',
      border: '2px solid #FF8800',
      borderRadius: '4px',
      padding: '8px',
      fontFamily: 'var(--font-pixel)',
    }}>
      <div style={{
        fontSize: '8px',
        color: '#FF8800',
        marginBottom: '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {card.heroTitle.toUpperCase()}
      </div>
      <div style={{
        fontSize: '7px',
        color: '#888',
        marginBottom: '6px',
      }}>
        {types.join(' / ')}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2px',
        fontSize: '7px',
      }}>
        <span style={{ color: '#FF4444' }}>HP {card.hp}</span>
        <span style={{ color: '#FF8800' }}>ATK {card.attack}</span>
        <span style={{ color: '#4488FF' }}>DEF {card.defense}</span>
        <span style={{ color: '#44FF44' }}>SPD {card.speed}</span>
      </div>
      <div style={{
        fontSize: '6px',
        color: '#555',
        marginTop: '4px',
      }}>
        {card.weekKey}
      </div>
    </div>
  )
}
