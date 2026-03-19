import { NextResponse } from 'next/server'
import { getBattleState } from '@/lib/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const state = await getBattleState(id)
    return NextResponse.json(state)
  } catch {
    return NextResponse.json({ error: 'Battle not found' }, { status: 404 })
  }
}
