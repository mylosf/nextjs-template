import React from 'react'

const features = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Built for speed with modern technologies that deliver exceptional performance across all devices.'
  },
  {
    icon: '🛡️',
    title: 'Secure by Default',
    description: 'Enterprise-grade security with end-to-end encryption and comprehensive data protection.'
  },
  {
    icon: '🎨',
    title: 'Beautifully Designed',
    description: 'Intuitive interface crafted with attention to detail for the best user experience.'
  },
  {
    icon: '🔧',
    title: 'Highly Customizable',
    description: 'Flexible configuration options to adapt to your unique workflow and requirements.'
  },
  {
    icon: '📊',
    title: 'Analytics & Insights',
    description: 'Comprehensive analytics dashboard to track performance and make data-driven decisions.'
  },
  {
    icon: '🌍',
    title: 'Global Scale',
    description: 'Built to scale globally with robust infrastructure and reliable performance worldwide.'
  }
]

export function Features() {
  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Everything you need to
            <span className="block text-purple-600">succeed</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Discover the powerful features that make our platform the choice of industry leaders worldwide.
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-slate-50 rounded-2xl p-8 lg:p-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">
              Ready to get started?
            </h3>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who have transformed their workflow with our platform.
            </p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
              Start Your Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, description }: { icon: string, title: string, description: string }) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 group">
      <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-4">
        {title}
      </h3>
      <p className="text-slate-600 leading-relaxed">
        {description}
      </p>
    </div>
  )
} 