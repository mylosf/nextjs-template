"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogIn, LogOut } from 'lucide-react'
import { fetchAuthSession, signOut } from 'aws-amplify/auth'

interface UserProfile {
  name: string
  email: string
  avatar?: string
}

export function Navbar2() {
  const router = useRouter()
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    avatar: undefined
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
    
    // Check auth status periodically
    const interval = setInterval(checkAuthStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Force refresh to get the latest auth state
      const { tokens } = await fetchAuthSession({ forceRefresh: true })
      
      // Check if we have valid tokens and they're not expired
      if (tokens?.idToken && tokens?.accessToken) {
        const currentTime = Math.floor(Date.now() / 1000)
        const tokenExpiration = tokens.idToken.payload.exp as number
        
        if (tokenExpiration > currentTime) {
          const payload = tokens.idToken.payload
          setIsSignedIn(true)
          setUserProfile({
            name: payload.name as string || payload.email as string || "User",
            email: payload.email as string || "",
            avatar: undefined
          })
        } else {
          console.log("Tokens are expired")
          setIsSignedIn(false)
          setUserProfile({ name: "", email: "", avatar: undefined })
        }
      } else {
        console.log("No valid tokens found")
        setIsSignedIn(false)
        setUserProfile({ name: "", email: "", avatar: undefined })
      }
    } catch (error) {
      console.log("User is not authenticated:", error)
      setIsSignedIn(false)
      setUserProfile({ name: "", email: "", avatar: undefined })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = () => {
    router.push('/auth')
  }

  const handleSignOut = async () => {
    try {
      await signOut({ global: true }) // Sign out from all devices
      setIsSignedIn(false)
      setUserProfile({ name: "", email: "", avatar: undefined })
      // Force a re-check of auth status after sign out
      setTimeout(checkAuthStatus, 100)
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
      // Even if sign out fails, clear local state
      setIsSignedIn(false)
      setUserProfile({ name: "", email: "", avatar: undefined })
      router.push('/auth')
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0" disabled>
          <Avatar className="h-10 w-10 border-2 border-gray-400">
            <AvatarFallback className="bg-black text-gray-400 border-gray-400">
              <User className="h-5 w-5 animate-pulse" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
            <Avatar className="h-10 w-10 border-2 border-gray-400">
              <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
              <AvatarFallback className="bg-black text-gray-400 border-gray-400">
                {isSignedIn && userProfile.name ? getInitials(userProfile.name) : <User className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end" forceMount>
          {isSignedIn ? (
            <>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userProfile.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userProfile.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Not signed in</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Sign in to access your account
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignIn} className="cursor-pointer">
                <LogIn className="mr-2 h-4 w-4" />
                <span>Sign in</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 