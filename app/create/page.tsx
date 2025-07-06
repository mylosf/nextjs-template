"use client"

import React, { useState } from 'react'
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
  const [formData, setFormData] = useState({
    projectName: '',
    isWebApp: null as boolean | null,
    description: '',
    media: {},
    design: {},
    auth: {},
    pricing: {},
    payments: {},
    sitemap: {},
    storage: {},
    database: {},
    hosting: {},
  });
  const isMobile = useIsMobile()

  // Navigation
  const goNext = () => setCurrentStep(s => Math.min(s + 1, steps.length - 1))
  const goBack = () => setCurrentStep(s => Math.max(s - 1, 0))
  const restart = () => {
    setCurrentStep(0)
    setFormData({
      projectName: '',
      isWebApp: null,
      description: '',
      media: {},
      design: {},
      auth: {},
      pricing: {},
      payments: {},
      sitemap: {},
      storage: {},
      database: {},
      hosting: {},
    })
  }

  // Render step
  let stepComponent = null
  switch (currentStep) {
    case 0:
      stepComponent = (
        <BasicProjectNameStep
          projectName={formData.projectName}
          onChange={val => setFormData(f => ({ ...f, projectName: val }))}
          onNext={goNext}
          canProceed={formData.projectName.trim().length > 0}
        />
      )
      break
    case 1:
      stepComponent = (
        <WebsiteTypeStep
          isWebApp={formData.isWebApp}
          onChange={val => setFormData(f => ({ ...f, isWebApp: val }))}
          onNext={goNext}
          canProceed={formData.isWebApp !== null}
        />
      )
      break
    case 2:
      stepComponent = (
        <ProjectDescriptionStep
          isWebApp={formData.isWebApp}
          description={formData.description}
          onChange={val => setFormData(f => ({ ...f, description: val }))}
          onNext={goNext}
          canProceed={formData.description.trim().length > 0}
        />
      )
      break
    case 3:
      stepComponent = <AddMediaStep onNext={goNext} onBack={goBack} setData={data => setFormData(f => ({ ...f, media: data }))} />
      break
    case 4:
      stepComponent = <ChooseDesignStep onNext={goNext} onBack={goBack} setData={data => setFormData(f => ({ ...f, design: data }))} />
      break
    case 5:
      stepComponent = <ConfigureAuthStep onNext={goNext} onBack={goBack} setData={data => setFormData(f => ({ ...f, auth: data }))} />
      break
    case 6:
      stepComponent = <ConfigurePricingStep onNext={goNext} onBack={goBack} setData={data => setFormData(f => ({ ...f, pricing: data }))} />
      break
    case 7:
      stepComponent = <AddPaymentsStep onNext={goNext} onBack={goBack} setData={data => setFormData(f => ({ ...f, payments: data }))} />
      break
    case 8:
      stepComponent = <SitemapBuilderStep onNext={goNext} onBack={goBack} setData={data => setFormData(f => ({ ...f, sitemap: data }))} />
      break
    case 9:
      stepComponent = <AddStorageStep onNext={goNext} onBack={goBack} setData={data => setFormData(f => ({ ...f, storage: data }))} />
      break
    case 10:
      stepComponent = <AddDatabaseStep onNext={goNext} onBack={goBack} setData={data => setFormData(f => ({ ...f, database: data }))} />
      break
    case 11:
      stepComponent = <AddHostingStep onNext={goNext} onBack={goBack} setData={data => setFormData(f => ({ ...f, hosting: data }))} />
      break
    case 12:
      stepComponent = <SetupCompleteStep onRestart={restart} formData={formData} />
      break
    default:
      stepComponent = null
  }

  return (
    <div className="relative min-h-screen">
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