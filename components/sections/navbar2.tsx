"use client"

import React from 'react'
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
import { User, LogIn, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function Navbar2() {
  const router = useRouter()
  const { isSignedIn, userProfile, isLoading, handleSignOut } = useAuth()

  const handleSignIn = () => {
    router.push('/auth')
  }

  const handleSignOutClick = async () => {
    await handleSignOut()
    router.push('/auth')
  }

  const handleSettingsClick = () => {
    router.push('/settings')
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
                  <p className="text-sm font-medium leading-none cursor-pointer hover:text-foreground transition-colors" onClick={handleSettingsClick}>
                    {userProfile.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground cursor-pointer hover:text-foreground transition-colors" onClick={handleSettingsClick}>
                    {userProfile.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSettingsClick} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOutClick} className="cursor-pointer">
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