const POWERUP_CHANNEL = 'C0AQ2VASTBR'

async function postSlack(channel: string, payload: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
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
    if (data.ok) return { ok: true }
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

export async function sendSlackChannel(message: string): Promise<{ ok: boolean; error?: string }> {
  return postSlack(POWERUP_CHANNEL, { text: message })
}

export async function sendSlackReply(channel: string, threadTs: string, message: string): Promise<{ ok: boolean; error?: string }> {
  return postSlack(channel, { text: message, thread_ts: threadTs })
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
