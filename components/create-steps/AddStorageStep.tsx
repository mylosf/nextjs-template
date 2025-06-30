import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  onNext: () => void
  onBack: () => void
}

const predefinedUseCases = [
  'User profile avatars',
  'Subscription invoices', 
  'Terms & Services'
]

export default function AddStorageStep({ onNext, onBack }: Props) {
  const [showConfig, setShowConfig] = useState(false)
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([])
  const [customUseCase, setCustomUseCase] = useState('')

  const handleYesClick = () => {
    setShowConfig(true)
  }

  const handleNoClick = () => {
    onNext()
  }

  const handleUseCaseToggle = (useCase: string) => {
    setSelectedUseCases(prev => 
      prev.includes(useCase) 
        ? prev.filter(item => item !== useCase)
        : [...prev, useCase]
    )
  }

  const handleAddCustomUseCase = () => {
    if (customUseCase.trim() && !selectedUseCases.includes(customUseCase.trim())) {
      setSelectedUseCases(prev => [...prev, customUseCase.trim()])
      setCustomUseCase('')
    }
  }

  const handleRemoveUseCase = (useCase: string) => {
    setSelectedUseCases(prev => prev.filter(item => item !== useCase))
  }

  const handleContinue = () => {
    // Here you could save the selected use cases to your form state
    onNext()
  }

  if (showConfig) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Configure Storage Use Cases</h2>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Select typical use cases:</h3>
          <div className="space-y-3 mb-6">
            {predefinedUseCases.map((useCase) => (
              <div key={useCase} className="flex items-center space-x-2">
                <Checkbox
                  id={useCase}
                  checked={selectedUseCases.includes(useCase)}
                  onCheckedChange={() => handleUseCaseToggle(useCase)}
                />
                <Label htmlFor={useCase} className="text-sm cursor-pointer">
                  {useCase}
                </Label>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Add custom use case:</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter custom use case..."
                value={customUseCase}
                onChange={(e) => setCustomUseCase(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAddCustomUseCase}
                disabled={!customUseCase.trim()}
                size="sm"
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => setShowConfig(false)}>Back</Button>
          <Button onClick={handleContinue}>Continue</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Add Storage</h2>
      
      <div className="mb-8">
        <p className="text-lg text-gray-300 mb-6">
          Do you need your users to upload images, videos, documents or large blobs of text to the cloud? 
          <br />
          <span className="text-gray-400 text-sm">
            e.g. user avatar, codebase, PDF contracts
          </span>
        </p>
        
        <div className="flex gap-4">
          <Button 
            onClick={handleYesClick}
            className="flex-1"
            size="lg"
          >
            Yes, configure
          </Button>
          <Button 
            onClick={handleNoClick}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            No, continue
          </Button>
        </div>
      </div>
    </div>
  )
} 