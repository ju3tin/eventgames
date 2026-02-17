'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  username: string
  level: number
  totalXP: number
  achievementsUnlocked: number
  isCurrentUser?: boolean
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: 'MotionMaster', level: 47, totalXP: 125400, achievementsUnlocked: 24 },
  { rank: 2, username: 'FitGamer99', level: 42, totalXP: 98500, achievementsUnlocked: 22 },
  { rank: 3, username: 'DodgeKing', level: 38, totalXP: 87200, achievementsUnlocked: 20 },
  { rank: 4, username: 'RhythmQueen', level: 35, totalXP: 76300, achievementsUnlocked: 19 },
  { rank: 5, username: 'You', level: 12, totalXP: 1250, achievementsUnlocked: 9, isCurrentUser: true },
  { rank: 6, username: 'FlappyPro', level: 28, totalXP: 62100, achievementsUnlocked: 17 },
  { rank: 7, username: 'PunchArtist', level: 26, totalXP: 58900, achievementsUnlocked: 16 },
  { rank: 8, username: 'FruitNinja', level: 24, totalXP: 54200, achievementsUnlocked: 15 },
]

export function Leaderboard() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-muted-foreground font-semibold">#{rank}</span>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Global Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {mockLeaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                entry.isCurrentUser
                  ? 'bg-primary/10 border-2 border-primary/30'
                  : 'bg-muted/30 hover:bg-muted/50'
              }`}
            >
              <div className="w-8 flex items-center justify-center">
                {getRankIcon(entry.rank)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground flex items-center gap-2">
                  {entry.username}
                  {entry.isCurrentUser && (
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Level {entry.level} • {entry.achievementsUnlocked}/24 Achievements
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold text-foreground">
                  {entry.totalXP.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">XP</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
