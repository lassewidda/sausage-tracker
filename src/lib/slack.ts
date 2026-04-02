export async function sendSlackDM(slackUserId: string, message: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.SLACK_BOT_TOKEN
  if (!token) return { ok: false, error: 'SLACK_BOT_TOKEN not set' }
  if (!slackUserId) return { ok: false, error: 'No Slack user ID' }

  try {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: slackUserId,
        text: message,
      }),
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
