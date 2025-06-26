import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

interface Props {
  description: string
  onChange: (value: string) => void
  onNext: () => void
  canProceed: boolean
}

export default function ProjectDescriptionStep({ description, onChange, onNext, canProceed }: Props) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && description.trim().length > 0) onNext()
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[300px]">
      <h2 className="text-xl font-semibold mb-6 text-center">Provide a description of what your app should do</h2>
      <div className="flex w-full items-center gap-2 mb-6">
        <Textarea
          value={description}
          onChange={e => onChange(e.target.value)}
          placeholder="Describe your app..."
          className="text-lg py-4 min-h-[120px] resize-none"
          autoFocus
          onKeyDown={handleKeyPress}
        />
        <Button
          onClick={onNext}
          disabled={description.trim().length === 0}
          className="shrink-0 self-start mt-2"
        >
          <Send className="h-4 w-4 mr-2" />
          Next
        </Button>
      </div>
    </div>
  )
} 