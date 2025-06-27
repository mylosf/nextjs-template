import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Send, Globe, ShoppingCart, Shield, Settings } from 'lucide-react'

interface Props {
  isWebApp: boolean | null
  onChange: (value: boolean) => void
  onNext: () => void
  canProceed: boolean
}

const webappIcons = [
  { icon: ShoppingCart, label: 'Web Store' },
  { icon: Shield, label: 'Authentication' },
  { icon: Settings, label: 'Settings' },
]

export default function WebsiteTypeStep({ isWebApp, onChange, onNext, canProceed }: Props) {
  const [webappIconIndex, setWebappIconIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setWebappIconIndex((prev) => (prev + 1) % webappIcons.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[300px]">
      <h2 className="text-xl font-semibold mb-6 text-center">Choose your website type</h2>
      <div className="w-full">
        <div className="flex gap-4 mb-6">
          <Card 
            className={`cursor-pointer transition-all duration-200 flex-1 ring-1 ring-white bg-black rounded-xl ${
              isWebApp === false ? 'ring-4' : 'hover:bg-gray-800'
            }`}
            onClick={() => onChange(false)}
          >
            <CardContent className="p-6 text-center">
              <Globe className="h-6 w-6 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Static Website</h3>
              <p className="text-sm text-gray-400">Simple, fast, and reliable</p>
            </CardContent>
          </Card>
          <Card 
            className={`cursor-pointer transition-all duration-200 flex-1 ring-1 ring-white bg-black rounded-xl ${
              isWebApp === true ? 'ring-4' : 'hover:bg-gray-800'
            }`}
            onClick={() => onChange(true)}
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
          onClick={onNext}
          disabled={isWebApp === null}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          Continue
        </Button>
      </div>
    </div>
  )
} 