'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'sausage_player_name'
const NAME_CHANGE_EVENT = 'powerup_name_change'

export function useName() {
  const [name, setNameState] = useState<string>('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) ?? '').toLowerCase()
    setNameState(stored)
    if (stored) localStorage.setItem(STORAGE_KEY, stored)
    setLoaded(true)

    // Listen for name changes from other hook instances
    function onNameChange() {
      const current = (localStorage.getItem(STORAGE_KEY) ?? '').toLowerCase()
      setNameState(current)
    }
    window.addEventListener(NAME_CHANGE_EVENT, onNameChange)
    return () => window.removeEventListener(NAME_CHANGE_EVENT, onNameChange)
  }, [])

  const setName = useCallback((newName: string) => {
    const normalized = newName.trim().toLowerCase()
    localStorage.setItem(STORAGE_KEY, normalized)
    setNameState(normalized)
    // Notify other hook instances
    window.dispatchEvent(new Event(NAME_CHANGE_EVENT))
  }, [])

  return { name, setName, loaded }
}
