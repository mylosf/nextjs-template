import React from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { SocialProof } from '../ui/social-proof'

export function Hero() {
  // Content variables
  const page1_component2_text2 = "Build Something"
  const badgeEmoji = "🚀"
  const badgeText = "Welcome to the future"
  const primaryButtonText = "Get Started Free"
  const secondaryButtonText = "Watch Demo"
  const companies = ["Company A", "Company B", "Company C", "ASD D"]
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <Badge emoji={badgeEmoji} text={badgeText} />
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
            {page1_component2_text2}
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Extraordinary
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Transform your ideas into reality with our powerful platform. 
            Join thousands of creators who are already building the next generation of digital asd.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="primary">
              {primaryButtonText}
            </Button>
            <Button variant="secondary">
              {secondaryButtonText}
            </Button>
          </div>
          
          {/* Social Proof */}
          <SocialProof companies={companies} />
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-500/20 rounded-full blur-xl"></div>
    </section>
  )
} 
