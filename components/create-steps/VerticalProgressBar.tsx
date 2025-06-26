import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown } from 'lucide-react'

interface Props {
  steps: string[]
  currentStep: number
  onPrev: () => void
  onNext: () => void
  canGoNext?: boolean
  canGoBack?: boolean
}

export default function VerticalProgressBar({ steps, currentStep, onPrev, onNext, canGoNext = true, canGoBack = true }: Props) {
  const percent = Math.round(((currentStep + 1) / steps.length) * 100)
  return (
    <div className="flex flex-row items-center mr-8 min-h-[200px] select-none">
      {/* Progress bar and arrows */}
      <div className="flex flex-col items-center">
        <Button size="icon" variant="ghost" className="mb-2 rounded-full" onClick={onPrev} disabled={!canGoBack} aria-label="Previous step">
          <ChevronUp className="h-4 w-4" />
        </Button>
        <div className="relative h-48 w-1 bg-gray-800 rounded-full overflow-hidden flex items-center justify-center">
          <div
            className="absolute left-0 top-0 w-1 bg-gray-300 rounded-full transition-all duration-300"
            style={{ height: `${percent}%` }}
          />
        </div>
        <Button size="icon" variant="ghost" className="mt-2 rounded-full" onClick={onNext} disabled={!canGoNext} aria-label="Next step">
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
      {/* Step label and percent to the right */}
      <div className="ml-6 flex flex-col items-start">
        <span className="text-white text-base font-semibold mb-1 whitespace-nowrap">{steps[currentStep]}</span>
        <span className="text-xs text-gray-400 whitespace-nowrap">{percent}% complete</span>
      </div>
    </div>
  )
} 