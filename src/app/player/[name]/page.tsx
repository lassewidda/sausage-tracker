import { getHeroCard, insertHeroCard, getPlayerAllTimeStats, getPlayerProfileData, getWeekKey } from '@/lib/db'
import { generateHeroCard } from '@/lib/claude'
import { RegenerateButton } from '@/components/player/RegenerateButton'
import { ChangeNameButton } from '@/components/player/ChangeNameButton'
import { GoalEditor } from '@/components/player/GoalEditor'
import { SlackConnector } from '@/components/player/SlackConnector'
import { CardCollection } from '@/components/player/CardCollection'
import { PhotoGrid } from '@/components/player/PhotoGrid'
import { SlackStatus } from '@/components/player/SlackStatus'
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
        <Window title={`WELCOME, ${playerName.toUpperCase()}!`}>
          <div style={{ textAlign: 'center', padding: '24px 16px' }}>
            <div style={{
              fontSize: '40px',
              marginBottom: '12px',
            }}>
              🍄
            </div>
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '18px',
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
              color: 'var(--amiga-dark-grey)',
              marginBottom: '4px',
            }}>
              {IS_EXERCISE ? 'FRESH RECRUIT' : 'SAUSAGE APPRENTICE'}
            </div>
          </div>
        </Window>

        {IS_EXERCISE && (
          <Window title="GET READY">
            <div style={{ padding: '16px', fontFamily: 'var(--font-pixel)', fontSize: '8px', lineHeight: '2.2', color: 'var(--amiga-black)' }}>
              <div style={{ marginBottom: '12px', textAlign: 'center', fontSize: '9px', color: 'var(--crt-amber)' }}>
                WHILE YOU WAIT, SET UP YOUR PROFILE:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <div>1. SET YOUR WEEKLY GOAL BELOW</div>
                <div>2. CONNECT YOUR SLACK ID FOR NOTIFICATIONS</div>
                <div>3. WHEN THE CHALLENGE STARTS, LOG YOUR FIRST WORKOUT!</div>
              </div>
            </div>
          </Window>
        )}

        <GoalEditor profileName={playerName} />

        {IS_EXERCISE && (
          <Window title="CONNECT SLACK">
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '8px',
                color: 'var(--amiga-black)',
                marginBottom: '12px',
                lineHeight: '2',
              }}>
                GET NOTIFIED WHEN IT&apos;S YOUR TURN IN BATTLE
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <SlackStatus profileName={playerName} />
              </div>
            </div>
          </Window>
        )}

        <ChangeNameButton profileName={playerName} />
      </main>
    )
  }

  // Generate card if none exists — but only after the first week (activeWeeks > 0 means they have data from a past week)
  if (!card && stats.activeWeeks > 1) {
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

  const statCards: { value: string; label: string; accent: string }[] = IS_EXERCISE
    ? [
        { value: `${stats.mealCount}`, label: 'WORKOUTS', accent: '#FF8800' },
        { value: `${stats.cardioCount}`, label: 'CARDIO', accent: '#FF4444' },
        { value: `${stats.strengthCount}`, label: 'STRENGTH', accent: '#4488FF' },
        { value: `${stats.chainLength}w`, label: 'STREAK', accent: '#44FF44' },
        { value: `${profile.challengesCompleted}`, label: 'CHALLENGES', accent: '#FFD700' },
        { value: profile.rank > 0 ? `#${profile.rank}` : '-', label: `OF ${profile.totalPlayers}`, accent: '#FF44FF' },
      ]
    : [
        { value: `${stats.mealCount}`, label: 'MEALS', accent: '#FF8800' },
        { value: `${stats.totalItems}`, label: 'SAUSAGES', accent: '#FF4444' },
        { value: `${stats.chainLength}w`, label: 'STREAK', accent: '#44FF44' },
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '8px',
          }}>
            <span style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '20px',
              color: 'var(--amiga-orange, #FF8800)',
              textShadow: '2px 2px 0 #000',
              letterSpacing: '2px',
            }}>
              {playerName.toUpperCase()}
            </span>
            <SlackStatus profileName={playerName} />
          </div>
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            color: 'var(--amiga-dark-grey)',
            letterSpacing: '1px',
          }}>
            {subtitle}
          </div>
        </div>
      </Window>
      <ChangeNameButton profileName={playerName} />

      {/* Personal Goals (exercise) / Slack connector (sausage) */}
      {IS_EXERCISE ? <GoalEditor profileName={playerName} /> : <SlackConnector profileName={playerName} />}

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
              background: 'var(--amiga-black)',
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
                color: 'var(--amiga-white)',
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
              const badge = IS_EXERCISE
                ? exerciseTypeBadge(a.exerciseType)
                : { label: `${a.itemCount} ${theme.strings.itemEmoji}`, color: '#FF8800' }
              const desc = a.description
                ? (a.description.length > 60 ? a.description.slice(0, 57) + '...' : a.description)
                : (IS_EXERCISE ? 'Exercise session' : 'Meal logged')
              return (
                <Link key={a.id} href={`/feed?week=${encodeURIComponent(a.weekKey)}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderBottom: '1px solid var(--bevel-shadow)',
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
                  <span style={{ color: 'var(--amiga-black)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {desc}
                  </span>
                  <span style={{ color: 'var(--amiga-dark-grey)', whiteSpace: 'nowrap', fontSize: '7px' }}>
                    {timeAgo(a.createdAt)}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </Window>

      {/* Photo Grid */}
      {profile.photos.length > 0 && (
        <Window title={`PHOTOS (${profile.photos.length})`}>
          <PhotoGrid photos={profile.photos} />
        </Window>
      )}

      {/* Hero Card Collection */}
      <Window title={`HERO CARDS (${profile.cards.length})`}>
        {card && (
          <div style={{ textAlign: 'center', padding: '4px 0' }}>
            <RegenerateButton playerName={playerName} cardCreatedAt={card.createdAt} />
          </div>
        )}
        {profile.cards.length === 0 ? (
          <div style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            color: 'var(--amiga-dark-grey)',
            textAlign: 'center',
            padding: '16px',
          }}>
            HERO CARDS ARE GENERATED AFTER YOUR FIRST WEEK OF TRAINING. KEEP LOGGING!
          </div>
        ) : (
          <CardCollection cards={profile.cards} />
        )}
      </Window>

      {/* Battle Record */}
      <Window title="BATTLE RECORD">
        <div style={{ padding: '16px', textAlign: 'center' }}>
          {profile.battleStats.wins === 0 && profile.battleStats.losses === 0 ? (
            <div style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              color: 'var(--amiga-dark-grey)',
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
                  color: 'var(--amiga-dark-grey)',
                }}>
                  WINS
                </div>
              </div>
              <div style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '14px',
                color: 'var(--amiga-dark-grey)',
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
                  color: 'var(--amiga-dark-grey)',
                }}>
                  LOSSES
                </div>
              </div>
              <div style={{
                borderLeft: '2px solid var(--bevel-shadow)',
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
                  color: 'var(--amiga-dark-grey)',
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

