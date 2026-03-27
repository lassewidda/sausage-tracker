import { NextResponse } from 'next/server'
import { insertMeal, getAllMeals, groupByWeek, addPlayerItem } from '@/lib/db'
import { rewriteDescriptionForCount } from '@/lib/claude'
import { rollItemDrop } from '@/lib/itemCatalog'

export async function GET(): Promise<NextResponse> {
  try {
    const meals = await getAllMeals()
    const weeks = groupByWeek(meals)
    const grandTotal = meals.reduce((sum, m) => sum + m.itemCount, 0)
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
    itemCount: number
    aiSuggestedCount?: number
    aiDescription?: string
    weightPerItem?: number
    playerName?: string
    exerciseType?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { imageUrl, blobPath, itemCount, aiSuggestedCount, aiDescription, weightPerItem, playerName, exerciseType } = body

  if (!imageUrl || !blobPath || itemCount === undefined) {
    return NextResponse.json(
      { error: 'imageUrl, blobPath, and itemCount are required' },
      { status: 400 }
    )
  }

  if (typeof itemCount !== 'number' || itemCount < 0 || !Number.isInteger(itemCount)) {
    return NextResponse.json(
      { error: 'itemCount must be a non-negative integer' },
      { status: 400 }
    )
  }

  let finalDescription = aiDescription ?? null
  if (
    finalDescription &&
    aiSuggestedCount !== undefined &&
    aiSuggestedCount !== null &&
    itemCount !== aiSuggestedCount
  ) {
    try {
      finalDescription = await rewriteDescriptionForCount(finalDescription, aiSuggestedCount, itemCount)
    } catch {
      // keep original description if rewrite fails
    }
  }

  const estimatedGrams =
    weightPerItem && weightPerItem > 0 ? weightPerItem * itemCount : null

  try {
    const normalizedName = (playerName ?? 'Anonymous').trim() || 'Anonymous'
    const meal = await insertMeal({
      imageUrl,
      blobPath,
      itemCount,
      aiSuggestedCount: aiSuggestedCount ?? null,
      aiDescription: finalDescription,
      estimatedGrams,
      playerName: normalizedName,
      exerciseType: exerciseType ?? null,
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
