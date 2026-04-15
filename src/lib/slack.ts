const POWERUP_CHANNEL = 'C0AQ2VASTBR'

async function postSlack(channel: string, payload: Record<string, unknown>): Promise<{ ok: boolean; error?: string; ts?: string }> {
  const token = process.env.SLACK_BOT_TOKEN
  if (!token) return { ok: false, error: 'SLACK_BOT_TOKEN not set' }
  if (!channel) return { ok: false, error: 'No channel' }

  try {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ channel, ...payload }),
    })
    const data = await res.json()
    if (data.ok) return { ok: true, ts: data.ts }
    console.error('Slack API error:', data.error, data)
    return { ok: false, error: data.error || 'Unknown Slack error' }
  } catch (err) {
    console.error('Slack fetch error:', err)
    return { ok: false, error: 'Network error' }
  }
}

export async function sendSlackDM(slackUserId: string, message: string): Promise<{ ok: boolean; error?: string }> {
  return postSlack(slackUserId, { text: message })
}

export async function sendSlackChannel(message: string): Promise<{ ok: boolean; error?: string; ts?: string }> {
  return postSlack(POWERUP_CHANNEL, { text: message })
}

export async function sendSlackReply(channel: string, threadTs: string, message: string): Promise<{ ok: boolean; error?: string }> {
  return postSlack(channel, { text: message, thread_ts: threadTs, unfurl_links: false, unfurl_media: false })
}

export async function sendSlackChannelWithImage(message: string, imageUrl: string, altText: string): Promise<{ ok: boolean; error?: string }> {
  return postSlack(POWERUP_CHANNEL, {
    text: message,
    blocks: [
      {
        type: 'section',
        text: { type: 'mrkdwn', text: message },
      },
      {
        type: 'image',
        image_url: imageUrl,
        alt_text: altText,
      },
    ],
  })
}

export async function sendWorkoutToThread(playerName: string, description: string, exerciseType: string, mealId: string): Promise<void> {
  const postgres = (await import('postgres')).default
  const sql = postgres(process.env.DATABASE_URL!, { ssl: { rejectUnauthorized: false }, idle_timeout: 20, connect_timeout: 10 })

  try {
    // Date key in Stockholm timezone
    const dateKey = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' })
    const configKey = `slack_thread_${dateKey}`

    // Check if we already have a thread for today
    const existing = await sql`SELECT value FROM app_config WHERE key = ${configKey}`
    let threadTs: string

    if (existing.length > 0) {
      threadTs = existing[0].value
    } else {
      // Create the daily thread header
      const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Europe/Stockholm' })
      const dateLabel = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'Europe/Stockholm' })
      const header = `💪 ${dayName} ${dateLabel} — workout log`
      const result = await sendSlackChannel(header)
      if (!result.ok || !result.ts) return
      threadTs = result.ts

      // Store the thread ts
      await sql`INSERT INTO app_config (key, value) VALUES (${configKey}, ${threadTs}) ON CONFLICT (key) DO UPDATE SET value = ${threadTs}`
    }

    // Pick emoji based on exercise type
    const emoji = exerciseType === 'strength' ? '🏋️' : '🏃'

    // Shorten description to ~120 chars for the thread reply
    const shortDesc = description && description.length > 120 ? description.slice(0, 117) + '...' : description

    const feedUrl = `https://powerup.eliteprospects.com/player/${encodeURIComponent(playerName.toLowerCase())}`
    const message = `${emoji} <${feedUrl}|${playerName.toUpperCase()}> — ${shortDesc || exerciseType} (${exerciseType})`

    await sendSlackReply(POWERUP_CHANNEL, threadTs, message)
  } catch (err) {
    console.error('Workout thread error:', err)
  } finally {
    await sql.end()
  }
}
