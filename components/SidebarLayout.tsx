'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from './AppSidebar'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface SidebarLayoutProps {
  children: React.ReactNode
  user?: SupabaseUser | null
}

export function SidebarLayout({ children, user }: SidebarLayoutProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">

      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} user={user} />

      {/* Content Area */}
      <div className="flex-1 flex flex-col">

        {/* Top Bar */}
        <header className="h-14 flex items-center px-4 border-b border-border">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-md hover:bg-muted transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>

      </div>
    </div>
  )
}
