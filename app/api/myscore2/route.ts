// app/api/leaderboard/route.ts

import { NextResponse } from 'next/server'

// Define types for the data
interface Profile {
  username: string
  full_name: string
  avatar_url: string | null
}

interface LeaderboardEntry {
  id: string
  score: number
  game_id: number
  profiles: Profile
}

interface AggregatedPlayer {
  username: string
  totalScore: number
  totalGames: number
}

export async function GET(request: Request) {
  try {
    // 1️⃣ Fetch the leaderboard data from external API
    const res = await fetch('https://motionplay.vercel.app/api/leaderboard', {
      cache: 'no-store',
    })
    const json = await res.json()
    const data: LeaderboardEntry[] = json.data

    // 2️⃣ Aggregate scores by username
    const playersMap = new Map<string, AggregatedPlayer>()

    for (const entry of data) {
      const username = entry.profiles.username

      if (!playersMap.has(username)) {
        playersMap.set(username, {
          username,
          totalScore: 0,
          totalGames: 0,
        })
      }

      const player = playersMap.get(username)!
      player.totalScore += entry.score
      player.totalGames += 1
    }

    let players = Array.from(playersMap.values())

    // 3️⃣ Get username query param from URL
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    // 4️⃣ If `username` is present, filter by it
    if (username) {
      players = players.filter((p) => p.username === username)
    }

    // 5️⃣ Sort players by total score (descending)
    players.sort((a, b) => b.totalScore - a.totalScore)

    return NextResponse.json({ players })
  } catch (error) {
    console.error('Error fetching leaderboard data:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 500 })
  }
}
