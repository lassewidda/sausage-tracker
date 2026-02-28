import { NextResponse } from 'next/server'
import { insertMeal, getAllMeals, groupByWeek } from '@/lib/db'

export async function GET(): Promise<NextResponse> {
  try {
    const meals = await getAllMeals()
    const weeks = groupByWeek(meals)
    const grandTotal = meals.reduce((sum, m) => sum + m.sausageCount, 0)

    return NextResponse.json({ weeks, grandTotal })
  } catch (error) {
    console.error('GET /api/meals error:', error)
    return NextResponse.json({ error: 'Failed to fetch meals' }, { status: 500 })
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: {
    imageUrl: string
    blobPath: string
    sausageCount: number
    aiSuggestedCount?: number
    aiDescription?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { imageUrl, blobPath, sausageCount, aiSuggestedCount, aiDescription } = body

  if (!imageUrl || !blobPath || sausageCount === undefined) {
    return NextResponse.json(
      { error: 'imageUrl, blobPath, and sausageCount are required' },
      { status: 400 }
    )
  }

  if (typeof sausageCount !== 'number' || sausageCount < 0 || !Number.isInteger(sausageCount)) {
    return NextResponse.json(
      { error: 'sausageCount must be a non-negative integer' },
      { status: 400 }
    )
  }

  try {
    const meal = await insertMeal({
      imageUrl,
      blobPath,
      sausageCount,
      aiSuggestedCount: aiSuggestedCount ?? null,
      aiDescription: aiDescription ?? null,
    })

    return NextResponse.json(meal, { status: 201 })
  } catch (error) {
    console.error('POST /api/meals error:', error)
    return NextResponse.json({ error: 'Failed to save meal' }, { status: 500 })
  }
}
