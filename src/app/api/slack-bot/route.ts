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

  // Handle app_mention events and DMs
  // Await fully before responding (Vercel kills functions after response)
  // Slack may retry if we take >3s, but we ignore retries above
  const eventType = body.event?.type
  if (eventType === 'app_mention' || (eventType === 'message' && body.event?.channel_type === 'im' && !body.event?.bot_id)) {
    try {
      await handleMention(body.event)
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
      SELECT player_name, cardio_target, strength_target FROM player_goals WHERE slack_user_id = ${slackUserId}
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

      playerContext = `
The person asking is: ${playerName.toUpperCase()}
Their weekly goal: ${cardioTarget} cardio + ${strengthTarget} strength sessions
This week so far: ${cardio} cardio, ${strength} strength (${total} total)
Cardio remaining: ${Math.max(0, cardioTarget - cardio)}, Strength remaining: ${Math.max(0, strengthTarget - strength)}
Goal met this week: ${cardio >= cardioTarget && strength >= strengthTarget ? 'YES' : 'NOT YET'}
All-time total workouts: ${allTimeTotal}`
    }
  } catch {
    // Continue without player context
  } finally {
    await sql.end()
  }

  // Get total participant count
  let totalPlayers = 0
  try {
    const goals = await getAllPlayerGoals()
    totalPlayers = goals.filter(g => g.cardioTarget > 0 || g.strengthTarget > 0).length
  } catch { /* silent */ }

  const systemPrompt = `You are Puck, a friendly and knowledgeable bot for the PowerUp workplace exercise challenge. Answer questions helpfully and concisely.

KEY FACTS ABOUT THE CHALLENGE:
- PowerUp is a workplace exercise challenge where colleagues log workouts and try to hit personal weekly goals
- Participants set a personal weekly goal (mix of cardio + strength sessions, minimum 3 total per week)
- To log a workout: go to the PowerUp app, upload a photo or screenshot of your workout (e.g. Strava screenshot, gym photo, outdoor run photo)
- The app uses AI vision to recognize and describe the workout
- You choose whether it's "cardio" or "strength" when logging
- You can paste screenshots directly (Cmd+V on desktop, or tap "Paste Screenshot" on mobile)
- The week resets every Monday
- The #powerup Slack channel has group updates and shoutouts
- The highscore page shows who's hitting their goals
- The challenge starts April 13th
- There are currently ${totalPlayers} participants
- Each participant has a personal profile page where they can edit their weekly goal and connect Slack
${playerContext ? `\nABOUT THE PERSON ASKING:\n${playerContext}` : ''}

CONTEXT:
- All participants work at EliteProspects.com, the world's biggest ice hockey database
- Feel free to use hockey analogies and references when it fits naturally (e.g. "hat trick" for 3 workouts, "power play" for being ahead of pace, "penalty box" for missing a day)
- If you don't know the answer to something, suggest they ask Lars (the challenge organizer)

RESPONSE RULES:
- Keep answers short (2-4 sentences max)
- Be friendly and casual
- If they ask about their progress, reference their actual stats
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
    const reply = block?.type === 'text' ? block.text.trim() : "Sorry, I couldn't process that. Try asking again!"

    await sendSlackReply(channel, thread_ts || ts, reply)
  } catch (err) {
    console.error('Claude API error in bot:', err)
    await sendSlackReply(channel, thread_ts || ts, "Oops, something went wrong on my end. Try again in a moment!")
  }
}
