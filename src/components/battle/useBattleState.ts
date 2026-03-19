'use client'

import { useState, useEffect, useCallback } from 'react'
import type { BattleState } from '@/types'

export function useBattleState(battleId: string, pollInterval = 1500) {
  const [state, setState] = useState<BattleState | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/battle/${battleId}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setState(data)
      setError(null)
    } catch {
      setError('Failed to load battle')
    }
  }, [battleId])

  useEffect(() => {
    fetchState()
    const interval = setInterval(fetchState, pollInterval)
    return () => clearInterval(interval)
  }, [fetchState, pollInterval])

  return { state, error, refetch: fetchState }
}
