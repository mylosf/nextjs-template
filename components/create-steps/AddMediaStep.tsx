import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

interface Props {
  onNext: () => void
  onBack?: () => void
  setData?: (data: { logo: string | null, favicon: string | null }) => void
}

export default function AddMediaStep({ onNext, onBack, setData }: Props) {
  const [logo, setLogo] = useState<string | null>(null)
  const [favicon, setFavicon] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = ev => setter(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  function handleNext() {
    setData?.({ logo, favicon })
    onNext()
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Add Media</h2>
      <div className="mb-8 text-gray-400">Upload your logo and favicon for your project.</div>
      <div className="flex flex-col gap-8 mb-8">
        <div>
          <label className="block text-white font-medium mb-2">Logo</label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="w-32 h-32 bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 transition-all"
              onClick={() => logoInputRef.current?.click()}
            >
              {logo ? (
                <img src={logo} alt="Logo preview" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <Upload className="h-10 w-10 text-gray-500" />
              )}
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleFileChange(e, setLogo)}
            />
          </div>
        </div>
        <div>
          <label className="block text-white font-medium mb-2">Favicon</label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="w-20 h-20 bg-gray-900 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 transition-all"
              onClick={() => faviconInputRef.current?.click()}
            >
              {favicon ? (
                <img src={favicon} alt="Favicon preview" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <Upload className="h-7 w-7 text-gray-500" />
              )}
            </button>
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleFileChange(e, setFavicon)}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        {onBack && <Button variant="ghost" onClick={onBack}>Back</Button>}
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  )
} 