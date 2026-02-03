"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy, Medal, Award, Flame, Clock, Target, ChevronDown, Users } from "lucide-react"

interface LeaderboardEntry {
  id: string
  user_id: string
  game_id: string
  score: number
  duration_seconds: number
  created_at: string
  player: {
    display_name: string | null
  } | null
}

interface GameOption {
  id: string
  name: string
}

export default function LeaderboardPage() {
  const [scores, setScores] = useState<LeaderboardEntry[]>([])
  const [games, setGames] = useState<GameOption[]>([{ id: "all", name: "All Games" }])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState("all")
  const [showDropdown, setShowDropdown] = useState(false)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Load available games once
  useEffect(() => {
    async function loadGames() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("gameslist")
        .select("game_id, title")
        .eq("isLocked", false)
        .eq("comingSoon", false)
        .order("title", { ascending: true })

      if (error) {
        console.error("Failed to load games:", error.message)
      } else if (data) {
        setGames([
          { id: "all", name: "All Games" },
          ...data.map(g => ({ id: g.game_id, name: g.title }))
        ])
      }
    }
    loadGames()
  }, [])

  // Load leaderboard when game filter changes
  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      let query = supabase
        .from("leaderboard")
        .select(`
          id,
          user_id,
          game_id,
          score,
          duration_seconds,
          created_at,
          player:profiles!user_id_fkey (
            display_name
          )
        `)
        .order("score", { ascending: false })
        .limit(50)

      if (selectedGame !== "all") {
        query = query.eq("game_id", selectedGame)
      }

      const { data, error, count } = await query

      if (error) {
        console.error("Leaderboard fetch error:", error.message)
        setError("Could not load leaderboard. Please try again later.")
      } else {
        setScores(data || [])
        // Approximate unique players (may be slightly off if same user in multiple games)
        const uniqueUsers = new Set((data || []).map(e => e.user_id))
        setTotalPlayers(uniqueUsers.size)
      }

      setLoading(false)
    }

    fetchLeaderboard()
  }, [selectedGame])

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Trophy className="h-7 w-7 text-yellow-400 drop-shadow-md" />
    if (rank === 1) return <Medal className="h-7 w-7 text-gray-300 drop-shadow-md" />
    if (rank === 2) return <Award className="h-7 w-7 text-amber-600 drop-shadow-md" />
    return <span className="text-lg font-bold text-muted-foreground">{rank + 1}</span>
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        <div className="container max-w-5xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 mb-5">
              <Flame className="h-5 w-5 text-primary animate-pulse" />
              <span className="font-medium text-primary">Global Rankings</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
              Leaderboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              The best motion game players right now. Who’s on top?
            </p>
          </div>

          {/* Filter + Stats */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
            {/* Game Dropdown */}
            <div className="relative w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full sm:w-64 justify-between text-base"
              >
                {games.find(g => g.id === selectedGame)?.name || "Select Game"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>

              {showDropdown && (
                <div className="absolute top-full left-0 w-full sm:w-64 mt-2 bg-popover border shadow-xl rounded-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
                  {games.map(game => (
                    <button
                      key={game.id}
                      onClick={() => {
                        setSelectedGame(game.id)
                        setShowDropdown(false)
                      }}
                      className={`w-full px-5 py-3.5 text-left transition-colors hover:bg-accent ${
                        selectedGame === game.id ? "bg-accent text-accent-foreground font-medium" : ""
                      }`}
                    >
                      {game.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Stats */}
            {!loading && !error && (
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{totalPlayers} players</span>
                </div>
                <div className="text-xs opacity-70">
                  Updated just now
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <Card className="p-12 text-center border-destructive/30 bg-destructive/5">
              <Target className="h-16 w-16 text-destructive mx-auto mb-6 opacity-70" />
              <h3 className="text-xl font-semibold mb-3">Something went wrong</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </Card>
          ) : scores.length === 0 ? (
            <Card className="p-16 text-center border-dashed">
              <Target className="h-20 w-20 text-muted-foreground/50 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-3">No scores yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Be the first to claim the top spot in {games.find(g => g.id === selectedGame)?.name || "this game"}!
              </p>
              <Button asChild size="lg">
                <a href="/games">Play Now</a>
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {scores.map((entry, index) => (
                <Card
                  key={entry.id}
                  className={`p-4 sm:p-5 transition-all hover:shadow-md hover:scale-[1.005] ${
                    index < 3 ? "border-2" : "border"
                  }`}
                  style={{
                    borderColor: index === 0 ? "#facc15" : index === 1 ? "#d1d5db" : index === 2 ? "#d97706" : undefined,
                  }}
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex-shrink-0 w-12 flex justify-center items-center">
                      {getRankIcon(index)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg truncate">
                        {entry.player?.display_name || "Anonymous"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {games.find(g => g.id === entry.game_id)?.name || "Unknown Game"}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 sm:gap-10">
                      <div className="hidden sm:block text-right">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(entry.duration_seconds)}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-3xl sm:text-4xl font-bold font-mono text-primary tracking-tight">
                          {entry.score.toLocaleString()}
                        </p>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
                          POINTS
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}