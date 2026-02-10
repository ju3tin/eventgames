"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function LeaderboardNavbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Initial load
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    // Keep in sync (login / logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return <Navbar user={user} />
}
