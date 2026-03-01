import { NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { deleteMeal } from '@/lib/db'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  let playerName: string
  try {
    const body = await request.json()
    playerName = body.playerName ?? ''
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const meal = await deleteMeal(params.id, playerName)
    if (!meal) {
      return NextResponse.json(
        { error: 'Meal not found or you do not own it' },
        { status: 403 }
      )
    }

    // Delete the image from Vercel Blob too
    try {
      await del(meal.imageUrl)
    } catch (blobErr) {
      console.warn('Blob delete failed (continuing):', blobErr)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/meals/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete meal', details: String(error) }, { status: 500 })
  }
}
