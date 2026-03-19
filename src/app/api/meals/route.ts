import { NextResponse } from 'next/server'
import { insertMeal, getAllMeals, groupByWeek, addPlayerItem } from '@/lib/db'
import { rewriteDescriptionForCount } from '@/lib/claude'
import { rollItemDrop } from '@/lib/itemCatalog'

export async function GET(): Promise<NextResponse> {
  try {
    const meals = await getAllMeals()
    const weeks = groupByWeek(meals)
    const grandTotal = meals.reduce((sum, m) => sum + m.sausageCount, 0)
    return NextResponse.json({ weeks, grandTotal, meals })
  } catch (error) {
    console.error('GET /api/meals error:', error)
    return NextResponse.json({ error: 'Failed to fetch meals', details: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: {
    imageUrl: string
    blobPath: string
    sausageCount: number
    aiSuggestedCount?: number
    aiDescription?: string
    gramsPerSausage?: number
    playerName?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { imageUrl, blobPath, sausageCount, aiSuggestedCount, aiDescription, gramsPerSausage, playerName } = body

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

  let finalDescription = aiDescription ?? null
  if (
    finalDescription &&
    aiSuggestedCount !== undefined &&
    aiSuggestedCount !== null &&
    sausageCount !== aiSuggestedCount
  ) {
    try {
      finalDescription = await rewriteDescriptionForCount(finalDescription, aiSuggestedCount, sausageCount)
    } catch {
      // keep original description if rewrite fails
    }
  }

  const estimatedGrams =
    gramsPerSausage && gramsPerSausage > 0 ? gramsPerSausage * sausageCount : null

  try {
    const normalizedName = (playerName ?? 'Anonymous').trim() || 'Anonymous'
    const meal = await insertMeal({
      imageUrl,
      blobPath,
      sausageCount,
      aiSuggestedCount: aiSuggestedCount ?? null,
      aiDescription: finalDescription,
      estimatedGrams,
      playerName: normalizedName,
    })

    // Roll for item drop
    let itemDrop = null
    if (normalizedName !== 'Anonymous') {
      const droppedItem = rollItemDrop()
      if (droppedItem) {
        await addPlayerItem(normalizedName.toLowerCase(), droppedItem.itemKey)
        itemDrop = {
          itemKey: droppedItem.itemKey,
          name: droppedItem.name,
          description: droppedItem.description,
          rarity: droppedItem.rarity,
          flavorText: droppedItem.flavorText,
        }
      }
    }

    return NextResponse.json({ ...meal, itemDrop }, { status: 201 })
  } catch (error) {
    console.error('POST /api/meals error:', error)
    return NextResponse.json({ error: 'Failed to save meal', details: String(error) }, { status: 500 })
  }
}
