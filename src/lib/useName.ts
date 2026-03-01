'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'sausage_player_name'

export function useName() {
  const [name, setNameState] = useState<string>('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) ?? ''
    setNameState(stored)
    setLoaded(true)
  }, [])

  const setName = useCallback((newName: string) => {
    const trimmed = newName.trim()
    localStorage.setItem(STORAGE_KEY, trimmed)
    setNameState(trimmed)
  }, [])

  return { name, setName, loaded }
}
