import { NextResponse } from 'next/server'
import { getBattleState, saveBattleSummary } from '@/lib/db'
import { generateBattleSummary } from '@/lib/claude'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params

  try {
    const state = await getBattleState(id)

    if (state.battle.status !== 'finished') {
      return NextResponse.json({ error: 'Battle not finished' }, { status: 400 })
    }

    // Return cached summary if exists
    if (state.battle.summary) {
      return NextResponse.json({ summary: state.battle.summary })
    }

    const allDeck = [...state.challengerDeck, ...state.opponentDeck]
    const cardMap = new Map(allDeck.map(d => [d.cardId, d.card?.heroTitle ?? 'Unknown']))

    const turns = state.turns.map(t => ({
      turnNumber: t.turnNumber,
      attacker: t.attacker,
      attackerCard: cardMap.get(t.attackerCardId) ?? 'Unknown',
      defenderCard: cardMap.get(t.defenderCardId) ?? 'Unknown',
      moveUsed: t.moveUsed,
      damageDealt: t.damageDealt,
      typeMultiplier: t.typeMultiplier,
      defenderHpAfter: t.defenderHpAfter,
      isKnockout: t.isKnockout,
      isCritical: t.isCritical,
    }))

    const summary = await generateBattleSummary({
      challenger: state.battle.challenger,
      opponent: state.battle.opponent ?? 'Unknown',
      winner: state.battle.winner,
      turns,
    })

    // Cache it
    await saveBattleSummary(id, summary)

    return NextResponse.json({ summary })
  } catch {
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 })
  }
}
