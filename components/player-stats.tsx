'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, TrendingUp, Flame, Star } from 'lucide-react'

interface PlayerStatsProps {
  level: number
  currentXP: number
  xpToNextLevel: number
  rank: string
  streak: number
  totalGamesPlayed: number
}

export function PlayerStats({
  level,
  currentXP,
  xpToNextLevel,
  rank,
  streak,
  totalGamesPlayed,
}: PlayerStatsProps) {
  const progressPercent = (currentXP / xpToNextLevel) * 100
  const streakMultiplier = Math.min(1 + (streak * 0.1), 3.0)

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Player Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level & Rank */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Level</div>
              <div className="text-3xl font-bold text-foreground">{level}</div>
            </div>
            <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-primary to-accent">
              {rank}
            </Badge>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">XP Progress</span>
              <span className="text-foreground font-medium">
                {currentXP.toLocaleString()} / {xpToNextLevel.toLocaleString()}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Flame className="h-4 w-4 text-orange-500" />
              Daily Streak
            </div>
            <div className="text-2xl font-bold text-foreground">{streak} days</div>
            <div className="text-xs text-primary">
              {streakMultiplier.toFixed(1)}x XP Multiplier
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Trophy className="h-4 w-4 text-primary" />
              Games Played
            </div>
            <div className="text-2xl font-bold text-foreground">{totalGamesPlayed}</div>
            <div className="text-xs text-muted-foreground">
              Across all modes
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
