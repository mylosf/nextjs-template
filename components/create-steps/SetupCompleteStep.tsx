import React from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  onRestart: () => void
  formData: any
}

function downloadJSON(data: any, filename = 'project.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SetupCompleteStep({ onRestart, formData }: Props) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-semibold mb-6">Setup Complete!</h2>
      <div className="mb-4 text-green-400 font-semibold text-lg">Your project is now saved!</div>
      <div className="mb-8 text-gray-400">Your project setup is complete. You can now proceed to wireframes or start building your app.</div>
      <div className="flex flex-col items-center gap-4">
        <Button onClick={onRestart}>Start Over</Button>
        <Button variant="outline" onClick={() => downloadJSON(formData)}>
          Download JSON
        </Button>
      </div>
    </div>
  )
} 