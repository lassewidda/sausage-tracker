import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'

export const dynamic = 'force-dynamic'

function getDb() {
  return postgres(process.env.DATABASE_URL!, {
    max: 1,
    ssl: { rejectUnauthorized: false },
    idle_timeout: 20,
    connect_timeout: 10,
  })
}

export async function POST(req: NextRequest) {
  const { weekKey, oldName, newName, playerName } = await req.json()

  if (!weekKey || !oldName || !newName || !playerName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const trimmedNew = newName.trim()
  if (!trimmedNew) {
    return NextResponse.json({ error: 'Team name cannot be empty' }, { status: 400 })
  }

  const sql = getDb()

  // Get the challenge
  const rows = await sql`
    SELECT * FROM weekly_challenges WHERE week_key = ${weekKey}
  `

  if (rows.length === 0) {
    await sql.end()
    return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
  }

  const challenge = rows[0]
  const teams = typeof challenge.teams === 'string' ? JSON.parse(challenge.teams) : challenge.teams

  if (!teams || !Array.isArray(teams)) {
    await sql.end()
    return NextResponse.json({ error: 'No teams in this challenge' }, { status: 400 })
  }

  // Find the team and verify membership
  const team = teams.find((t: { name: string; members: string[] }) => t.name === oldName)
  if (!team) {
    await sql.end()
    return NextResponse.json({ error: 'Team not found' }, { status: 404 })
  }

  if (!team.members.includes(playerName.toLowerCase())) {
    await sql.end()
    return NextResponse.json({ error: 'You are not a member of this team' }, { status: 403 })
  }

  // Check new name doesn't conflict with another team
  const conflict = teams.find((t: { name: string }) => t.name === trimmedNew && t.name !== oldName)
  if (conflict) {
    await sql.end()
    return NextResponse.json({ error: 'A team with that name already exists' }, { status: 409 })
  }

  // Update the team name
  team.name = trimmedNew
  const teamsJson = JSON.stringify(teams)

  await sql`
    UPDATE weekly_challenges SET teams = ${teamsJson}::jsonb WHERE week_key = ${weekKey}
  `
  await sql.end()

  return NextResponse.json({ success: true })
}
