'use client'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Hand } from 'lucide-react' // fallback icon if needed

export interface Game {
  id: string           // map from game_id in Supabase
  title: string
  description: string
  icon: LucideIcon     // optional: you can map icon string to actual Lucide icon
  difficulty: 'Easy' | 'Medium' | 'Hard'
  duration: string
  calories: string
  players: string
  color: string
  link: string
  isLocked?: boolean
  comingSoon?: boolean
  slug?: string
}

export function useGames() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGames = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('gameslist')
        .select('*')
        .order('title', { ascending: true })

      if (error) {
        console.error('Error fetching games:', error.message)
        setLoading(false)
        return
      }

      const mappedGames: Game[] = (data ?? []).map(row => ({
        id: row.game_id ?? row.id.toString(),
        title: row.title ?? '',
        description: row.description ?? '',
        icon: Hand, // fallback icon; you can map row.icon string to actual LucideIcon
        difficulty: row.difficulty as 'Easy' | 'Medium' | 'Hard',
        duration: row.duration ?? '',
        calories: row.calories ?? '',
        players: row.players ?? '',
        color: row.color ?? '',
        link: row.link ?? '',
        isLocked: row.isLocked ?? false,
        comingSoon: row.comingSoon ?? false,
        slug: row.slug ?? '',
      }))

      setGames(mappedGames)
      setLoading(false)
    }

    fetchGames()
  }, [])

  return { games, loading }
}
