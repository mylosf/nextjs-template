import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Check, Minus, ArrowRight } from 'lucide-react'

interface PricingCard {
  name: string
  price: string
  features: string[]
}

interface Props {
  onNext: () => void
  onBack: () => void
  setData?: (data: any) => void
}

const defaultFeatures = [
  "Unlimited projects",
  "Basic analytics",
  "Email support",
]

function InlineEdit({ value, onChange, className, ...props }: { value: string, onChange: (v: string) => void, className?: string, [key: string]: any }) {
  const [editing, setEditing] = useState(false)
  const [temp, setTemp] = useState(value)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTemp(value)
  }, [value])

  useEffect(() => {
    if (editing && ref.current) ref.current.focus()
  }, [editing])

  return editing ? (
    <input
      ref={ref}
      value={temp}
      onChange={e => setTemp(e.target.value)}
      onBlur={() => { setEditing(false); onChange(temp) }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          setEditing(false)
          onChange(temp)
        }
      }}
      className={className + ' bg-transparent border-none outline-none p-0 m-0 focus:ring-0'}
      style={{ minWidth: 0 }}
      {...props}
    />
  ) : (
    <span
      className={className + ' cursor-text'}
      onClick={() => setEditing(true)}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') setEditing(true) }}
      {...props}
    >
      {value}
    </span>
  )
}

export default function ConfigurePricingStep({ onNext, onBack, setData }: Props) {
  const [cards, setCards] = useState<PricingCard[]>([
    { name: 'Basic', price: '9', features: defaultFeatures }
  ])

  const handleChange = (idx: number, field: keyof PricingCard, value: string) => {
    setCards(cards => cards.map((c, i) => i === idx ? { ...c, [field]: value } : c))
  }

  const handleFeatureChange = (cardIdx: number, featureIdx: number, value: string) => {
    setCards(cards => cards.map((c, i) =>
      i === cardIdx
        ? { ...c, features: c.features.map((f, j) => j === featureIdx ? value : f) }
        : c
    ))
  }

  const handleAdd = () => {
    setCards([...cards, { name: 'New Plan', price: '19', features: defaultFeatures }])
  }

  const handleRemove = (idx: number) => {
    setCards(cards => cards.filter((_, i) => i !== idx))
  }

  const handleContinue = () => {
    setData?.(cards)
    onNext()
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      <div className="flex items-start gap-6 w-full justify-center">
        {cards.map((card, idx) => (
          <div key={idx} className="relative w-72 flex flex-col items-center">
            <Button
              size="icon"
              variant="ghost"
              className="absolute -top-3 -right-3 z-10 bg-transparent hover:bg-gray-800 text-red-500 rounded-full h-6 w-6 shadow-none border border-transparent"
              style={{ border: '1.5px solid transparent' }}
              onClick={() => handleRemove(idx)}
              aria-label="Remove pricing card"
            >
              <Minus className="h-3 w-3 text-red-500" />
            </Button>
            <Card className="w-72 flex flex-col items-center mt-2">
              <CardHeader>
                <CardTitle className="text-center">
                  <InlineEdit value={card.name} onChange={v => handleChange(idx, 'name', v)} className="text-center text-lg font-bold" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-2">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-bold">
                    <InlineEdit
                      value={card.price}
                      onChange={v => handleChange(idx, 'price', v)}
                      className="text-5xl font-bold leading-none text-center"
                      style={{ minWidth: '2.5ch', width: '3ch' }}
                      inputMode="numeric"
                      pattern="[0-9]*"
                    />
                  </span>
                  <span className="text-base text-gray-400 mb-1">/month</span>
                </div>
                <ul className="text-sm text-gray-200 space-y-1 mb-4 mt-2">
                  {card.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-400" />
                      <InlineEdit value={feature} onChange={v => handleFeatureChange(idx, i, v)} />
                    </li>
                  ))}
                </ul>
                <Button className="w-full">Get started</Button>
              </CardContent>
            </Card>
          </div>
        ))}
        <Button variant="outline" size="icon" className="h-72 w-16 mt-2 flex-shrink-0" onClick={handleAdd} aria-label="Add pricing card">
          <Plus className="h-8 w-8" />
        </Button>
      </div>
      <Button onClick={handleContinue} className="mt-8 w-full max-w-xs" size="lg">
        Continue
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
} 