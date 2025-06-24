import React from 'react'

interface SocialProofProps {
  title?: string
  companies: string[]
  className?: string
}

export function SocialProof({ title = "Trusted by teams at", companies, className = "" }: SocialProofProps) {
  return (
    <div className={`mt-16 pt-8 border-t ${className}`}
         style={{ borderColor: 'var(--color-secondary)' }}>
      <p className="text-sm mb-6" style={{ color: 'var(--color-secondary)' }}>
        {title}
      </p>
      <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
        {companies.map((company, index) => (
          <div 
            key={index}
            className="px-6 py-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-secondary)', opacity: '0.5' }}
          >
            <span 
              className="font-semibold"
              style={{ color: 'var(--color-main)' }}
            >
              {company}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
} 