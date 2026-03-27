import { NextResponse } from 'next/server'
import { getAppConfig, getExerciseDaysByPlayer } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startDate = await getAppConfig('progress_start_date')
  const endDate = await getAppConfig('progress_end_date')

  if (!startDate || !endDate) {
    return NextResponse.json({ configured: false })
  }

  const playerDays = await getExerciseDaysByPlayer(startDate, endDate)

  return NextResponse.json({
    configured: true,
    startDate,
    endDate,
    playerDays,
  })
}
