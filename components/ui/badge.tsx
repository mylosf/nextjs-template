import React from 'react'

interface BadgeProps {
  emoji?: string
  text: string
  className?: string
}

export function Badge({ emoji, text, className = "" }: BadgeProps) {
  return (
    <div className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ring-1 mb-8 ${className}`}
         style={{
           backgroundColor: 'var(--color-accent)',
           color: 'var(--color-background)',
           borderColor: 'var(--color-accent)',
           opacity: '0.9'
         }}>
      {emoji && <span className="mr-2">{emoji}</span>}
      {text}
    </div>
  )
} 