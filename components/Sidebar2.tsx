'use client'

import { useState } from 'react'

import { useRouter, usePathname } from 'next/navigation'
import { Activity, LogOut, User, Trophy, Gamepad2, Info } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import './Sidebar.css'

interface SidebarProps {
  user?: SupabaseUser | null
}



export function Sidebar({ user }: SidebarProps) {
     const router = useRouter()
  const pathname = usePathname()

const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }


  const navItem = (
    href: string,
    label: string,
    Icon: any
  ) => {
    const active = pathname === href



    
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
          active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </Link>
    )
  }

  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Toggle Button */}
      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Close Menu' : 'Open Menu'}
      </button>

      {/* Sidebar */}
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-serif text-xl font-bold">
            MotionPlay
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">

        {navItem('/#how-it-works', 'How It Works', Info)}
        {navItem('/games', 'Games', Gamepad2)}
        {navItem('/leaderboard', 'Leaderboard', Trophy)}

        {user && navItem('/profile', 'Profile', User)}

      </nav>

      {/* Auth Section */}
      <div className="p-4 border-t border-border space-y-3">

        {user ? (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="truncate">{user.email}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/auth/login">Log In</Link>
            </Button>

            <Button asChild size="sm" className="w-full">
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </aside>

      {/* Overlay for closing sidebar when clicking outside */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}
    </>
  )
}
