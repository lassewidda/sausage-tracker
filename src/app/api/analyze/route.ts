import { NextResponse } from 'next/server'
import { analyzeImage } from '@/lib/claude'

export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<NextResponse> {
  let imageUrl: string

  try {
    const body = await request.json()
    imageUrl = body.imageUrl
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!imageUrl || typeof imageUrl !== 'string') {
    return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
  }

  try {
    const result = await analyzeImage(imageUrl)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image', details: (error as Error).message },
      { status: 500 }
    )
  }
}
