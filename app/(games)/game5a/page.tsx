'use client'

import React, { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

export default function GamesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(0)
  const [gameId] = useState(1) // ← you can make this dynamic later
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setUser(session.user)
        fetchScore(session.user.id)
      } else {
        router.push('/auth/login')
      }

      setLoading(false)
    }

    fetchSession()
  }, [router])

  const fetchScore = async (userId: string) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('leaderboard')
      .select('score')
      .eq('profile_id', userId)
      .eq('game_id', gameId)
      .maybeSingle() // ← safer than .single() when row might not exist

    if (error) {
      console.error('Error fetching score:', error.message)
      return
    }

    if (data) {
      setScore(data.score ?? 0)
    } else {
      setScore(0) // no record yet → start at 0
    }
  }

  const submitScore = async () => {
    if (!user) return

    const supabase = createClient()

    const payload = {
      profile_id: user.id,
      game_id: gameId,
      score: score,
      // Only include these if your game actually tracks them
      duration_seconds: 120,           // ← make dynamic!
      metadata: { level: 5, attempts: 3 }, // ← make dynamic!
      // Optional: created_at / updated_at — Supabase auto-handles if columns exist
    }

    console.log('Submitting score:', payload)

    const { data, error } = await supabase
      .from('leaderboard')
      .upsert(payload, {
        onConflict: 'profile_id,game_id',     // ← crucial line!
        // ignoreDuplicates: false            // default = false = update
      })
      .select()
      .single()

    if (error) {
      console.error('Error submitting score:', error.message)
      alert('Failed to submit score: ' + error.message)
      return
    }

    console.log('Score saved:', data)
    // Optional: refresh displayed score from DB (in case of server-side logic)
    // fetchScore(user.id)
  }

  // ── For testing / demo only ──
  const incrementScore = () => setScore(prev => prev + 1)
  const resetScore = () => setScore(0)

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please log in to play.</div>

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6">
      <h1 className="text-4xl font-bold mb-6">Games Page</h1>
      <p className="mb-8">Logged in as: <strong>{user.email}</strong></p>

      <div className="mb-10 text-center">
        <h2 className="text-2xl font-semibold mb-3">Your Current Score</h2>
        <div className="text-5xl font-bold text-primary">{score}</div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={incrementScore}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium"
        >
          +1 Point (demo)
        </button>

        <button
          onClick={resetScore}
          className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-medium"
        >
          Reset
        </button>

        <button
          onClick={submitScore}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-medium"
          disabled={score === 0}
        >
          Submit Score to Leaderboard
        </button>
      </div>

      <p className="mt-10 text-sm text-gray-500">
        Tip: After submitting, the score is saved per user + game.<br />
        You can now build a /leaderboard page that selects ORDER BY score DESC.
      </p>
    </div>
  )
}