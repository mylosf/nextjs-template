import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Send, Globe, ShoppingCart, Shield, Settings } from 'lucide-react'

interface Props {
  projectName: string
  isWebApp: boolean | null
  description: string
  onChange: (field: string, value: any) => void
  onNext: () => void
  canProceed: boolean
}

const questions = [
  {
    label: 'Give your project a name',
    field: 'projectName',
    type: 'text',
    placeholder: 'Enter project name...'
  },
  {
    label: 'Choose your website type',
    field: 'isWebApp',
    type: 'boolean',
  },
  {
    label: 'Provide a description of what your app should do',
    field: 'description',
    type: 'textarea',
    placeholder: 'Describe your app...'
  },
]

export default function BasicProjectInfoStep({ projectName, isWebApp, description, onChange, onNext, canProceed }: Props) {
  const [step, setStep] = useState(0)
  const [webappIconIndex, setWebappIconIndex] = useState(0)

  const webappIcons = [
    { icon: ShoppingCart, label: 'Web Store' },
    { icon: Shield, label: 'Authentication' },
    { icon: Settings, label: 'Settings' },
  ]

  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        setWebappIconIndex((prev) => (prev + 1) % webappIcons.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [step])

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      onNext()
    }
  }
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 0 && projectName.trim().length > 0) handleNext()
      if (step === 2 && description.trim().length > 0) handleNext()
    }
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[300px]">
      <h2 className="text-xl font-semibold mb-6 text-center">{questions[step].label}</h2>
      {step === 0 && (
        <div className="flex w-full items-center gap-2 mb-6">
          <Input
            value={projectName}
            onChange={e => onChange('projectName', e.target.value)}
            placeholder={questions[0].placeholder}
            className="text-lg py-4"
            autoFocus
            onKeyDown={handleKeyPress}
          />
          <Button
            onClick={handleNext}
            disabled={projectName.trim().length === 0}
            className="shrink-0"
          >
            <Send className="h-4 w-4 mr-2" />
            Continue
          </Button>
        </div>
      )}
      {step === 1 && (
        <div className="w-full">
          <div className="flex gap-4 mb-6">
            <Card 
              className={`cursor-pointer transition-all duration-200 flex-1 ring-1 ring-white bg-black rounded-xl ${
                isWebApp === false ? 'ring-2' : 'hover:bg-gray-800'
              }`}
              onClick={() => onChange('isWebApp', false)}
            >
              <CardContent className="p-6 text-center">
                <Globe className="h-6 w-6 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Static Website</h3>
                <p className="text-sm text-gray-400">Simple, fast, and reliable</p>
              </CardContent>
            </Card>
            <Card 
              className={`cursor-pointer transition-all duration-200 flex-1 ring-1 ring-white bg-black rounded-xl ${
                isWebApp === true ? 'ring-2' : 'hover:bg-gray-800'
              }`}
              onClick={() => onChange('isWebApp', true)}
            >
              <CardContent className="p-6 text-center">
                <div className="h-6 w-6 mx-auto mb-4 flex items-center justify-center overflow-hidden relative" style={{width:'1.5rem',height:'1.5rem'}}>
                  {webappIcons.map((item, idx) => (
                    <span
                      key={item.label}
                      className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-transform duration-500 ease-in-out ${
                        idx === webappIconIndex
                          ? 'translate-x-0 opacity-100'
                          : idx < webappIconIndex
                          ? '-translate-x-full opacity-0'
                          : 'translate-x-full opacity-0'
                      }`}
                    >
                      {React.createElement(item.icon, { className: 'h-6 w-6 text-gray-400' })}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-semibold mb-2">Functional Webapp</h3>
                <p className="text-sm text-gray-400">Dynamic and interactive</p>
              </CardContent>
            </Card>
          </div>
          <Button
            onClick={handleNext}
            disabled={isWebApp === null}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            Continue
          </Button>
        </div>
      )}
    </div>
  )
}