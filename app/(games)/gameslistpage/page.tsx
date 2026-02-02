// app/games/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient' // adjust path if needed

// Define the shape of each game row
type Game = {
  id: number
  created_at: string
  title: string
  description: string | null
  icon: string | null
  difficulty: string | null
  duration: number | null
  calories: number | null
  players: number | null
  color: string | null          // could be hex, name, etc.
  link: string | null
  isLocked: boolean | null
  comingSoon: boolean | null
}

export default function GamesListPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGames() {
      try {
        const { data, error } = await supabase
          .from('gameslist')
          .select('*')
          .order('title', { ascending: true }) // or 'created_at' desc, etc.

        if (error) throw error

        // Optional: cast booleans if Supabase returns 0/1
        const formatted = (data || []).map((row: any) => ({
          ...row,
          isLocked: !!row.isLocked,     // convert 0/1/null → boolean
          comingSoon: !!row.comingSoon,
        }))

        setGames(formatted)
      } catch (err: any) {
        setError(err.message || 'Failed to load games')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading games...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-xl">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">
          My Games List
        </h1>

        {games.length === 0 ? (
          <p className="text-center text-gray-500 text-xl">
            No games found. Add some in Supabase!
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {games.map((game) => (
              <div
                key={game.id}
                className={`
                  relative rounded-xl shadow-md overflow-hidden
                  ${game.isLocked ? 'opacity-60' : 'hover:shadow-xl transition-shadow'}
                  ${game.comingSoon ? 'border-2 border-purple-400' : 'border border-gray-200'}
                  bg-white
                `}
              >
                {/* Coming soon / Locked badge */}
                {(game.comingSoon || game.isLocked) && (
                  <div className="absolute top-3 right-3 z-10">
                    <span
                      className={`
                        px-3 py-1 rounded-full text-xs font-semibold
                        ${game.comingSoon ? 'bg-purple-600 text-white' : 'bg-gray-700 text-white'}
                      `}
                    >
                      {game.comingSoon ? 'Coming Soon' : 'Locked'}
                    </span>
                  </div>
                )}

                <div className="p-6">
                  {/* Icon / Emoji / Image placeholder */}
                  <div className="text-5xl mb-4 text-center">
                    {game.icon || '🎮'}
                  </div>

                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {game.title}
                  </h2>

                  <p className="text-gray-600 mb-4 min-h-[3rem]">
                    {game.description || 'No description provided'}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                    {game.difficulty && (
                      <div>
                        <span className="font-medium">Difficulty:</span>{' '}
                        {game.difficulty}
                      </div>
                    )}
                    {game.duration && (
                      <div>
                        <span className="font-medium">Duration:</span>{' '}
                        {game.duration} min
                      </div>
                    )}
                    {game.calories && (
                      <div>
                        <span className="font-medium">Calories:</span>{' '}
                        {game.calories}
                      </div>
                    )}
                    {game.players && (
                      <div>
                        <span className="font-medium">Players:</span>{' '}
                        {game.players}
                      </div>
                    )}
                  </div>

                  {game.link && (
                    <a
                      href={game.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 block text-center text-blue-600 hover:underline"
                    >
                      Play / Learn more →
                    </a>
                  )}
                </div>

                {/* Optional color accent bar */}
                {game.color && (
                  <div className="h-2 w-full" style={{ backgroundColor: game.color }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}