'use client'

import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary'
  size?: 'normal' | 'large'
}

export function Button({
  variant = 'default',
  size = 'normal',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [
    'amiga-btn',
    variant === 'primary' ? 'amiga-btn--primary' : '',
    size === 'large' ? 'amiga-btn--large' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
