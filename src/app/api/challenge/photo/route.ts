import { NextRequest, NextResponse } from 'next/server'
import { getChallengeByWeek, upsertChallengePhoto, deleteChallengePhoto, getWeekKey, insertMeal, deleteMealByBlobPath } from '@/lib/db'

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
