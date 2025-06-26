import React from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  onNext: () => void
  onBack: () => void
}

export default function ConfigureHostingStep({ onNext, onBack }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Configure Hosting</h2>
      <div className="mb-8 text-gray-400">Hosting configuration UI goes here.</div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  )
} 