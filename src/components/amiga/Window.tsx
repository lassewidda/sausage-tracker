import React from 'react'

interface WindowProps {
  title: string
  children: React.ReactNode
  className?: string
  showGadgets?: boolean
}

export function Window({ title, children, className = '', showGadgets = true }: WindowProps) {
  return (
    <div className={`amiga-window ${className}`}>
      <div className="amiga-window__titlebar">
        {showGadgets && <div className="amiga-window__gadget"></div>}
        <span className="amiga-window__title">{title}</span>
        {showGadgets && <div className="amiga-window__gadget"></div>}
      </div>
      <div className="amiga-window__body">{children}</div>
    </div>
  )
}
