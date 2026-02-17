'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Coins, TrendingUp, Wallet, Gift } from 'lucide-react'

interface TokenRewardsProps {
  totalEarned: number
  pendingRewards: number
  nextMilestone: number
  milestoneReward: number
}

export function TokenRewards({
  totalEarned,
  pendingRewards,
  nextMilestone,
  milestoneReward,
}: TokenRewardsProps) {
  return (
    <Card className="bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border-yellow-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          Solana Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Earned */}
        <div className="p-4 rounded-lg bg-background/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Wallet className="h-4 w-4" />
              Total Earned
            </div>
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
              All-Time
            </Badge>
          </div>
          <div className="text-3xl font-bold text-foreground flex items-baseline gap-1">
            {totalEarned.toFixed(2)}
            <span className="text-lg text-muted-foreground">SOL</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            ≈ ${(totalEarned * 120).toFixed(2)} USD
          </div>
        </div>

        {/* Pending Rewards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-xs text-muted-foreground mb-1">Pending</div>
            <div className="text-xl font-bold text-foreground">
              {pendingRewards.toFixed(2)}
            </div>
            <div className="text-xs text-primary">SOL</div>
          </div>

          <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
            <div className="text-xs text-muted-foreground mb-1">Next Milestone</div>
            <div className="text-xl font-bold text-foreground">
              {nextMilestone}
            </div>
            <div className="text-xs text-accent">XP needed</div>
          </div>
        </div>

        {/* Milestone Reward */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Milestone Bonus
              </span>
            </div>
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
              +{milestoneReward} SOL
            </Badge>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          Rewards are distributed weekly to your connected wallet
        </div>
      </CardContent>
    </Card>
  )
}
