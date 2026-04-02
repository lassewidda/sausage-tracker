export async function sendSlackDM(slackUserId: string, message: string): Promise<boolean> {
  const token = process.env.SLACK_BOT_TOKEN
  if (!token || !slackUserId) return false

  try {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: slackUserId, // DM by user ID
        text: message,
      }),
    })
    const data = await res.json()
    return data.ok === true
  } catch {
    return false
  }
}
