import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Shuffle, Sun, Moon, Palette, Send } from 'lucide-react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

const DEFAULT_NEUTRALS = [
  '#ffffff', '#f3f3f3', '#e5e5e5', '#cccccc', '#999999', '#666666', '#222222', '#000000'
]



function generateNeutralShades(baseColor: string) {
  // Convert hex to RGB
  const r = parseInt(baseColor.slice(1, 3), 16)
  const g = parseInt(baseColor.slice(3, 5), 16)
  const b = parseInt(baseColor.slice(5, 7), 16)
  
  // Calculate luminance to determine how dark the base color is
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Determine position of base color in the 8-shade scale (0-7)
  // Lighter colors go towards the beginning, darker colors towards the end
  const basePosition = Math.round((1 - luminance) * 6) + 1 // Position 1-7, leaving 0 for very light
  
  const shades = []
  
  for (let i = 0; i < 8; i++) {
    if (i === basePosition) {
      // Use the exact base color at its calculated position
      shades.push(baseColor)
    } else if (i < basePosition) {
      // Generate lighter shades before the base color
      const lightnessFactor = (basePosition - i) / basePosition
      const newR = Math.round(r + (255 - r) * lightnessFactor)
      const newG = Math.round(g + (255 - g) * lightnessFactor)
      const newB = Math.round(b + (255 - b) * lightnessFactor)
      
      const hex = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
      shades.push(hex)
    } else {
      // Generate darker shades after the base color
      const darknessFactor = (i - basePosition) / (7 - basePosition)
      const newR = Math.round(r * (1 - darknessFactor))
      const newG = Math.round(g * (1 - darknessFactor))
      const newB = Math.round(b * (1 - darknessFactor))
      
      const hex = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
      shades.push(hex)
    }
  }
  
  // Ensure first shade is very light and last shade is very dark
  shades[0] = '#ffffff' // Always start with white
  shades[7] = '#000000' // Always end with black
  
  return shades
}

const PALETTES = [
  {
    name: 'Cerise Red',
    hex: '#DC2F4E',
    shades: ['#F8B6C2', '#F36A8C', '#DC2F4E', '#A01B2A', '#6B0F1A'],
  },
  {
    name: 'Wild Blue Yonder',
    hex: '#7A80B9',
    shades: ['#D1D3E6', '#AEB2D1', '#7A80B9', '#4B4F7A', '#2C2E4B'],
  },
  {
    name: 'Madison',
    hex: '#0E2466',
    shades: ['#B3B9D6', '#4B5A99', '#0E2466', '#09153A', '#060B1A'],
  },
]

