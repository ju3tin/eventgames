'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Activity, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface NavbarProps {
  user?: SupabaseUser | null
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-bold">MotionPlay</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="/games" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Games
            </Link>
            <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Leaderboard
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">Log In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}