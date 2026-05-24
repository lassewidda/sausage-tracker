import { NextResponse } from 'next/server'
import { sendSlackChannel } from '@/lib/slack'

export const dynamic = 'force-dynamic'

// Hand-written Monday announcements, keyed by UTC date.
// Posted at 06:59 UTC (08:59 CEST) on Mondays, before the 07:00 UTC LLM
// stats summary fires from the channel-summary cron. Use this for weeks where
// the message is too important to entrust to the LLM (new rules, period kick-offs,
// big behavioural asks). Stats summary still goes out separately at 07:00 UTC.
const MONDAY_POSTS: Record<string, string> = {
  '2026-05-25': [
    "🏒 *PUCK'S CHALLENGE — PERIOD 2, WEEK 2 IS LIVE*",
    '',
    "Last week only *3 of 11 teams* crossed the line — *The Curl-Walkers*, *Saddle & Soles*, and *Personal Record Recorders*. The rest stalled because one partner stayed quiet. This format was always going to be harder than the solo card: *this is a TEAM SPORT*, not a solo grind. Grinding workouts on your own does not get the team across the line.",
    '',
    "*Open a private DM with your partner TODAY.* Compare schedules. Divide the bingo card. Plan who is snapping which photo. Nudge each other when the week slips. You will not finish this alone — and that is the point.",
    '',
    "🆘 *NEW THIS WEEK: the RESCUE PILL.* If your partner ends the week one workout short of the minimum, your extra workouts can cover for them — one rescue per donor, and every teammate still needs at least (minimum − 1) on their own. It's a backstop for an off week, not a free pass. The minimum drops to *3 workouts per person* this week to make room for it.",
    '',
    "📸 *This week's bingo card (6 items):*",
    "1. A team sport",
    "2. An individual sport",
    "3. Synchronized pose (team)",
    "4. A construction vehicle",
    "5. Someone riding a bicycle",
    "6. Someone riding an MC (motorcycle)",
    '',
    "Check your pairing, the card, and your team's progress at https://powerup.eliteprospects.com/challenge",
  ].join('\n'),
}

export async function GET(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().slice(0, 10)
  const message = MONDAY_POSTS[today]
  if (!message) {
    return NextResponse.json({ ok: true, skipped: true, reason: 'no hand-written post for today', today })
  }

  const result = await sendSlackChannel(message)
  if (!result.ok) {
    return NextResponse.json({ error: 'Slack post failed', details: result.error, today }, { status: 500 })
  }
  return NextResponse.json({ ok: true, posted: true, today, ts: result.ts })
}
