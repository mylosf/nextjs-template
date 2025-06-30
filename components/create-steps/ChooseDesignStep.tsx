import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Shuffle, Sun, Moon } from 'lucide-react'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

const NEUTRALS = [
  '#ffffff', '#f3f3f3', '#e5e5e5', '#cccccc', '#999999', '#666666', '#222222', '#000000'
]

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

export default function ChooseDesignStep({ onNext, onBack, setData }: Props) {
  const [palettes, setPalettes] = useState(PALETTES)
  const [selected, setSelected] = useState(palettes[0].hex)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [pickerIdx, setPickerIdx] = useState<number | null>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)

  const handleShuffle = () => {
    setPalettes([
      ...palettes.slice(0, 1),
      ...[1, 2].map(() => randomPalette()),
    ])
    setSelected(palettes[0].hex)
  }

  const handleAddColor = () => {
    const newPalette = randomPalette()
    setPalettes([...palettes, newPalette])
  }

  const handleColorChange = (idx: number, color: string) => {
    setPalettes(palettes => palettes.map((p, i) => i === idx ? { ...p, hex: color, shades: [color, ...p.shades.slice(1)] } : p))
    setSelected(color)
    setPickerIdx(null)
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
              className="rounded-2xl overflow-hidden border border-gray-300 dark:border-gray-700 flex flex-col justify-center w-20"
              style={{ height: 264 }}
            >
              {NEUTRALS.map((c, i) => (
                <div key={c} className="w-full h-6" style={{ background: c }} />
              ))}
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Neutrals</span>
            </div>
          </div>
        </ResizablePanel>
        {/* Color Cards Grid */}
        <ResizablePanel defaultSize={82} minSize={82} maxSize={82}>
          <div className="grid grid-cols-2 grid-rows-2 gap-6 h-full ml-1">
            {/* Background, Main, Accent, Add color cards as before */}
            {palettes[0] && (
              <div
                key={palettes[0].hex + '-bg'}
                className={`relative rounded-2xl p-4 flex flex-col justify-between shadow cursor-pointer transition-all border-2 col-span-1 row-span-1 ${
                  selected === palettes[0].hex
                    ? 'border-blue-400'
                    : 'border-transparent'
                }`}
                style={{ background: palettes[0].hex }}
                onClick={() => { setSelected(palettes[0].hex); setPickerIdx(0); }}
              >
                <div className="flex-1 flex flex-col justify-between">
                  <div className="text-white text-lg font-semibold truncate mb-2 drop-shadow">Background Colour</div>
                  <div className="text-white text-xl font-mono mb-2 drop-shadow">{palettes[0].hex.toUpperCase()}</div>
                  <div className="flex gap-1 mb-2">
                    {palettes[0].shades.map((s, i) => (
                      <div key={i} className="h-2 w-6 rounded" style={{ background: s }} />
                    ))}
                  </div>
                </div>
                {selected === palettes[0].hex && (
                  <div className="absolute top-2 right-2 bg-blue-400 text-xs text-white px-2 py-1 rounded shadow">Main</div>
                )}
                {pickerIdx === 0 && (
                  <input
                    ref={colorInputRef}
                    type="color"
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    value={palettes[0].hex}
                    onChange={e => handleColorChange(0, e.target.value)}
                    onBlur={() => setPickerIdx(null)}
                    autoFocus
                  />
                )}
              </div>
            )}
            {palettes[1] && (
              <div
                key={palettes[1].hex + '-main'}
                className={`relative rounded-2xl p-4 flex flex-col justify-between shadow cursor-pointer transition-all border-2 col-span-1 row-span-1 ${
                  selected === palettes[1].hex
                    ? 'border-blue-400'
                    : 'border-transparent'
                }`}
                style={{ background: palettes[1].hex }}
                onClick={() => { setSelected(palettes[1].hex); setPickerIdx(1); }}
              >
                <div className="flex-1 flex flex-col justify-between">
                  <div className="text-white text-lg font-semibold truncate mb-2 drop-shadow">Main Colour</div>
                  <div className="text-white text-xl font-mono mb-2 drop-shadow">{palettes[1].hex.toUpperCase()}</div>
                  <div className="flex gap-1 mb-2">
                    {palettes[1].shades.map((s, i) => (
                      <div key={i} className="h-2 w-6 rounded" style={{ background: s }} />
                    ))}
                  </div>
                </div>
                {selected === palettes[1].hex && (
                  <div className="absolute top-2 right-2 bg-blue-400 text-xs text-white px-2 py-1 rounded shadow">Main</div>
                )}
                {pickerIdx === 1 && (
                  <input
                    ref={colorInputRef}
                    type="color"
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    value={palettes[1].hex}
                    onChange={e => handleColorChange(1, e.target.value)}
                    onBlur={() => setPickerIdx(null)}
                    autoFocus
                  />
                )}
              </div>
            )}
            {palettes[2] && (
              <div
                key={palettes[2].hex + '-accent'}
                className={`relative rounded-2xl p-4 flex flex-col justify-between shadow cursor-pointer transition-all border-2 col-span-1 row-span-1 ${
                  selected === palettes[2].hex
                    ? 'border-blue-400'
                    : 'border-transparent'
                }`}
                style={{ background: palettes[2].hex }}
                onClick={() => { setSelected(palettes[2].hex); setPickerIdx(2); }}
              >
                <div className="flex-1 flex flex-col justify-between">
                  <div className="text-white text-lg font-semibold truncate mb-2 drop-shadow">Accent Colour</div>
                  <div className="text-white text-xl font-mono mb-2 drop-shadow">{palettes[2].hex.toUpperCase()}</div>
                  <div className="flex gap-1 mb-2">
                    {palettes[2].shades.map((s, i) => (
                      <div key={i} className="h-2 w-6 rounded" style={{ background: s }} />
                    ))}
                  </div>
                </div>
                {selected === palettes[2].hex && (
                  <div className="absolute top-2 right-2 bg-blue-400 text-xs text-white px-2 py-1 rounded shadow">Main</div>
                )}
                {pickerIdx === 2 && (
                  <input
                    ref={colorInputRef}
                    type="color"
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    value={palettes[2].hex}
                    onChange={e => handleColorChange(2, e.target.value)}
                    onBlur={() => setPickerIdx(null)}
                    autoFocus
                  />
                )}
              </div>
            )}
            <button
              type="button"
              className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-400 transition-all min-h-[120px] col-span-1 row-span-1"
              onClick={handleAddColor}
              style={{ minHeight: 120 }}
            >
              <Plus className="h-8 w-8" />
            </button>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <div className="flex justify-end mt-8 gap-2">
        {onBack && <Button variant="ghost" onClick={onBack}>Back</Button>}
        <Button onClick={() => { onNext(); if (setData) setData(palettes); }} disabled={!selected}>Continue</Button>
      </div>
    </div>
  )
} 