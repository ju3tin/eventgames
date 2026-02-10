"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Trophy,
  Medal,
  Award,
  Flame,
  Clock,
  Target,
  ChevronDown,
} from "lucide-react"

interface LeaderboardEntry {
  id: string
  user_id: string
  game_id: string
  username: string
  score: number
  game_title: string
  duration_seconds: number
  created_at: string
}

interface GameOption {
  id: string
  name: string
}


export async function LeaderboardPage() {

   const supabase = await createClient()
   const {
    data: { user },
  } = await supabase.auth.getUser()
  
  const [scores, setScores] = useState<LeaderboardEntry[]>([])
  const [gameOptions, setGameOptions] = useState<GameOption[]>([
    { id: "all", name: "All Games" },
  ])
  const [loading, setLoading] = useState(true)
  const [selectedGame, setSelectedGame] = useState("all")
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const supabase = createClient()

      // Fetch leaderboard
      let query = supabase
        .from("leaderboard_with_profiles")
        .select(`
          id,
          user_id,
          game_id,
          username,
          score,
          game_title,
          duration_seconds,
          created_at
        `)
        .order("score", { ascending: false })
        .limit(50)

      if (selectedGame !== "all") {
        query = query.eq("game_id", selectedGame)
      }

      const { data, error } = await query

      if (!error && data) {
        setScores(data)

        // Build dropdown options from data (deduped)
        const uniqueGames = Array.from(
          new Map(
            data.map(item => [
              item.game_id,
              { id: item.game_id, name: item.game_title },
            ])
          ).values()
        )

        setGameOptions([{ id: "all", name: "All Games" }, ...uniqueGames])
      } else if (error) {
        console.error("Error fetching leaderboard:", error)
      }

      setLoading(false)
    }

    fetchData()
  }, [selectedGame])

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-400" />
    if (index === 1) return <Medal className="h-6 w-6 text-gray-300" />
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />
    return (
      <span className="h-6 w-6 flex items-center justify-center text-muted-foreground font-mono">
        {index + 1}
      </span>
    )
  }

  const getRankBg = (index: number) => {
    if (index === 0) return "bg-yellow-400/10 border-yellow-400/30"
    if (index === 1) return "bg-gray-300/10 border-gray-300/30"
    if (index === 2) return "bg-amber-600/10 border-amber-600/30"
    return "bg-card border-border"
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar user={user} />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Flame className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Top Players
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Leaderboard
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See who&apos;s dominating the motion games. Can you beat their
              scores?
            </p>
          </div>

          {/* Game Filter */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowDropdown(v => !v)}
                className="min-w-[200px] justify-between"
              >
                {gameOptions.find(g => g.id === selectedGame)?.name}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-lg shadow-xl z-10 overflow-hidden">
                  {gameOptions.map(game => (
                    <button
                      key={game.id}
                      onClick={() => {
                        setSelectedGame(game.id)
                        setShowDropdown(false)
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-secondary transition-colors ${
                        selectedGame === game.id
                          ? "bg-primary/10 text-primary"
                          : ""
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
                  <div
                    key={i}
                    className="h-20 bg-card rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : scores.length === 0 ? (
              <Card className="p-12 text-center">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No Scores Yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to set a record!
                </p>
                <Button asChild>
                  <a href="/games">Play Now</a>
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {scores.map((entry, index) => (
                  <Card
                    key={entry.id}
                    className={`p-4 md:p-5 border transition-all hover:scale-[1.01] ${getRankBg(
                      index
                    )}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 flex justify-center">
                        {getRankIcon(index)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {entry.username || "Anonymous Player"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {entry.game_title}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDuration(entry.duration_seconds)}
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary font-mono">
                            {entry.score.toLocaleString()}
                          </p>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            points
                          </p>
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
