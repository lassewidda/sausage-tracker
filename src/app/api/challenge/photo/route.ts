import { NextRequest, NextResponse } from 'next/server'
import { getChallengeByWeek, upsertChallengePhoto, deleteChallengePhoto, getWeekKey, insertMeal, deleteMealByBlobPath, getChallengeView } from '@/lib/db'
import { sendSlackChannel } from '@/lib/slack'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { playerName, bingoItem, imageUrl, blobPath, weekKey } = body

  if (!playerName || !bingoItem || !imageUrl || !blobPath) {
    return NextResponse.json({ error: 'playerName, bingoItem, imageUrl, and blobPath are required' }, { status: 400 })
  }

  const wk = weekKey || getWeekKey()
  const challenge = await getChallengeByWeek(wk)

  if (!challenge) {
    return NextResponse.json({ error: 'No challenge found for this week' }, { status: 404 })
  }

  if (!challenge.bingoItems.includes(bingoItem)) {
    return NextResponse.json({ error: 'Invalid bingo item for this challenge' }, { status: 400 })
  }

  let photo
  try {
    photo = await upsertChallengePhoto(
      challenge.id,
      playerName.toLowerCase(),
      bingoItem,
      imageUrl,
      blobPath,
      challenge,
    )
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 400 })
  }

  // Also insert into meals so it appears in the feed
  try {
    await insertMeal({
      imageUrl,
      blobPath,
      itemCount: 0,
      aiSuggestedCount: null,
      aiDescription: `📸 Photo bingo: ${bingoItem}`,
      estimatedGrams: null,
      playerName: playerName.toLowerCase(),
      exerciseType: 'photo',
    })
  } catch { /* ignore if duplicate */ }

  // Notify #powerup channel
  try {
    sendSlackChannel(`📸 ${playerName.toUpperCase()} found "${bingoItem}" for the weekly challenge!`).catch(() => {})

    // Check if this completed the challenge for the player/team
    const view = await getChallengeView(wk)
    if (challenge.challengeMode === 'group' && challenge.teams) {
      const team = challenge.teams.find(t => t.members.includes(playerName.toLowerCase()))
      const teamProgress = view.teamProgress?.find(tp => tp.team.name === team?.name)
      if (teamProgress?.isComplete) {
        sendSlackChannel(`🏆 Team ${team!.name} completed the weekly challenge!`).catch(() => {})
      }
    } else {
      const participant = view.participants.find(p => p.playerName === playerName.toLowerCase())
      if (participant?.isComplete) {
        sendSlackChannel(`🏆 ${playerName.toUpperCase()} completed the weekly challenge!`).catch(() => {})
      }
    }
  } catch { /* silent */ }

  return NextResponse.json(photo)
}

export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const { id, playerName } = body

  if (!id || !playerName) {
    return NextResponse.json({ error: 'id and playerName are required' }, { status: 400 })
  }

  const deletedBlobPath = await deleteChallengePhoto(id, playerName.toLowerCase())

  if (!deletedBlobPath) {
    return NextResponse.json({ error: 'Photo not found or not owned by you' }, { status: 404 })
  }

  // Also remove the corresponding meal feed entry
  try {
    await deleteMealByBlobPath(deletedBlobPath)
  } catch { /* ignore */ }

  return NextResponse.json({ success: true })
}
