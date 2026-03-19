import { NextResponse } from 'next/server'
import { getFinishedBattlesWithDecks } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const battles = await getFinishedBattlesWithDecks()
    return NextResponse.json(battles)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
