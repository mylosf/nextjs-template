"use client"

import { useState, useEffect } from 'react'
import { fetchAuthSession, signOut } from 'aws-amplify/auth'

interface UserProfile {
  name: string
  email: string
  avatar?: string
}

export function useAuth() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    avatar: undefined
  })
  const [isLoading, setIsLoading] = useState(true)

  const checkAuthStatus = async () => {
    try {
      const { tokens } = await fetchAuthSession()
      
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
          setIsSignedIn(false)
          setUserProfile({ name: "", email: "", avatar: undefined })
        }
      } else {
        setIsSignedIn(false)
        setUserProfile({ name: "", email: "", avatar: undefined })
      }
    } catch (error) {
      setIsSignedIn(false)
      setUserProfile({ name: "", email: "", avatar: undefined })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuthStatus()
    
    const interval = setInterval(checkAuthStatus, 300000)
    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut({ global: true })
      setIsSignedIn(false)
      setUserProfile({ name: "", email: "", avatar: undefined })
      setTimeout(checkAuthStatus, 100)
    } catch (error) {
      console.error('Error signing out:', error)
      setIsSignedIn(false)
      setUserProfile({ name: "", email: "", avatar: undefined })
    }
  }

  return {
    isSignedIn,
    userProfile,
    isLoading,
    handleSignOut,
    checkAuthStatus
  }
}