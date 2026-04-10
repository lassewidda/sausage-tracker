import { NextResponse } from 'next/server'
import { getPlayerGoal, getWeekKey, getGoalStreaks, getAllPlayerGoals } from '@/lib/db'
import { sendSlackReply } from '@/lib/slack'
import Anthropic from '@anthropic-ai/sdk'
import postgres from 'postgres'

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
  const isThreadReply = eventType === 'message' && event?.thread_ts && !event?.bot_id && event?.channel_type !== 'im'

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

  // Look up mentioned player in the question
  let mentionedPlayerContext = ''
  try {
    const allGoals = await getAllPlayerGoals()
    const questionLower = question.toLowerCase()
    // Sort by name length descending so "johan ejermark" matches before "johan"
    const sortedPlayers = [...allGoals].sort((a, b) => b.playerName.length - a.playerName.length)
    const mentioned = sortedPlayers.find(g => questionLower.includes(g.playerName.toLowerCase()))

    if (mentioned) {
      const sql2 = getDb()
      try {
        const weekKey = getWeekKey()
        const [weekStats, allTimeStats, funFactRows] = await Promise.all([
          sql2`
            SELECT
              COUNT(*) FILTER (WHERE exercise_type = 'cardio')::int AS cardio,
              COUNT(*) FILTER (WHERE exercise_type = 'strength')::int AS strength,
              COUNT(*)::int AS total
            FROM meals WHERE player_name = ${mentioned.playerName} AND week_key = ${weekKey}
          `,
          sql2`SELECT COUNT(*)::int AS total FROM meals WHERE player_name = ${mentioned.playerName}`,
          sql2`SELECT fun_fact FROM player_goals WHERE player_name = ${mentioned.playerName}`,
        ])
        await sql2.end()

        const cardio = weekStats[0]?.cardio as number ?? 0
        const strength = weekStats[0]?.strength as number ?? 0
        const total = weekStats[0]?.total as number ?? 0
        const allTime = allTimeStats[0]?.total as number ?? 0
        const funFact = funFactRows[0]?.fun_fact as string | null

        mentionedPlayerContext = `
ABOUT THE MENTIONED PLAYER (${mentioned.playerName.toUpperCase()}):
Weekly goal: ${mentioned.cardioTarget} cardio + ${mentioned.strengthTarget} strength sessions
This week: ${cardio} cardio, ${strength} strength (${total} total)
Goal met this week: ${cardio >= mentioned.cardioTarget && strength >= mentioned.strengthTarget ? 'YES' : 'NOT YET'}
All-time total workouts: ${allTime}${funFact ? `\nFun fact: ${funFact}` : ''}`
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

APP PAGES:
- Home (/) — upload workout photos
- Feed (/feed) — see all logged workouts from everyone, with AI descriptions
- Highscore (/highscore) — leaderboard sorted by goals achieved, total workouts, or weekly activity. Shows goal streaks
- Progress (/progress) — visual calendar grid showing exercise days for every player, great for seeing consistency
- Player profile (/player/name) — personal page to set weekly goal, connect Slack, view stats
- Challenge (/challenge) — weekly photo bingo challenges + exercise requirements. Find specific items and photograph them
- Shop (/shop) — spend "Gains" currency on card packs, battle items, and merch. Gains are earned from logging workouts

BATTLE SYSTEM:
- Pokemon-style card battles between players
- Each week you exercise, you earn a new hero card generated by AI based on your workouts
- Cards have stats: HP, Attack, Defense, Speed, plus 4 special moves
- Cards have types (Fire, Water, Grass, Electric, etc.) with rock-paper-scissors advantages
- To battle: go to /battle, create a challenge (open or target a specific player), select 3 cards for your deck
- Turn-based combat: choose a move, guard (halves damage), use an item, or switch cards
- Stronger moves (40+ damage) have lower accuracy (75%), weaker moves never miss
- 12.5% chance of critical hit (1.5x damage)
- Speed determines who goes first each turn
- Win battles to climb the ELO leaderboard (/battle/leaderboard)
- 5 starter cards given to everyone so you can battle right away

BATTLE ITEMS:
- Items drop randomly during battles (18% chance per turn)
- Can also buy from the shop
- Types: healing (Protein Bar: 20 HP), attack buffs (Resistance Band: +8 ATK), defense buffs (Foam Roller: +8 DEF), speed buffs (Sweatband: +10 SPD), direct damage (Jump Rope: 12 dmg)
- Use one item per turn instead of attacking

WEEKLY CARD REVEAL:
- Go to /battle → click "NEW CARD AVAILABLE" when you've logged workouts that week
- Opens a treasure chest animation, reveals your unique AI-generated card
- One new card per week — the more you exercise, the stronger your cards tend to be

CHALLENGE PLAYER TO BATTLE:
- From the battle lobby, click "CHALLENGE PLAYER" to pick a specific opponent
- They get a Slack DM notification with a direct link
- Or create an "OPEN CHALLENGE" for anyone to join
${playerContext ? `\nABOUT THE PERSON ASKING:\n${playerContext}` : ''}
${mentionedPlayerContext}
CONTEXT:
- All participants work at EliteProspects.com, the world's biggest ice hockey database
- Feel free to use hockey analogies and references when it fits naturally (e.g. "hat trick" for 3 workouts, "power play" for being ahead of pace, "penalty box" for missing a day). Bonus points for old-school hockey references — think 70s/80s mustaches, bench-clearing brawls, wooden sticks, no helmets, Slap Shot vibes — keep it humorous
- If you don't know the answer to something, suggest they ask Lars (the challenge organizer)

RESPONSE RULES:
- Keep answers short (2-4 sentences max) unless they ask for detailed explanations
- If someone asks "how does X work" for a complex feature like battles, you can go up to 4-5 sentences
- Be friendly and casual
- If they ask about their progress, reference their actual stats
- If they ask about another player ("who is X", "how is X doing"), use the MENTIONED PLAYER data to describe that person's goals and progress in a fun way. If a fun fact is available, weave it into the response naturally (e.g. if they're a former hockey goalie, make a save joke)
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
