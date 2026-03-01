'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useName } from '@/lib/useName'

interface DeleteButtonProps {
  mealId: string
  mealPlayerName: string
}

export function DeleteButton({ mealId, mealPlayerName }: DeleteButtonProps) {
  const { name } = useName()
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Show delete button if this is the user's own post, or if it's an anonymous legacy post
  const canDelete = name === mealPlayerName || mealPlayerName === 'Anonymous'
  if (!canDelete) return null

  if (confirming) {
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={async () => {
            setDeleting(true)
            try {
              const res = await fetch(`/api/meals/${mealId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName: name }),
              })
              if (res.ok) {
                router.refresh()
              } else {
                alert('Delete failed')
                setConfirming(false)
                setDeleting(false)
              }
            } catch {
              alert('Delete failed')
              setConfirming(false)
              setDeleting(false)
            }
          }}
          disabled={deleting}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            textTransform: 'uppercase',
            background: '#AA0000',
            color: '#FFFFFF',
            border: 'none',
            padding: '3px 8px',
            cursor: 'pointer',
          }}
        >
          {deleting ? '...' : 'YES, DELETE'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            textTransform: 'uppercase',
            background: 'var(--amiga-grey)',
            color: 'var(--amiga-black)',
            border: '1px solid var(--amiga-dark-grey)',
            padding: '3px 8px',
            cursor: 'pointer',
          }}
        >
          CANCEL
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title="Delete this meal"
      style={{
        fontFamily: 'var(--font-pixel)',
        fontSize: '6px',
        textTransform: 'uppercase',
        background: 'transparent',
        color: 'var(--amiga-dark-grey)',
        border: '1px solid var(--amiga-dark-grey)',
        padding: '2px 6px',
        cursor: 'pointer',
      }}
    >
      DEL
    </button>
  )
}
