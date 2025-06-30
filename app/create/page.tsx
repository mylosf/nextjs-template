"use client"

import React, { useState } from 'react'
import { PageHeader } from '@/components/sections/header/page-header'
import BasicProjectNameStep from '@/components/create-steps/BasicProjectNameStep'
import WebsiteTypeStep from '@/components/create-steps/WebsiteTypeStep'
import ProjectDescriptionStep from '@/components/create-steps/ProjectDescriptionStep'
import AddMediaStep from '@/components/create-steps/AddMediaStep'
import ChooseDesignStep from '@/components/create-steps/ChooseDesignStep'
import ConfigureAuthStep from '@/components/create-steps/ConfigureAuthStep'
import ConfigurePricingStep from '@/components/create-steps/ConfigurePricingStep'
import AddPaymentsStep from '@/components/create-steps/AddPaymentsStep'
import SitemapBuilderStep from '@/components/create-steps/SitemapBuilderStep'
import AddStorageStep from '@/components/create-steps/AddStorageStep'
import AddDatabaseStep from '@/components/create-steps/AddDatabaseStep'
import AddHostingStep from '@/components/create-steps/AddHostingStep'
import SetupCompleteStep from '@/components/create-steps/SetupCompleteStep'
import VerticalProgressBar from '@/components/create-steps/VerticalProgressBar'

const steps = [
  'Project Name',
  'Website Type',
  'Project Description',
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

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [projectName, setProjectName] = useState('')
  const [isWebApp, setIsWebApp] = useState<boolean | null>(null)
  const [description, setDescription] = useState('')
  const isMobile = useIsMobile()

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
        <BasicProjectNameStep
          projectName={projectName}
          onChange={setProjectName}
          onNext={goNext}
          canProceed={projectName.trim().length > 0}
        />
      )
      break
    case 1:
      stepComponent = (
        <WebsiteTypeStep
          isWebApp={isWebApp}
          onChange={setIsWebApp}
          onNext={goNext}
          canProceed={isWebApp !== null}
        />
      )
      break
    case 2:
      stepComponent = (
        <ProjectDescriptionStep
          isWebApp={isWebApp}
          description={description}
          onChange={setDescription}
          onNext={goNext}
          canProceed={description.trim().length > 0}
        />
      )
      break
    case 3:
      stepComponent = <AddMediaStep onNext={goNext} onBack={goBack} />
      break
    case 4:
      stepComponent = <ChooseDesignStep onNext={goNext} onBack={goBack} />
      break
    case 5:
      stepComponent = <ConfigureAuthStep onNext={goNext} onBack={goBack} />
      break
    case 6:
      stepComponent = <ConfigurePricingStep onNext={goNext} onBack={goBack} />
      break
    case 7:
      stepComponent = <AddPaymentsStep onNext={goNext} onBack={goBack} />
      break
    case 8:
      stepComponent = <SitemapBuilderStep onNext={goNext} onBack={goBack} />
      break
    case 9:
      stepComponent = <AddStorageStep onNext={goNext} onBack={goBack} />
      break
    case 10:
      stepComponent = <AddDatabaseStep onNext={goNext} onBack={goBack} />
      break
    case 11:
      stepComponent = <AddHostingStep onNext={goNext} onBack={goBack} />
      break
    case 12:
      stepComponent = <SetupCompleteStep onRestart={restart} />
      break
    default:
      stepComponent = null
  }

  return (
    <div className="relative min-h-screen">
      <PageHeader />
      {isMobile && (
        <div className="w-full px-4 pt-4">
          <VerticalProgressBar
            steps={steps}
            currentStep={currentStep}
            onPrev={goBack}
            onNext={goNext}
            canGoBack={currentStep > 0}
            canGoNext={currentStep < steps.length - 1}
          />
        </div>
      )}
      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} min-h-[calc(100vh-8rem)] px-8`}>
        {!isMobile && (
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
        )}
        <div className="flex-1 flex items-center justify-center">
          {stepComponent}
        </div>
      </div>
    </div>
  )
} 