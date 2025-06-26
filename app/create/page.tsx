"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/sections/header/page-header"
import { ArrowRight, ArrowLeft } from "lucide-react"

interface FormData {
  projectName: string
  isWebApp: boolean | null
  description: string
}

const questions = [
  {
    id: 'projectName',
    title: 'Give your project a name',
    type: 'text',
    placeholder: 'Enter project name...'
  },
  {
    id: 'isWebApp',
    title: 'Would you like a static website or a web app with backend?',
    type: 'boolean'
  },
  {
    id: 'description',
    title: 'Provide a description of what your app should do',
    type: 'textarea',
    placeholder: 'Describe your app...'
  }
]

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    isWebApp: null,
    description: ''
  })

  const currentQuestion = questions[currentStep]

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }))
  }

  const canProceed = () => {
    const currentValue = formData[currentQuestion.id as keyof FormData]
    if (currentQuestion.type === 'text' || currentQuestion.type === 'textarea') {
      return typeof currentValue === 'string' && currentValue.trim().length > 0
    }
    if (currentQuestion.type === 'boolean') {
      return currentValue !== null
    }
    return false
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canProceed()) {
      handleNext()
    }
  }

  return (
    <div className="relative min-h-screen">
      <PageHeader />

      {/* Form Content */}
      <div className="flex min-h-[calc(100vh-8rem)] px-8">
        {/* Vertical Progress Bar */}
        <div className="flex flex-col items-center mr-12 pt-8">
          <div className="w-1 bg-gray-200 h-64 rounded-full relative">
            <div 
              className="absolute bottom-0 w-1 bg-gray-600 rounded-full transition-all duration-300"
              style={{ height: `${((currentStep + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            {Math.round(((currentStep + 1) / questions.length) * 100)}%
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            {/* Question */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-6">{currentQuestion.title}</h2>
              
              {currentQuestion.type === 'text' && (
                <Input
                  value={formData.projectName}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={currentQuestion.placeholder}
                  className="text-lg py-4"
                  autoFocus
                />
              )}

              {currentQuestion.type === 'boolean' && (
                <div className="space-y-4">
                  <Button
                    variant={formData.isWebApp === true ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleInputChange(true)}
                    className="w-full justify-start text-lg py-6"
                  >
                    Yes, I want a web app with backend
                  </Button>
                  <Button
                    variant={formData.isWebApp === false ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleInputChange(false)}
                    className="w-full justify-start text-lg py-6"
                  >
                    No, I want a static website
                  </Button>
                </div>
              )}

              {currentQuestion.type === 'textarea' && (
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="text-lg py-4 min-h-[120px] resize-none"
                  autoFocus
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed() || currentStep === questions.length - 1}
                className="flex items-center"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 