'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'sausage_player_name'

export function useName() {
  const [name, setNameState] = useState<string>('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) ?? '').toLowerCase()
    setNameState(stored)
    if (stored) localStorage.setItem(STORAGE_KEY, stored) // normalize existing
    setLoaded(true)
  }, [])

  const setName = useCallback((newName: string) => {
    const normalized = newName.trim().toLowerCase()
    localStorage.setItem(STORAGE_KEY, normalized)
    setNameState(normalized)
  }, [])

  return { name, setName, loaded }
}