function randomHex() {
  return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`
}

function randomPalette() {
  const base = randomHex()
  return {
    name: 'Custom',
    hex: base,
    shades: [
      randomHex(),
      randomHex(),
      base,
      randomHex(),
      randomHex(),
    ],
  }
}

interface Props {
  onNext: () => void;
  onBack?: () => void;
  setData?: (data: any) => void;
}

const AddColorPicker = ({ onColorSelect, onClose, colorName, setColorName }: { 
  onColorSelect: (color: string) => void, 
  onClose: () => void,
  colorName: string,
  setColorName: (name: string) => void
}) => {
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(50)
  const [value, setValue] = useState(50)
  const [hexValue, setHexValue] = useState('#808080')
  const [isDraggingHue, setIsDraggingHue] = useState(false)
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hueCanvasRef = useRef<HTMLCanvasElement>(null)
  
  // Convert HSV to RGB
  const hsvToRgb = (h: number, s: number, v: number) => {
    h = h / 360
    s = s / 100
    v = v / 100
    
    const c = v * s
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
    const m = v - c
    
    let r = 0, g = 0, b = 0
    
    if (h < 1/6) { r = c; g = x; b = 0 }
    else if (h < 2/6) { r = x; g = c; b = 0 }
    else if (h < 3/6) { r = 0; g = c; b = x }
    else if (h < 4/6) { r = 0; g = x; b = c }
    else if (h < 5/6) { r = x; g = 0; b = c }
    else { r = c; g = 0; b = x }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    }
  }
  
  // Convert RGB to Hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }
  
  // Check if color is light (for text color)
  const isLightColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5
  }
  
  // Convert Hex to HSV
  const hexToHsv = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min
    
    let h = 0
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6
      else if (max === g) h = (b - r) / diff + 2
      else h = (r - g) / diff + 4
    }
    h = Math.round(h * 60)
    if (h < 0) h += 360
    
    const s = max === 0 ? 0 : Math.round((diff / max) * 100)
    const v = Math.round(max * 100)
    
    return { h, s, v }
  }
  
  // Update hex value when HSV changes
  useEffect(() => {
    const rgb = hsvToRgb(hue, saturation, value)
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    setHexValue(hex)
  }, [hue, saturation, value])
  
  // Draw color picker canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // Create saturation-value gradient
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const s = (x / width) * 100
        const v = ((height - y) / height) * 100
        const rgb = hsvToRgb(hue, s, v)
        
        const index = (y * width + x) * 4
        data[index] = rgb.r     // R
        data[index + 1] = rgb.g // G
        data[index + 2] = rgb.b // B
        data[index + 3] = 255   // A
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
  }, [hue])
  
  // Draw hue slider
  useEffect(() => {
    const canvas = hueCanvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop(0, '#ff0000')
    gradient.addColorStop(1/6, '#ffff00')
    gradient.addColorStop(2/6, '#00ff00')
    gradient.addColorStop(3/6, '#00ffff')
    gradient.addColorStop(4/6, '#0000ff')
    gradient.addColorStop(5/6, '#ff00ff')
    gradient.addColorStop(1, '#ff0000')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }, [])
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const newSaturation = (x / rect.width) * 100
    const newValue = ((rect.height - y) / rect.height) * 100
    
    setSaturation(Math.max(0, Math.min(100, newSaturation)))
    setValue(Math.max(0, Math.min(100, newValue)))
  }
  
  const handleHueClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = hueCanvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const newHue = (x / rect.width) * 360
    
    setHue(Math.max(0, Math.min(360, newHue)))
  }
  
  const handleHueMouseDown = (e: React.MouseEvent) => {
    setIsDraggingHue(true)
    handleHueClick(e as React.MouseEvent<HTMLCanvasElement>)
  }
  
  const handleHueMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingHue) return
    handleHueClick(e as React.MouseEvent<HTMLCanvasElement>)
  }
  
  const handleHueMouseUp = () => {
    setIsDraggingHue(false)
  }
  
  // Canvas dragging handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDraggingCanvas(true)
    handleCanvasClick(e)
  }
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingCanvas) return
    handleCanvasClick(e)
  }
  
  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false)
  }
  
  // Selection point dragging handler
  const handlePointMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setIsDraggingCanvas(true)
  }
  
  // Add global mouse event listeners for hue dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingHue) return
      const canvas = hueCanvasRef.current
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const newHue = (x / rect.width) * 360
      
      setHue(Math.max(0, Math.min(360, newHue)))
    }
    
    const handleGlobalMouseUp = () => {
      setIsDraggingHue(false)
    }
    
    if (isDraggingHue) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDraggingHue])
  
  // Add global mouse event listeners for canvas dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingCanvas) return
      const canvas = canvasRef.current
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const newSaturation = (x / rect.width) * 100
      const newValue = ((rect.height - y) / rect.height) * 100
      
      setSaturation(Math.max(0, Math.min(100, newSaturation)))
      setValue(Math.max(0, Math.min(100, newValue)))
    }
    
    const handleGlobalMouseUp = () => {
      setIsDraggingCanvas(false)
    }
    
    if (isDraggingCanvas) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDraggingCanvas])
  
  const handleHexChange = (value: string) => {
    setHexValue(value)
    if (value.match(/^#[0-9A-F]{6}$/i)) {
      const hsv = hexToHsv(value)
      setHue(hsv.h)
      setSaturation(hsv.s)
      setValue(hsv.v)
    }
  }
  
  const handleApply = () => {
    onColorSelect(hexValue)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-gray-900 border border-gray-700 p-8 rounded-2xl shadow-2xl max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 flex-1">
            <Plus className="h-5 w-5 text-white" />
            <input
              type="text"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-lg placeholder-gray-400 focus:border-blue-400 focus:outline-none"
              placeholder="Enter color name..."
              maxLength={50}
            />
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-gray-400 hover:text-white text-2xl p-2 ml-3"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>
        
        {/* Color Picker Canvas */}
        <div className="mb-6 relative">
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="w-full h-80 rounded-xl cursor-crosshair"
            onClick={handleCanvasClick}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
          />
          {/* Selection Point */}
          <div 
            className={`absolute w-3 h-3 border-2 border-white rounded-full shadow-lg cursor-pointer ${isDraggingCanvas ? 'scale-125' : ''} transition-transform`}
            style={{ 
              left: `${saturation}%`, 
              top: `${100 - value}%`,
              transform: 'translate(-50%, -50%)'
            }}
            onMouseDown={handlePointMouseDown}
          />
        </div>
        
        {/* Hue Slider */}
        <div className="mb-6 relative">
          <canvas
            ref={hueCanvasRef}
            width={400}
            height={20}
            className="w-full h-5 rounded-lg border border-gray-600 cursor-pointer"
            onClick={handleHueClick}
            onMouseDown={handleHueMouseDown}
            onMouseMove={handleHueMouseMove}
            onMouseUp={handleHueMouseUp}
          />
          {/* Hue Slider Button */}
          <div 
            className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-6 bg-white border-2 border-gray-800 rounded-sm shadow-lg cursor-pointer ${isDraggingHue ? 'scale-110' : ''} transition-transform`}
            style={{ left: `${(hue / 360) * 100}%`, transform: 'translateX(-50%) translateY(-50%)' }}
            onMouseDown={handleHueMouseDown}
          />
        </div>
        
        {/* Hex Input */}
        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-300 whitespace-nowrap">
            Hex Code
          </label>
          <input
            type="text"
            value={hexValue}
            onChange={(e) => handleHexChange(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:border-blue-400 focus:outline-none"
            placeholder="#000000"
            maxLength={7}
          />
        </div>
        
        {/* Add Color Button */}
        <div className="flex justify-center">
          <Button 
            className="w-full py-3 text-lg font-medium"
            style={{ 
              backgroundColor: hexValue,
              color: isLightColor(hexValue) ? '#000000' : '#ffffff'
            }}
            onClick={handleApply}
          >
            Add Color
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ChooseDesignStep({ onNext, onBack, setData }: Props) {
  const [palettes, setPalettes] = useState(PALETTES)
  const [selected, setSelected] = useState(palettes[0].hex)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [neutrals, setNeutrals] = useState(DEFAULT_NEUTRALS)
  const [showNeutralPicker, setShowNeutralPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState<number | null>(null)
  const [showAddColorPicker, setShowAddColorPicker] = useState(false)
  const [newColorName, setNewColorName] = useState('')
  const colorInputRef = useRef<HTMLInputElement>(null)
  const neutralColorInputRef = useRef<HTMLInputElement>(null)

  const handleShuffle = () => {
    setPalettes([
      ...palettes.slice(0, 1),
      ...[1, 2].map(() => randomPalette()),
    ])
    setSelected(palettes[0].hex)
  }

  const handleAddColor = () => {
    setShowAddColorPicker(true)
    setNewColorName('')
  }

  const handleAddCustomColor = (color: string) => {
    const colorName = newColorName.trim() || 'Custom Color'
    
    // Generate color shades based on the selected color
    const generateColorShades = (baseColor: string) => {
      // Convert hex to RGB
      const r = parseInt(baseColor.slice(1, 3), 16)
      const g = parseInt(baseColor.slice(3, 5), 16)
      const b = parseInt(baseColor.slice(5, 7), 16)
      
      // Generate 5 shades from lighter to darker
      const shades = []
      for (let i = 0; i < 5; i++) {
        const factor = 0.2 + (i * 0.2) // 0.2, 0.4, 0.6, 0.8, 1.0
        const newR = Math.round(r * factor)
        const newG = Math.round(g * factor)
        const newB = Math.round(b * factor)
        
        const hex = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
        shades.push(hex)
      }
      
      return shades
    }
    
    const newPalette = {
      name: colorName,
      hex: color,
      shades: generateColorShades(color),
    }
    setPalettes([...palettes, newPalette])
    setShowAddColorPicker(false)
    setNewColorName('')
    setSelected(color)
  }

  const handleColorChange = (idx: number, color: string) => {
    setPalettes(palettes => palettes.map((p, i) => i === idx ? { ...p, hex: color, shades: [color, ...p.shades.slice(1)] } : p))
    setSelected(color)
  }

  const handleCustomColorChange = (idx: number, color: string) => {
    setPalettes(palettes => palettes.map((p, i) => i === idx ? { ...p, hex: color, shades: [color, ...p.shades.slice(1)] } : p))
    setSelected(color)
    setShowColorPicker(null)
  }

  const handleNeutralColorChange = (color: string) => {
    const newNeutrals = generateNeutralShades(color)
    setNeutrals(newNeutrals)
    setShowNeutralPicker(false)
  }



  const CustomColorPicker = ({ onColorSelect, onClose }: { onColorSelect: (color: string) => void, onClose: () => void }) => {
    const [hue, setHue] = useState(0)
    const [saturation, setSaturation] = useState(50)
    const [value, setValue] = useState(50)
    const [hexValue, setHexValue] = useState('#808080')
    const [isDraggingHue, setIsDraggingHue] = useState(false)
    const [isDraggingCanvas, setIsDraggingCanvas] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const hueCanvasRef = useRef<HTMLCanvasElement>(null)
    
    // Convert HSV to RGB
    const hsvToRgb = (h: number, s: number, v: number) => {
      h = h / 360
      s = s / 100
      v = v / 100
      
      const c = v * s
      const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
      const m = v - c
      
      let r = 0, g = 0, b = 0
      
      if (h < 1/6) { r = c; g = x; b = 0 }
      else if (h < 2/6) { r = x; g = c; b = 0 }
      else if (h < 3/6) { r = 0; g = c; b = x }
      else if (h < 4/6) { r = 0; g = x; b = c }
      else if (h < 5/6) { r = x; g = 0; b = c }
      else { r = c; g = 0; b = x }
      
      return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
      }
    }
    
    // Convert RGB to Hex
    const rgbToHex = (r: number, g: number, b: number) => {
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }
    
    // Check if color is light (for text color)
    const isLightColor = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      // Calculate luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      return luminance > 0.5
    }
    
    // Convert Hex to HSV
    const hexToHsv = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const diff = max - min
      
      let h = 0
      if (diff !== 0) {
        if (max === r) h = ((g - b) / diff) % 6
        else if (max === g) h = (b - r) / diff + 2
        else h = (r - g) / diff + 4
      }
      h = Math.round(h * 60)
      if (h < 0) h += 360
      
      const s = max === 0 ? 0 : Math.round((diff / max) * 100)
      const v = Math.round(max * 100)
      
      return { h, s, v }
    }
    
    // Update hex value when HSV changes
    useEffect(() => {
      const rgb = hsvToRgb(hue, saturation, value)
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
      setHexValue(hex)
    }, [hue, saturation, value])
    
    // Draw color picker canvas
    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      const width = canvas.width
      const height = canvas.height
      
      // Create saturation-value gradient
      const imageData = ctx.createImageData(width, height)
      const data = imageData.data
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const s = (x / width) * 100
          const v = ((height - y) / height) * 100
          const rgb = hsvToRgb(hue, s, v)
          
          const index = (y * width + x) * 4
          data[index] = rgb.r     // R
          data[index + 1] = rgb.g // G
          data[index + 2] = rgb.b // B
          data[index + 3] = 255   // A
        }
      }
      
      ctx.putImageData(imageData, 0, 0)
    }, [hue])
    
    // Draw hue slider
    useEffect(() => {
      const canvas = hueCanvasRef.current
      if (!canvas) return
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      const width = canvas.width
      const height = canvas.height
      
      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, '#ff0000')
      gradient.addColorStop(1/6, '#ffff00')
      gradient.addColorStop(2/6, '#00ff00')
      gradient.addColorStop(3/6, '#00ffff')
      gradient.addColorStop(4/6, '#0000ff')
      gradient.addColorStop(5/6, '#ff00ff')
      gradient.addColorStop(1, '#ff0000')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }, [])
    
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const newSaturation = (x / rect.width) * 100
      const newValue = ((rect.height - y) / rect.height) * 100
      
      setSaturation(Math.max(0, Math.min(100, newSaturation)))
      setValue(Math.max(0, Math.min(100, newValue)))
    }
    
    const handleHueClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = hueCanvasRef.current
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const newHue = (x / rect.width) * 360
      
      setHue(Math.max(0, Math.min(360, newHue)))
    }
    
    const handleHueMouseDown = (e: React.MouseEvent) => {
      setIsDraggingHue(true)
      handleHueClick(e as React.MouseEvent<HTMLCanvasElement>)
    }
    
    const handleHueMouseMove = (e: React.MouseEvent) => {
      if (!isDraggingHue) return
      handleHueClick(e as React.MouseEvent<HTMLCanvasElement>)
    }
    
    const handleHueMouseUp = () => {
      setIsDraggingHue(false)
    }
    
    // Canvas dragging handlers
    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      setIsDraggingCanvas(true)
      handleCanvasClick(e)
    }
    
    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDraggingCanvas) return
      handleCanvasClick(e)
    }
    
    const handleCanvasMouseUp = () => {
      setIsDraggingCanvas(false)
    }
    
    // Selection point dragging handler
    const handlePointMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation()
      setIsDraggingCanvas(true)
    }
    
    // Add global mouse event listeners for hue dragging
    useEffect(() => {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!isDraggingHue) return
        const canvas = hueCanvasRef.current
        if (!canvas) return
        
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const newHue = (x / rect.width) * 360
        
        setHue(Math.max(0, Math.min(360, newHue)))
      }
      
      const handleGlobalMouseUp = () => {
        setIsDraggingHue(false)
      }
      
      if (isDraggingHue) {
        document.addEventListener('mousemove', handleGlobalMouseMove)
        document.addEventListener('mouseup', handleGlobalMouseUp)
      }
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }, [isDraggingHue])
    
    // Add global mouse event listeners for canvas dragging
    useEffect(() => {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!isDraggingCanvas) return
        const canvas = canvasRef.current
        if (!canvas) return
        
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        const newSaturation = (x / rect.width) * 100
        const newValue = ((rect.height - y) / rect.height) * 100
        
        setSaturation(Math.max(0, Math.min(100, newSaturation)))
        setValue(Math.max(0, Math.min(100, newValue)))
      }
      
      const handleGlobalMouseUp = () => {
        setIsDraggingCanvas(false)
      }
      
      if (isDraggingCanvas) {
        document.addEventListener('mousemove', handleGlobalMouseMove)
        document.addEventListener('mouseup', handleGlobalMouseUp)
      }
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }, [isDraggingCanvas])
    
    const handleHexChange = (value: string) => {
      setHexValue(value)
      if (value.match(/^#[0-9A-F]{6}$/i)) {
        const hsv = hexToHsv(value)
        setHue(hsv.h)
        setSaturation(hsv.s)
        setValue(hsv.v)
      }
    }
    
    const handleApply = () => {
      onColorSelect(hexValue)
      onClose()
    }

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100]">
        <div className="bg-gray-900 border border-gray-700 p-8 rounded-2xl shadow-2xl max-w-2xl w-full mx-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-white" />
              <span className="text-lg font-medium text-white">Choose Base Color</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-white text-2xl p-2"
              onClick={onClose}
            >
              ✕
            </Button>
          </div>
          
          {/* Color Picker Canvas */}
          <div className="mb-6 relative">
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="w-full h-80 rounded-xl cursor-crosshair"
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            />
            {/* Selection Point */}
            <div 
              className={`absolute w-3 h-3 border-2 border-white rounded-full shadow-lg cursor-pointer ${isDraggingCanvas ? 'scale-125' : ''} transition-transform`}
              style={{ 
                left: `${saturation}%`, 
                top: `${100 - value}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onMouseDown={handlePointMouseDown}
            />
          </div>
          
          {/* Hue Slider */}
          <div className="mb-6 relative">
            <canvas
              ref={hueCanvasRef}
              width={400}
              height={20}
              className="w-full h-5 rounded-lg border border-gray-600 cursor-pointer"
              onClick={handleHueClick}
              onMouseDown={handleHueMouseDown}
              onMouseMove={handleHueMouseMove}
              onMouseUp={handleHueMouseUp}
            />
            {/* Hue Slider Button */}
            <div 
              className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-6 bg-white border-2 border-gray-800 rounded-sm shadow-lg cursor-pointer ${isDraggingHue ? 'scale-110' : ''} transition-transform`}
              style={{ left: `${(hue / 360) * 100}%`, transform: 'translateX(-50%) translateY(-50%)' }}
              onMouseDown={handleHueMouseDown}
            />
          </div>
          
          {/* Hex Input */}
          <div className="mb-6 flex items-center gap-4">
            <label className="text-sm font-medium text-gray-300 whitespace-nowrap">
              Hex Code
            </label>
            <input
              type="text"
              value={hexValue}
              onChange={(e) => handleHexChange(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:border-blue-400 focus:outline-none"
              placeholder="#000000"
              maxLength={7}
            />
          </div>
          
          {/* Apply Button */}
          <div className="flex justify-center">
            <Button 
              className="w-full py-3 text-lg font-medium"
              style={{ 
                backgroundColor: hexValue,
                color: isLightColor(hexValue) ? '#000000' : '#ffffff'
              }}
              onClick={handleApply}
            >
              Apply Color
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-5xl mx-auto ${theme === 'dark' ? 'bg-[#18181b]' : 'bg-white'} rounded-xl p-8 transition-colors`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Colors</h2>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button size="icon" variant="outline" onClick={handleShuffle} aria-label="Shuffle colors">
            <Shuffle className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <ResizablePanelGroup direction="horizontal" className="w-full h-[340px]">
        {/* Neutrals Palette */}
        <ResizablePanel defaultSize={18} minSize={18} maxSize={18}>
          <div className="flex flex-col items-center justify-start h-full">
            <div
              className="rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-700 flex flex-col w-20 cursor-pointer hover:border-blue-400 transition-all relative"
              style={{ height: 264 }}
              onClick={() => setShowNeutralPicker(true)}
            >
              {neutrals.map((c: string, i: number) => (
                <div key={c} className="w-full flex-1" style={{ background: c }} />
              ))}
              {/* Add a subtle overlay to indicate it's clickable */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                <Palette className="h-5 w-5 text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Neutrals</span>
            </div>
          </div>
        </ResizablePanel>
        {/* Color Cards Grid */}
        <ResizablePanel defaultSize={82} minSize={82} maxSize={82}>
          <div className="grid grid-cols-2 gap-6 h-full ml-1 overflow-y-auto">
            {/* Render all palettes dynamically */}
            {palettes.map((palette, index) => {
              const colorLabels = ['Background Colour', 'Main Colour', 'Accent Colour']
              const colorLabel = index < 3 ? colorLabels[index] : palette.name
              
              return (
                <div
                  key={palette.hex + '-' + index}
                  className="relative rounded-2xl p-4 flex flex-col justify-between shadow cursor-pointer transition-all min-h-[120px]"
                  style={{ background: palette.hex }}
                  onClick={() => { setSelected(palette.hex); setShowColorPicker(index); }}
              >
                <div className="flex-1 flex flex-col justify-between">
                    <div className="text-white text-lg truncate mb-2 drop-shadow">{colorLabel}</div>
                    <div className="text-white text-sm font-mono drop-shadow">{palette.hex.toUpperCase()}</div>
                  </div>
                </div>
              )
            })}
            
            {/* Add Color Button */}
            <button
              type="button"
              className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-400 transition-all min-h-[120px]"
              onClick={handleAddColor}
            >
              <Plus className="h-8 w-8" />
            </button>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <div className="flex justify-end mt-8 gap-2">
        <Button onClick={() => { onNext(); if (setData) setData(palettes); }} disabled={!selected}>
          <Send className="h-4 w-4 mr-2" />
          Continue
        </Button>
      </div>
      
      {/* Neutral Color Picker Overlay */}
      {showNeutralPicker && (
        <CustomColorPicker
          onColorSelect={handleNeutralColorChange}
          onClose={() => setShowNeutralPicker(false)}
        />
      )}
      
      {/* Regular Color Picker Overlay */}
      {showColorPicker !== null && (
        <CustomColorPicker
          onColorSelect={(color) => handleCustomColorChange(showColorPicker, color)}
          onClose={() => setShowColorPicker(null)}
        />
      )}
      
      {/* Add Color Picker Overlay */}
      {showAddColorPicker && (
        <AddColorPicker 
          onColorSelect={handleAddCustomColor}
          onClose={() => setShowAddColorPicker(false)}
          colorName={newColorName}
          setColorName={setNewColorName}
        />
      )}
    </div>
  )
} 