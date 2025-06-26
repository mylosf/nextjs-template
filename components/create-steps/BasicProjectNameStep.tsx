import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'

interface Props {
  projectName: string
  onChange: (value: string) => void
  onNext: () => void
  canProceed: boolean
}

function BasicProjectNameStep({ projectName, onChange, onNext, canProceed }: Props) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && projectName.trim().length > 0) onNext()
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[300px]">
      <h2 className="text-xl font-semibold mb-6 text-center">Give your project a name</h2>
      <div className="flex w-full items-center gap-2 mb-6">
        <Input
          value={projectName}
          onChange={e => onChange(e.target.value)}
          placeholder="Enter project name..."
          className="text-lg py-4"
          autoFocus
          onKeyDown={handleKeyPress}
        />
        <Button
          onClick={onNext}
          disabled={projectName.trim().length === 0}
          className="shrink-0"
        >
          <Send className="h-4 w-4 mr-2" />
          Continue
        </Button>
      </div>
    </div>
  )
}

export default BasicProjectNameStep; 