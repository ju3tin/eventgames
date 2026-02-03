'use client'

import React, { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

type GameOption = {
  game_id: string  // uuid as string
  title: string
}

export default function GamesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [games, setGames] = useState<GameOption[]>([])
  const [selectedGameId, setSelectedGameId] = useState<string>('')
  const [score, setScore] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const initialize = async () => {
      // 1. Get current user
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/auth/login')
        return
      }

      setUser(session.user)

      // 2. Load list of games
      const { data: gamesData, error: gamesError } = await supabase
        .from('gameslist')
        .select('game_id, title')
        .order('title', { ascending: true })

      if (gamesError) {
        console.error('Error loading games:', gamesError.message)
      } else if (gamesData && gamesData.length > 0) {
        setGames(gamesData as GameOption[])
        // Auto-select first game
        setSelectedGameId(gamesData[0].game_id)
      }

      setLoading(false)
    }

    initialize()
  }, [router])

  // Load score whenever selectedGameId or user changes
  useEffect(() => {
    if (user && selectedGameId) {
      fetchScore(user.id, selectedGameId)
    }
  }, [user, selectedGameId])

  const fetchScore = async (userId: string, gameId: string) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('leaderboard')
      .select('score')
      .eq('user_id', userId)          // ← fixed: use user_id (not profile_id)
      .eq('game_id', gameId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching score:', error.message)
      return
    }

    setScore(data?.score ?? 0)
  }

  const submitScore = async () => {
    if (!user || !selectedGameId) return

    const supabase = createClient()

    const payload = {
      user_id: user.id,
      game_id: selectedGameId,
      score: score,
      duration_seconds: 120,           // ← replace with real value later
      // created_at is automatic
    }

    console.log('Submitting score:', payload)

    const { data, error } = await supabase
      .from('leaderboard')
      .upsert(payload, {
        onConflict: 'user_id,game_id',   // ← important for upsert to work per user+game
      })
      .select()
      .single()

    if (error) {
      console.error('Error submitting score:', error.message)
      alert('Failed to submit score: ' + error.message)
      return
    }

    console.log('Score saved:', data)
    // Optional: re-fetch to confirm
    fetchScore(user.id, selectedGameId)
  }

  // ── Demo controls ──
  const incrementScore = () => setScore(prev => prev + 1)
  const resetScore = () => setScore(0)

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <div className="min-h-screen flex items-center justify-center">Please log in to play.</div>

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-gray-50">
      <h1 className="text-4xl font-bold mb-6">Games & Leaderboard Test</h1>
      <p className="mb-8">Logged in as: <strong>{user.email}</strong></p>

      {/* Dropdown for selecting game */}
      <div className="w-full max-w-md mb-10">
        <label htmlFor="game-select" className="block text-lg font-medium mb-2">
          Select Game:
        </label>
        <select
          id="game-select"
          value={selectedGameId}
          onChange={(e) => setSelectedGameId(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={games.length === 0}
        >
          {games.length === 0 ? (
            <option value="">Loading games...</option>
          ) : (
            games.map(game => (
              <option key={game.game_id} value={game.game_id}>
                {game.title}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="mb-10 text-center">
        <h2 className="text-2xl font-semibold mb-3">Your Current Score for this game</h2>
        <div className="text-5xl font-bold text-blue-600">{score.toLocaleString()}</div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={incrementScore}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition"
        >
          +1 Point (test)
        </button>

        <button
          onClick={resetScore}
          className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition"
        >
          Reset
        </button>

        <button
          onClick={submitScore}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-medium transition"
          disabled={score === 0 || !selectedGameId}
        >
          Submit Score to Leaderboard
        </button>
      </div>

      <p className="mt-12 text-sm text-gray-600 text-center max-w-lg">
        Score is saved **per user + per game**.<br />
        You can now create a leaderboard page that groups by game_id and orders by score DESC.
      </p>
    </div>
  )
}