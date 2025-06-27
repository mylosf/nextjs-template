import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Send, Utensils, Stethoscope, Gavel, Briefcase, Cpu, Building2, Cloud, ShoppingCart, HelpCircle } from 'lucide-react'

interface Props {
  isWebApp: boolean | null
  description: string
  onChange: (value: string) => void
  onNext: () => void
  canProceed: boolean
}

const staticOptions = [
  { label: 'Restaurant', icon: Utensils },
  { label: 'Doctor', icon: Stethoscope },
  { label: 'Legal office', icon: Gavel },
  { label: 'Consulting', icon: Briefcase },
  { label: 'Technology', icon: Cpu },
  { label: 'Business', icon: Building2 },
]

const webappOptions = [
  { label: 'SaaS', icon: Cloud },
  { label: 'PaaS', icon: Cpu },
  { label: 'E-commerce store', icon: ShoppingCart },
  { label: 'Other', icon: HelpCircle },
]

export default function ProjectDescriptionStep({ isWebApp, description, onChange, onNext, canProceed }: Props) {
  const options = isWebApp ? webappOptions : staticOptions

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[300px]">
      <h2 className="text-xl font-semibold mb-6 text-center">Industry</h2>
      <div className="mb-4 text-center text-base font-medium">Which use case fits your project the best?</div>
      <div className="w-full grid grid-cols-2 gap-4 mb-6">
        {options.map(opt => (
          <Card
            key={opt.label}
            className={`cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ring-1 ring-white bg-black rounded-xl p-4 ${
              description === opt.label ? 'ring-4 ring-blue-400' : 'hover:bg-gray-800'
            }`}
            onClick={() => onChange(opt.label)}
          >
            <CardContent className="flex flex-col items-center justify-center p-0">
              {React.createElement(opt.icon, { className: 'h-6 w-6 mb-2 text-gray-400' })}
              <span className="text-white text-sm font-semibold text-center">{opt.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button
        onClick={onNext}
        disabled={!description}
        className="w-full"
      >
        <Send className="h-4 w-4 mr-2" />
        Next
      </Button>
    </div>
  )
} 