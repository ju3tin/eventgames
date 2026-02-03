"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy, Medal, Award, Flame, Clock, Target, ChevronDown } from "lucide-react"
import { games } from "@/lib/games-data"

interface LeaderboardEntry {
  id: string;
  user_id: string;
  game_id: string;
  username: string;
  score: number;
  duration_seconds: number;
  created_at: string;
  
}

const gameOptions = [
  { id: "all", name: "All Games" },
  ...games.filter(g => !g.comingSoon && !g.isLocked).map(g => ({ id: g.id, name: g.title }))
]

export default function LeaderboardPage() {
  const [scores, setScores] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState("all")
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    async function fetchScores() {
      setLoading(true)
      const supabase = createClient()
      
      let query = supabase
        .from("leaderboard_with_profiles")
        .select(`
          id,
          user_id,
          game_id,
          username,
          score,
          duration_seconds,
          created_at
        `)
        .order("score", { ascending: false })
        .limit(50)

      if (selectedGame !== "all") {
        query = query.eq("game_id", selectedGame)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching scores:", error)
      } else {
        setScores(data || [])
      }
      setLoading(false)
    }

    fetchScores()
  }, [selectedGame])

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-400" />
    if (index === 1) return <Medal className="h-6 w-6 text-gray-300" />
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />
    return <span className="h-6 w-6 flex items-center justify-center text-muted-foreground font-mono">{index + 1}</span>
  }

  const getRankBg = (index: number) => {
    if (index === 0) return "bg-yellow-400/10 border-yellow-400/30"
    if (index === 1) return "bg-gray-300/10 border-gray-300/30"
    if (index === 2) return "bg-amber-600/10 border-amber-600/30"
    return "bg-card border-border"
  }

  const getGameName = (gameId: string) => {
    const game = games.find(g => g.id === gameId)
    return game?.title || gameId
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Flame className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Top Players</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 text-balance">
              Leaderboard
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              See who{"'"}s dominating the motion games. Can you beat their scores?
            </p>
          </div>

          {/* Game Filter */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowDropdown(!showDropdown)}
                className="min-w-[200px] justify-between"
              >
                {gameOptions.find(g => g.id === selectedGame)?.name}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-xl z-10 overflow-hidden">
                  {gameOptions.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => {
                        setSelectedGame(game.id)
                        setShowDropdown(false)
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-secondary transition-colors ${
                        selectedGame === game.id ? "bg-primary/10 text-primary" : "text-foreground"
                      }`}
                    >
                      {game.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="max-w-3xl mx-auto">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />
                ))}
              </div>
            ) : scores.length === 0 ? (
              <Card className="p-12 text-center bg-card border-border">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Scores Yet</h3>
                <p className="text-muted-foreground mb-6">Be the first to set a record!</p>
                <Button asChild>
                  <a href="/games">Play Now</a>
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {scores.map((entry, index) => (
                  <Card
                    key={entry.id}
                    className={`p-4 md:p-5 border transition-all hover:scale-[1.01] ${getRankBg(index)}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex-shrink-0 w-10 flex justify-center">
                        {getRankIcon(index)}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {entry.username || "Anonymous Player"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getGameName(entry.game_id)}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="text-right hidden sm:block">
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(entry.duration_seconds)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary font-mono">
                            {entry.score.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">points</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}