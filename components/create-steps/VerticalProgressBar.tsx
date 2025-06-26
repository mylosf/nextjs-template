import React from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  steps: string[]
  currentStep: number
  onPrev: () => void
  onNext: () => void
  canGoNext?: boolean
  canGoBack?: boolean
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export default function VerticalProgressBar({ steps, currentStep, onPrev, onNext, canGoNext = true, canGoBack = true }: Props) {
  const percent = Math.round(((currentStep + 1) / steps.length) * 100)
  const isMobile = useIsMobile()

  if (isMobile) {
    // Horizontal bar for mobile
    return (
      <div className="w-full flex flex-col items-center mb-8 select-none">
        <div className="flex flex-row items-center w-full max-w-xs mx-auto">
          <Button size="icon" variant="ghost" className="mr-2 rounded-full" onClick={onPrev} disabled={!canGoBack} aria-label="Previous step">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="relative flex-1 h-1 bg-gray-800 rounded-full overflow-hidden flex items-center justify-center">
            <div
              className="absolute left-0 top-0 h-1 bg-gray-300 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <Button size="icon" variant="ghost" className="ml-2 rounded-full" onClick={onNext} disabled={!canGoNext} aria-label="Next step">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col items-center mt-3">
          <span className="text-white text-base font-semibold mb-1 whitespace-nowrap">{steps[currentStep]}</span>
          <span className="text-xs text-gray-400 whitespace-nowrap">{percent}% complete</span>
        </div>
      </div>
    )
  }

  // Desktop: vertical bar
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