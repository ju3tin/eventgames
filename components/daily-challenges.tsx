'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, CheckCircle2, Clock, Coins } from 'lucide-react'

interface Challenge {
  id: string
  title: string
  description: string
  progress: number
  target: number
  xpReward: number
  tokenReward: number
  completed: boolean
  expiresIn: string
}

const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Morning Workout',
    description: 'Complete 3 fitness challenges',
    progress: 2,
    target: 3,
    xpReward: 500,
    tokenReward: 5,
    completed: false,
    expiresIn: '8h 23m',
  },
  {
    id: '2',
    title: 'Perfect Rhythm',
    description: 'Achieve 100% accuracy on any song',
    progress: 0,
    target: 1,
    xpReward: 300,
    tokenReward: 3,
    completed: false,
    expiresIn: '8h 23m',
  },
  {
    id: '3',
    title: 'Fruit Collector',
    description: 'Catch 50 fruits in a single game',
    progress: 50,
    target: 50,
    xpReward: 200,
    tokenReward: 2,
    completed: true,
    expiresIn: '8h 23m',
  },
]

export function DailyChallenges() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Daily Challenges
          </CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Resets in {mockChallenges[0].expiresIn}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockChallenges.map((challenge) => {
          const progressPercent = (challenge.progress / challenge.target) * 100

          return (
            <div
              key={challenge.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                challenge.completed
                  ? 'bg-primary/5 border-primary/30'
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{challenge.title}</h4>
                    {challenge.completed && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">
                    {challenge.progress}/{challenge.target}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      +{challenge.xpReward} XP
                    </Badge>
                    <Badge className="text-xs bg-gradient-to-r from-yellow-500 to-orange-500">
                      <Coins className="h-3 w-3 mr-1" />
                      {challenge.tokenReward} SOL
                    </Badge>
                  </div>
                  {challenge.completed && (
                    <span className="text-xs text-primary font-medium">Completed!</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
