import { NextRequest, NextResponse } from 'next/server'
import { getAppConfig, setAppConfig } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startDate = await getAppConfig('progress_start_date')
  const endDate = await getAppConfig('progress_end_date')

  return NextResponse.json({ startDate, endDate })
}

export async function POST(req: NextRequest) {
  const { startDate, endDate } = await req.json()

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 })
  }

  await setAppConfig('progress_start_date', startDate)
  await setAppConfig('progress_end_date', endDate)

  return NextResponse.json({ success: true })
}
