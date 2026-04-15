import { NextResponse } from 'next/server'
import { getPlayerGoal, getWeekKey, getGoalStreaks, getAllPlayerGoals, getLeaderboard } from '@/lib/db'
import { sendSlackReply } from '@/lib/slack'
import Anthropic from '@anthropic-ai/sdk'
import postgres from 'postgres'
import { CHANGELOG } from '@/generated/changelog'

export const dynamic = 'force-dynamic'

function getDb() {
  return postgres(process.env.DATABASE_URL!, {
    max: 5,
    ssl: { rejectUnauthorized: false },
    idle_timeout: 20,
    connect_timeout: 10,
  })
}

// Slack sends a challenge on initial setup — must respond with the challenge value
// Also handles app_mention events
export async function POST(request: Request) {
  const body = await request.json()

  // Slack URL verification challenge
  if (body.type === 'url_verification') {
    return NextResponse.json({ challenge: body.challenge })
  }

  // Ignore retries (Slack resends if no 200 within 3s)
  if (request.headers.get('x-slack-retry-num')) {
    return NextResponse.json({ ok: true })
  }

  // Handle app_mention events, DMs, and thread replies
  // Await fully before responding (Vercel kills functions after response)
  // Slack may retry if we take >3s, but we ignore retries above
  const event = body.event
  const eventType = event?.type
  const isAppMention = eventType === 'app_mention'
  const isDM = eventType === 'message' && event?.channel_type === 'im' && !event?.bot_id
  const textLower = (event?.text || '').toLowerCase()
  const mentionsPuck = textLower.includes('puck')
  const isThreadReply = eventType === 'message' && event?.thread_ts && !event?.bot_id && event?.channel_type !== 'im' && mentionsPuck

  if (isAppMention || isDM || isThreadReply) {
    try {
      await handleMention(event)
    } catch (err) {
      console.error('Bot mention error:', err)
    }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}

async function handleMention(event: {
  text: string
  user: string
  channel: string
  ts: string
  thread_ts?: string
}) {
  const { text, user: slackUserId, channel, ts, thread_ts } = event

  // Strip the bot mention from the text
  const question = text.replace(/<@[A-Z0-9]+>/g, '').trim()
  if (!question) {
    await sendSlackReply(channel, thread_ts || ts, "Hey! Ask me anything about the PowerUp exercise challenge and I'll help out 💪")
    return
  }

  // Look up the player by Slack ID
  const sql = getDb()
  let playerContext = ''
  try {
    const weekKey = getWeekKey()

    // Find player name from Slack ID
    const playerRows = await sql`
      SELECT player_name, cardio_target, strength_target, fun_fact FROM player_goals WHERE slack_user_id = ${slackUserId}
    `

    if (playerRows.length > 0) {
      const playerName = playerRows[0].player_name as string
      const cardioTarget = playerRows[0].cardio_target as number
      const strengthTarget = playerRows[0].strength_target as number

      // Get their current week stats
      const weekStats = await sql`
        SELECT
          COUNT(*) FILTER (WHERE exercise_type = 'cardio')::int AS cardio,
          COUNT(*) FILTER (WHERE exercise_type = 'strength')::int AS strength,
          COUNT(*)::int AS total
        FROM meals WHERE player_name = ${playerName} AND week_key = ${weekKey}
      `

      const cardio = weekStats[0]?.cardio as number ?? 0
      const strength = weekStats[0]?.strength as number ?? 0
      const total = weekStats[0]?.total as number ?? 0

      // Get total all-time
      const allTimeStats = await sql`
        SELECT COUNT(*)::int AS total FROM meals WHERE player_name = ${playerName}
      `
      const allTimeTotal = allTimeStats[0]?.total as number ?? 0

      const funFact = playerRows[0].fun_fact as string | null

      playerContext = `
The person asking is: ${playerName.toUpperCase()}
Their weekly goal: ${cardioTarget} cardio + ${strengthTarget} strength sessions
This week so far: ${cardio} cardio, ${strength} strength (${total} total)
Cardio remaining: ${Math.max(0, cardioTarget - cardio)}, Strength remaining: ${Math.max(0, strengthTarget - strength)}
Goal met this week: ${cardio >= cardioTarget && strength >= strengthTarget ? 'YES' : 'NOT YET'}
All-time total workouts: ${allTimeTotal}${funFact ? `\nFun fact: ${funFact}` : ''}`
    }
  } catch {
    // Continue without player context
  } finally {
    await sql.end()
  }

  // Look up mentioned player in the question (supports full names, first names, and aliases from fun_fact)
  let mentionedPlayerContext = ''
  try {
    const sql3 = getDb()
    const allPlayersWithFacts = await sql3`SELECT player_name, cardio_target, strength_target, fun_fact FROM player_goals`
    await sql3.end()

    const questionLower = question.toLowerCase()

    // Build match candidates: full name, first name, and "aka" aliases from fun_fact
    type PlayerMatch = { name: string; playerName: string; cardioTarget: number; strengthTarget: number; funFact: string | null }
    const candidates: PlayerMatch[] = []
    for (const row of allPlayersWithFacts) {
      const playerName = row.player_name as string
      const base = { playerName, cardioTarget: row.cardio_target as number, strengthTarget: row.strength_target as number, funFact: row.fun_fact as string | null }

      // Full name
      candidates.push({ ...base, name: playerName })

      // First name (only if multi-word name to avoid matching common words)
      const firstName = playerName.split(' ')[0]
      if (playerName.includes(' ')) {
        candidates.push({ ...base, name: firstName })
      }

      // Extract "aka X" aliases from fun_fact
      const funFact = row.fun_fact as string | null
      if (funFact) {
        const akaMatch = funFact.match(/[Aa]ka\s+([^,.]+)/g)
        if (akaMatch) {
          for (const m of akaMatch) {
            const alias = m.replace(/[Aa]ka\s+/, '').trim()
            if (alias.length >= 2) candidates.push({ ...base, name: alias.toLowerCase() })
          }
        }
      }
    }

    // Sort by name length descending so longer names match first (e.g. "ed palumbo" before "ed")
    candidates.sort((a, b) => b.name.length - a.name.length)

    // Find first match as a whole word (avoid matching "ed" inside "logged")
    const mentioned = candidates.find(c => {
      const pattern = new RegExp(`\\b${c.name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)
      return pattern.test(questionLower)
    })

    if (mentioned) {
      const sql2 = getDb()
      try {
        const weekKey = getWeekKey()
        const [weekStats, allTimeStats] = await Promise.all([
          sql2`
            SELECT
              COUNT(*) FILTER (WHERE exercise_type = 'cardio')::int AS cardio,
              COUNT(*) FILTER (WHERE exercise_type = 'strength')::int AS strength,
              COUNT(*)::int AS total
            FROM meals WHERE player_name = ${mentioned.playerName} AND week_key = ${weekKey}
          `,
          sql2`SELECT COUNT(*)::int AS total FROM meals WHERE player_name = ${mentioned.playerName}`,
        ])
        await sql2.end()

        const cardio = weekStats[0]?.cardio as number ?? 0
        const strength = weekStats[0]?.strength as number ?? 0
        const total = weekStats[0]?.total as number ?? 0
        const allTime = allTimeStats[0]?.total as number ?? 0

        mentionedPlayerContext = `
ABOUT THE MENTIONED PLAYER (${mentioned.playerName.toUpperCase()}):
Weekly goal: ${mentioned.cardioTarget} cardio + ${mentioned.strengthTarget} strength sessions
This week: ${cardio} cardio, ${strength} strength (${total} total)
Goal met this week: ${cardio >= mentioned.cardioTarget && strength >= mentioned.strengthTarget ? 'YES' : 'NOT YET'}
All-time total workouts: ${allTime}${mentioned.funFact ? `\nFun fact: ${mentioned.funFact}` : ''}`
      } catch {
        await sql2.end().catch(() => {})
      }
    }
  } catch { /* silent */ }

  // Get total participant count
  let totalPlayers = 0
  try {
    const goals = await getAllPlayerGoals()
    totalPlayers = goals.filter(g => g.cardioTarget > 0 || g.strengthTarget > 0).length
  } catch { /* silent */ }

  // Get leaderboard for standings context
  let standingsContext = ''
  try {
    const leaderboard = await getLeaderboard()
    if (leaderboard.allTime.length > 0) {
      const lines = leaderboard.allTime.map(e =>
        `#${e.rank} ${e.playerName.toUpperCase()} — ${e.totalItems} workouts (${e.cardioCount ?? 0} cardio, ${e.strengthCount ?? 0} strength)${e.goalWeeks ? `, ${e.goalWeeks} weekly goals hit` : ''}`
      )
      standingsContext = `\nCURRENT STANDINGS (all-time):\n${lines.join('\n')}`

      // Add this-week standings
      if (leaderboard.thisWeek.length > 0) {
        const weekLines = leaderboard.thisWeek.map(e =>
          `#${e.rank} ${e.playerName.toUpperCase()} — ${e.totalItems} workouts this week`
        )
        standingsContext += `\n\nTHIS WEEK'S STANDINGS:\n${weekLines.join('\n')}`
      }
    }
  } catch { /* silent */ }

  const challengeStarted = Date.now() >= new Date('2026-04-13T00:00:00').getTime()

  const systemPrompt = `You are Puck, a friendly and knowledgeable bot for the PowerUp workplace exercise challenge. Answer questions helpfully and concisely.

THE CHALLENGE:
- PowerUp is a workplace exercise challenge where colleagues log workouts and try to hit personal weekly goals
- Challenge starts April 13th, currently ${totalPlayers} participants
- ${challengeStarted ? 'The challenge is LIVE — workouts are being logged!' : 'The challenge has NOT started yet — no one can log workouts until April 13th. When asked about a player, focus on their goals and ambitions, not their workout stats (which will be zero).'}
- Each participant sets a personal weekly goal (mix of cardio + strength sessions, minimum 3 total per week)
- The week resets every Monday
- The #powerup Slack channel has group updates and shoutouts

LOGGING WORKOUTS:
- Go to the PowerUp app homepage and upload a photo or screenshot (Strava, gym photo, outdoor run, Apple Watch, etc.)
- The app uses AI vision to recognize and describe the workout
- You then choose whether it's "cardio" or "strength"
- On desktop: paste screenshots directly with Cmd+V / Ctrl+V
- On mobile: tap "Paste Screenshot" button or use the file picker
- Supported formats: JPEG, PNG, HEIC, WebP (max 25MB)

WHAT COUNTS AS EXERCISE:
- It's a "gentlemen's rule" — if you want to cheat, that's your own problem, but the intention is that you count sessions where you are actively and intentionally trying to exercise
- Example: exiting the metro two stops early to walk to the office counts. Walking 7 minutes to the grocery store does not
- Rule of thumb: would you be wearing exercise clothes? That's a good indicator
- Brisk walks and bike rides are great, but should be at least 20 minutes to get real health benefits

APP PAGES (always use full URLs when linking):
- Home (https://powerup.eliteprospects.com/) — upload workout photos
- Feed (https://powerup.eliteprospects.com/feed) — see all logged workouts from everyone, with AI descriptions
- Highscore (https://powerup.eliteprospects.com/highscore) — leaderboard sorted by goals achieved, total workouts, or weekly activity. Shows goal streaks
- Progress (https://powerup.eliteprospects.com/progress) — visual calendar grid showing exercise days for every player, great for seeing consistency
- Player profile (https://powerup.eliteprospects.com/player/name) — personal page to set weekly goal, connect Slack, view stats
- Challenge (https://powerup.eliteprospects.com/challenge) — weekly photo bingo challenges + exercise requirements. Find specific items and photograph them
- Shop (https://powerup.eliteprospects.com/shop) — spend "Gains" currency on card packs, battle items, and merch. Gains are earned from logging workouts

BATTLE SYSTEM:
- Pokemon-style card battles between players
- Each week you exercise, you earn a new hero card generated by AI based on your workouts
- Cards have stats: HP, Attack, Defense, Speed, plus 4 special moves
- Cards have types (Fire, Water, Grass, Electric, etc.) with rock-paper-scissors advantages
- To battle: go to https://powerup.eliteprospects.com/battle, create a challenge (open or target a specific player), select 3 cards for your deck
- Turn-based combat: choose a move, guard (halves damage), use an item, or switch cards
- Stronger moves (40+ damage) have lower accuracy (75%), weaker moves never miss
- 12.5% chance of critical hit (1.5x damage)
- Speed determines who goes first each turn
- Win battles to climb the ELO leaderboard (https://powerup.eliteprospects.com/battle/leaderboard)
- 5 starter cards given to everyone so you can battle right away

BATTLE ITEMS:
- Items drop randomly during battles (18% chance per turn)
- Can also buy from the shop
- Types: healing (Protein Bar: 20 HP), attack buffs (Resistance Band: +8 ATK), defense buffs (Foam Roller: +8 DEF), speed buffs (Sweatband: +10 SPD), direct damage (Jump Rope: 12 dmg)
- Use one item per turn instead of attacking

WEEKLY CARD REVEAL:
- Go to https://powerup.eliteprospects.com/battle → click "NEW CARD AVAILABLE" when you've logged workouts that week
- Opens a treasure chest animation, reveals your unique AI-generated card
- One new card per week — the more you exercise, the stronger your cards tend to be

CHALLENGE PLAYER TO BATTLE:
- From the battle lobby, click "CHALLENGE PLAYER" to pick a specific opponent
- They get a Slack DM notification with a direct link
- Or create an "OPEN CHALLENGE" for anyone to join
${playerContext ? `\nABOUT THE PERSON ASKING:\n${playerContext}` : ''}
${mentionedPlayerContext}${standingsContext}

RECENT APP UPDATES (from git history):
${CHANGELOG}

CONTEXT:
- All participants work at EliteProspects.com, the world's biggest ice hockey database
- Feel free to use hockey analogies and references when it fits naturally (e.g. "hat trick" for 3 workouts, "power play" for being ahead of pace, "penalty box" for missing a day). Bonus points for old-school hockey references — think 70s/80s mustaches, bench-clearing brawls, wooden sticks, no helmets, Slap Shot vibes — keep it humorous
- If you don't know the answer to something, suggest they ask Lars (the challenge organizer)

RESPONSE RULES:
- Keep answers short (2-4 sentences max) unless they ask for detailed explanations
- If someone asks "how does X work" for a complex feature like battles, you can go up to 4-5 sentences
- Be friendly and casual
- If they ask about their progress, reference their actual stats
- If someone asks about the highscore, leaderboard, or standings, use the CURRENT STANDINGS data. Personalize it — mention their rank, how close they are to the person above them, and motivate them to climb (e.g. "only 2 more workouts to overtake Johan in 5th!")
- If they ask about another player ("who is X", "how is X doing"), use the MENTIONED PLAYER data to describe that person's goals and progress in a fun way. If a fun fact is available, weave it into the response naturally (e.g. if they're a former hockey goalie, make a save joke)
- If someone asks "what's new", "what changed", or about recent updates, summarize the RECENT APP UPDATES in a user-friendly way
- If you don't know something specific, say so honestly — and point them to Lars
- Do NOT use markdown formatting — just plain text
- Use 1 emoji max per response`

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: 'user', content: question }],
    })

    const block = message.content.find(b => b.type === 'text')
    let reply = block?.type === 'text' ? block.text.trim() : "Sorry, I couldn't process that. Try asking again!"

    // Convert #powerup mentions to clickable Slack channel links
    reply = reply.replace(/#powerup/gi, '<#C0AQ2VASTBR>')

    await sendSlackReply(channel, thread_ts || ts, reply)

    // Log the interaction
    logBotMessage(slackUserId, question, reply).catch(() => {})
  } catch (err) {
    console.error('Claude API error in bot:', err)
    await sendSlackReply(channel, thread_ts || ts, "Oops, something went wrong on my end. Try again in a moment!")
  }
}

async function logBotMessage(slackUserId: string, question: string, reply: string) {
  const sql = getDb()
  try {
    await sql`
      INSERT INTO bot_messages (slack_user_id, question, reply)
      VALUES (${slackUserId}, ${question}, ${reply})
    `
  } finally {
    await sql.end()
  }
}
