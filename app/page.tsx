import { Navbar } from '@/components/navbar/navbar'
import { Hero } from '@/components/hero/hero'
import { Features } from '@/components/features/features'
import { Footer } from '@/components/footer/footer'

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </div>
  )
}