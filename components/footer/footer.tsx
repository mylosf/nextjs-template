import React from 'react'

const footerLinks = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Documentation', href: '#docs' },
    { name: 'API Reference', href: '#api' },
  ],
  company: [
    { name: 'About Us', href: '#about' },
    { name: 'Careers', href: '#careers' },
    { name: 'Blog', href: '#blog' },
    { name: 'Press', href: '#press' },
  ],
  resources: [
    { name: 'Help Center', href: '#help' },
    { name: 'Community', href: '#community' },
    { name: 'Tutorials', href: '#tutorials' },
    { name: 'Changelog', href: '#changelog' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '#privacy' },
    { name: 'Terms of Service', href: '#terms' },
    { name: 'Cookie Policy', href: '#cookies' },
    { name: 'GDPR', href: '#gdpr' },
  ],
}

const socialLinks = [
  { name: 'Twitter', href: '#', icon: '𝕏' },
  { name: 'GitHub', href: '#', icon: '🐙' },
  { name: 'LinkedIn', href: '#', icon: '💼' },
  { name: 'Discord', href: '#', icon: '💬' },
]

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-8 h-8 rounded-lg mr-3"></div>
              <span className="text-2xl font-bold">Schiffer</span>
            </div>
            <p className="text-slate-400 mb-6 max-w-sm">
              Building the future of digital experiences with cutting-edge technology and exceptional design.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-xl"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          {/* Links Sections */}
          <FooterSection title="Product" links={footerLinks.product} />
          <FooterSection title="Company" links={footerLinks.company} />
          <FooterSection title="Resources" links={footerLinks.resources} />
          <FooterSection title="Legal" links={footerLinks.legal} />
        </div>
        
        {/* Newsletter Signup */}
        <div className="border-t border-slate-800 mt-12 pt-12">
          <div className="max-w-md mx-auto text-center lg:max-w-none lg:text-left lg:flex lg:items-center lg:justify-between">
            <div className="lg:flex-1">
              <h3 className="text-lg font-semibold mb-2">Stay updated</h3>
              <p className="text-slate-400">
                Get the latest news and updates delivered to your inbox.
              </p>
            </div>
            <div className="mt-6 lg:mt-0 lg:ml-8 lg:flex-shrink-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © 2024 Schiffer. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex items-center space-x-6">
            <span className="text-slate-400 text-sm">Made with ❤️ by our team</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterSection({ title, links }: { title: string, links: Array<{ name: string, href: string }> }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <a
              href={link.href}
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
} 