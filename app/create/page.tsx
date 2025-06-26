"use client"

import React, { useState } from 'react'
import { PageHeader } from '@/components/sections/header/page-header'
import BasicProjectInfoStep from '@/components/create-steps/BasicProjectInfoStep'
import AddMediaStep from '@/components/create-steps/AddMediaStep'
import ChooseDesignStep from '@/components/create-steps/ChooseDesignStep'
import ConfigureAuthStep from '@/components/create-steps/ConfigureAuthStep'
import ConfigurePricingStep from '@/components/create-steps/ConfigurePricingStep'
import AddPaymentsStep from '@/components/create-steps/AddPaymentsStep'
import SitemapBuilderStep from '@/components/create-steps/SitemapBuilderStep'
import AddStorageStep from '@/components/create-steps/AddStorageStep'
import AddDatabaseStep from '@/components/create-steps/AddDatabaseStep'
import ConfigureHostingStep from '@/components/create-steps/ConfigureHostingStep'
import SetupCompleteStep from '@/components/create-steps/SetupCompleteStep'
import VerticalProgressBar from '@/components/create-steps/VerticalProgressBar'

const steps = [
  'Basic Info',
  'Add Media',
  'Choose Design',
  'Configure Auth',
  'Configure Pricing',
  'Add Payments',
  'Sitemap',
  'Add Storage',
  'Add Database',
  'Configure Hosting',
  'Setup Complete',
]

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [projectName, setProjectName] = useState('')
  const [isWebApp, setIsWebApp] = useState<boolean | null>(null)
  const [description, setDescription] = useState('')

  // Handlers for basic info step
  const handleBasicChange = (field: string, value: any) => {
    if (field === 'projectName') setProjectName(value)
    if (field === 'isWebApp') setIsWebApp(value)
    if (field === 'description') setDescription(value)
  }
  const canProceedBasic = projectName.trim().length > 0 && isWebApp !== null && description.trim().length > 0

  // Navigation
  const goNext = () => setCurrentStep(s => Math.min(s + 1, steps.length - 1))
  const goBack = () => setCurrentStep(s => Math.max(s - 1, 0))
  const restart = () => {
    setCurrentStep(0)
    setProjectName('')
    setIsWebApp(null)
    setDescription('')
  }

  // Render step
  let stepComponent = null
  switch (currentStep) {
    case 0:
      stepComponent = (
        <BasicProjectInfoStep
          projectName={projectName}
          isWebApp={isWebApp}
          description={description}
          onChange={handleBasicChange}
          onNext={goNext}
          canProceed={canProceedBasic}
        />
      )
      break
    case 1:
      stepComponent = <AddMediaStep onNext={goNext} onBack={goBack} />
      break
    case 2:
      stepComponent = <ChooseDesignStep onNext={goNext} onBack={goBack} />
      break
    case 3:
      stepComponent = <ConfigureAuthStep onNext={goNext} onBack={goBack} />
      break
    case 4:
      stepComponent = <ConfigurePricingStep onNext={goNext} onBack={goBack} />
      break
    case 5:
      stepComponent = <AddPaymentsStep onNext={goNext} onBack={goBack} />
      break
    case 6:
      stepComponent = <SitemapBuilderStep onNext={goNext} onBack={goBack} />
      break
    case 7:
      stepComponent = <AddStorageStep onNext={goNext} onBack={goBack} />
      break
    case 8:
      stepComponent = <AddDatabaseStep onNext={goNext} onBack={goBack} />
      break
    case 9:
      stepComponent = <ConfigureHostingStep onNext={goNext} onBack={goBack} />
      break
    case 10:
      stepComponent = <SetupCompleteStep onRestart={restart} />
      break
    default:
      stepComponent = null
  }

  return (
    <div className="relative min-h-screen">
      <PageHeader />
      <div className="flex flex-row min-h-[calc(100vh-8rem)] px-8">
        <div className="flex flex-col justify-center min-h-full">
          <VerticalProgressBar
            steps={steps}
            currentStep={currentStep}
            onPrev={goBack}
            onNext={goNext}
            canGoBack={currentStep > 0}
            canGoNext={currentStep < steps.length - 1}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          {stepComponent}
        </div>
      </div>
    </div>
  )
} 