import type { Metadata } from 'next'
import { Suspense } from 'react'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { ThemeProvider } from '@/components/themes/theme-provider'

export const metadata: Metadata = {
  title: 'schiffer',
  description: 'schiffer product',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistMono.className}>
        <ThemeProvider>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">LOADING...</div>}>
                {children}
            </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
} 