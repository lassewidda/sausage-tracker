'use client'

import { useEffect } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function SlidePanel({ isOpen, onClose, title, children }: Props) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [isOpen])

  return (
    <>
      <div
        className={`slide-panel__backdrop${isOpen ? ' slide-panel__backdrop--visible' : ''}`}
        onClick={onClose}
      />
      <div className={`slide-panel${isOpen ? ' slide-panel--open' : ''}`}>
        <div className="slide-panel__content">
          <div className="slide-panel__header">
            <span>{title}</span>
            <button className="slide-panel__close" onClick={onClose}>✕</button>
          </div>
          {children}
        </div>
      </div>
    </>
  )
}
