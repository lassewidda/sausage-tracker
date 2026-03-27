import { NextRequest, NextResponse } from 'next/server'
import { getChallengeByWeek, upsertChallengePhoto, deleteChallengePhoto, getWeekKey } from '@/lib/db'

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

  const photo = await upsertChallengePhoto(
    challenge.id,
    playerName.toLowerCase(),
    bingoItem,
    imageUrl,
    blobPath
  )

  return NextResponse.json(photo)
}

export async function DELETE(req: NextRequest) {
  const body = await req.json()
  const { id, playerName } = body

  if (!id || !playerName) {
    return NextResponse.json({ error: 'id and playerName are required' }, { status: 400 })
  }

  const deleted = await deleteChallengePhoto(id, playerName.toLowerCase())

  if (!deleted) {
    return NextResponse.json({ error: 'Photo not found or not owned by you' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
