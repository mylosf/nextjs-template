// components/theme-provider.tsx
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NextThemesProvider
      /** ------------- sane defaults ------------- */
      attribute="class"           // puts `class="dark"` or `class="light"` on <html>
      defaultTheme="system"       // follow OS unless user picked something
      enableSystem                // respond to OS changes in real-time
      disableTransitionOnChange   // prevents the “flash” when toggling
      storageKey="next-theme"     // localStorage key (rename if you want)
      themes={["light", "dark"]}  // extend with your own names if needed
    >
      {children}
    </NextThemesProvider>
  )
}
