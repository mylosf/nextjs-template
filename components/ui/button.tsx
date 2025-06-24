import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  className?: string
}

export function Button({ children, variant = 'primary', onClick, className = "" }: ButtonProps) {
  const baseStyles = "font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
  
  const variantStyles = {
    primary: {
      backgroundColor: 'var(--color-accent)',
      color: 'var(--color-background)',
      border: 'none'
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--color-secondary)',
      border: `1px solid var(--color-secondary)`
    }
  }

  const hoverStyles = variant === 'primary' 
    ? 'hover:opacity-90 shadow-lg' 
    : 'hover:text-[var(--color-main)] hover:border-[var(--color-main)]'

  return (
    <button 
      className={`${baseStyles} ${hoverStyles} ${className}`}
      style={variantStyles[variant]}
      onClick={onClick}
    >
      {children}
    </button>
  )
} 