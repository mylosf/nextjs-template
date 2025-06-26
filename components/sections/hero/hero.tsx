import React from 'react'
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section
      className="
        flex flex-col justify-between
        min-h-[calc(100vh-4rem)]
        py-8
      "
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1>Welcome to auracoding.</h1>
      </div>
      <div className="flex justify-center">
        <Button 
          variant="outline" 
          size="lg"
          className="border-blue-300 text-blue-300 hover:bg-blue-300 hover:text-black"
        >
          Start inventing
        </Button>
      </div>
    </section>
  )
}