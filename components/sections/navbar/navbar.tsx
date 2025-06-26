"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Menu, X } from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const features = [
  {
    title: "Feat1",
    href: "/feat1",
    description: "First feature description."
  },
  {
    title: "Feat2", 
    href: "/feat2",
    description: "Second feature description."
  },
  {
    title: "Feat3",
    href: "/feat3", 
    description: "Third feature description."
  },
]

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <nav className="w-full bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-lg font-semibold">
              aura.
            </Link>
          </div>

          {/* Desktop Navigation Menu */}
          <NavigationMenu className="hidden md:block [&_.navigation-menu-trigger]:bg-black [&_.navigation-menu-trigger]:text-white [&_.navigation-menu-trigger]:hover:bg-gray-800 [&_.navigation-menu-trigger]:hover:text-white">
            <NavigationMenuList className="space-x-4">
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/" className="bg-black text-white hover:bg-gray-800 hover:text-white">What is this?</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/about" className="bg-black text-white hover:bg-gray-800 hover:text-white">About</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/docs" className="bg-black text-white hover:bg-gray-800 hover:text-white">Docs</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              drop your hate
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:bg-gray-800 rounded-md"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-white hover:bg-gray-800 px-4 py-2 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                What is this?
              </Link>
              <Link 
                href="/about" 
                className="text-white hover:bg-gray-800 px-4 py-2 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/docs" 
                className="text-white hover:bg-gray-800 px-4 py-2 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Docs
              </Link>
              <div className="pt-4">
                <Button variant="outline" size="sm" className="w-full">
                  drop your hate
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}
