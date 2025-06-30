import React from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  onRestart: () => void
}

export default function SetupCompleteStep({ onRestart }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-semibold mb-6">Setup Complete!</h2>
      <div className="mb-4 text-green-400 font-semibold text-lg">Your project is now saved!</div>
      <div className="mb-8 text-gray-400">Your project setup is complete. You can now proceed to wireframes or start building your app.</div>
      <Button onClick={onRestart}>Start Over</Button>
    </div>
  )
} 