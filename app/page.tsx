"use client"

import { Navbar } from '@/components/sections/navbar/navbar'
import { Hero } from '@/components/sections/hero/hero'
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <div className="flex justify-center mt-auto mb-4">
        <Button 
          variant="outline" 
          size="lg"
          className="border-blue-300 text-blue-300 hover:bg-blue-300 hover:text-black"
          onClick={() => router.push('/projects')}
        >
          Start inventing
        </Button>
      </div>
    </div>
  )
}