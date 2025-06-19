import React from 'react'

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center rounded-full bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300 ring-1 ring-purple-500/20 mb-8">
            <span className="mr-2">🚀</span>
            Welcome to the future
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
            {{page1_component2_text2}}
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Extraordinary
            </span>
          </h1>
          
          {/* Description */}
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Transform your ideas into reality with our powerful platform. 
            Join thousands of creators who are already building the next generation of digital experiences.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
              Get Started Free
            </button>
            <button className="border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 font-semibold py-4 px-8 rounded-lg transition-all duration-200">
              Watch Demo
            </button>
          </div>
          
          {/* Social Proof */}
          <div className="mt-16 pt-8 border-t border-slate-800">
            <p className="text-slate-400 text-sm mb-6">Trusted by teams at</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="bg-slate-800 px-6 py-3 rounded-lg">
                <span className="text-slate-300 font-semibold">Company A</span>
              </div>
              <div className="bg-slate-800 px-6 py-3 rounded-lg">
                <span className="text-slate-300 font-semibold">Company B</span>
              </div>
              <div className="bg-slate-800 px-6 py-3 rounded-lg">
                <span className="text-slate-300 font-semibold">Company C</span>
              </div>
              <div className="bg-slate-800 px-6 py-3 rounded-lg">
                <span className="text-slate-300 font-semibold">Company D</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-500/20 rounded-full blur-xl"></div>
    </section>
  )
} 
