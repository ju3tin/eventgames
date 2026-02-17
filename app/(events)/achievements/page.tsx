'use client'

import { Card, CardContent } from '@/components/uis/card'
import { Badge } from '@/components/uis/badge'
import { Progress } from '@/components/uis/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/uis/tabs'
import { Trophy, Star, Target, Zap, Award, Lock, Sparkles } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import { PlayerStats } from '@/components/player-stats'
import { Leaderboard } from '@/components/leaderboard'
import { DailyChallenges } from '@/components/daily-challenges'
import { TokenRewards } from '@/components/token-rewards'

// Game data
const games = [
  {
    id: 'dodge-master',
    name: 'Dodge Master',
    difficulty: 'Hard',
    duration: '2-4 min',
    calories: '100-150',
    players: '1 Player',
    icon: '🎯',
    color: 'from-red-500 to-orange-500',
    achievements: [
      { name: 'First Dodge', description: 'Complete your first game', unlocked: true, xp: 50, badge: '/badges/first-dodge.jpg', rarity: 'Common' },
      { name: 'Dodge Streak', description: 'Dodge 10 obstacles in a row', unlocked: true, xp: 100, badge: '/badges/dodge-streak.jpg', rarity: 'Rare' },
      { name: 'Dodge Pro', description: 'Survive for 3 minutes', unlocked: false, xp: 200, badge: '/badges/dodge-pro.jpg', rarity: 'Epic' },
      { name: 'Untouchable', description: 'Complete a game without getting hit', unlocked: false, xp: 300, badge: '/badges/untouchable.jpg', rarity: 'Legendary' },
    ],
  },
  {
    id: 'catch-fruit',
    name: 'Catch the Fruit',
    difficulty: 'Easy',
    duration: '2-5 min',
    calories: '50-100',
    players: '1 Player',
    icon: '🍎',
    color: 'from-green-500 to-emerald-500',
    achievements: [
      { name: 'First Catch', description: 'Catch your first fruit', unlocked: true, xp: 50, badge: '/badges/first-catch.jpg', rarity: 'Common' },
      { name: 'Fruit Hunter', description: 'Catch 100 fruits', unlocked: true, xp: 100, badge: '/badges/fruit-hunter.jpg', rarity: 'Rare' },
      { name: 'Perfect Catch', description: 'Catch 20 fruits in a row', unlocked: false, xp: 150, badge: '/badges/perfect-catch.jpg', rarity: 'Epic' },
      { name: 'Fruit Master', description: 'Achieve a combo of 50', unlocked: false, xp: 250, badge: '/badges/fruit-master.jpg', rarity: 'Legendary' },
    ],
  },
  {
    id: 'rhythm-move',
    name: 'Rhythm Move',
    difficulty: 'Medium',
    duration: '3-6 min',
    calories: '120-200',
    players: '1-2 Players',
    icon: '🎵',
    color: 'from-purple-500 to-pink-500',
    achievements: [
      { name: 'First Beat', description: 'Complete your first song', unlocked: true, xp: 50, badge: '/badges/first-beat.jpg', rarity: 'Common' },
      { name: 'Rhythm Starter', description: 'Play 5 different songs', unlocked: true, xp: 100, badge: '/badges/rhythm-starter.jpg', rarity: 'Rare' },
      { name: 'Beat Master', description: 'Achieve a 50-move combo', unlocked: false, xp: 200, badge: '/badges/beat-master.jpg', rarity: 'Epic' },
      { name: 'Perfect Rhythm', description: 'Get 100% accuracy on a song', unlocked: false, xp: 300, badge: '/badges/perfect-rhythm.jpg', rarity: 'Legendary' },
    ],
  },
  {
    id: 'fitness-challenge',
    name: 'Fitness Challenge',
    difficulty: 'Hard',
    duration: '5-10 min',
    calories: '150-300',
    players: '1 Player',
    icon: '💪',
    color: 'from-blue-500 to-cyan-500',
    achievements: [
      { name: 'First Workout', description: 'Complete your first workout', unlocked: true, xp: 50, badge: '/badges/first-workout.jpg', rarity: 'Common' },
      { name: 'Calorie Burner', description: 'Burn 500 calories total', unlocked: true, xp: 150, badge: '/badges/calorie-burner.jpg', rarity: 'Rare' },
      { name: 'Fitness Warrior', description: 'Complete 15 workouts', unlocked: false, xp: 250, badge: '/badges/fitness-warrior.jpg', rarity: 'Epic' },
      { name: 'Elite Athlete', description: 'Complete all exercises perfectly', unlocked: false, xp: 400, badge: '/badges/elite-athlete.jpg', rarity: 'Legendary' },
    ],
  },
  {
    id: 'punch-targets',
    name: 'Punch the Targets',
    difficulty: 'Medium',
    duration: '1 min',
    calories: '80-120',
    players: '1 Player',
    icon: '🥊',
    color: 'from-yellow-500 to-orange-500',
    achievements: [
      { name: 'First Punch', description: 'Hit your first target', unlocked: true, xp: 50, badge: '/badges/first-punch.jpg', rarity: 'Common' },
      { name: 'Speed Demon', description: 'Hit 30 targets in a minute', unlocked: true, xp: 100, badge: '/badges/speed-demon.jpg', rarity: 'Rare' },
      { name: 'Punch Master', description: 'Complete a game with 100% accuracy', unlocked: false, xp: 200, badge: '/badges/punch-master.jpg', rarity: 'Epic' },
      { name: 'Ultimate Fighter', description: 'Score 10,000 points', unlocked: false, xp: 350, badge: '/badges/ultimate-fighter.jpg', rarity: 'Legendary' },
    ],
  },
  {
    id: 'flappy-arms',
    name: 'Flappy Arms',
    difficulty: 'Easy',
    duration: '2-5 min',
    calories: '60-100',
    players: '1 Player',
    icon: '🦅',
    color: 'from-teal-500 to-blue-500',
    achievements: [
      { name: 'First Flight', description: 'Pass through 10 obstacles', unlocked: true, xp: 50, badge: '/badges/first-flight.jpg', rarity: 'Common' },
      { name: 'Wing Master', description: 'Pass through 25 obstacles', unlocked: false, xp: 100, badge: '/badges/wing-master.jpg', rarity: 'Rare' },
      { name: 'Sky Pilot', description: 'Pass through 50 obstacles in one game', unlocked: false, xp: 200, badge: '/badges/sky-pilot.jpg', rarity: 'Epic' },
      { name: 'Legendary Flyer', description: 'Achieve a perfect run', unlocked: false, xp: 350, badge: '/badges/legendary-flyer.jpg', rarity: 'Legendary' },
    ],
  },
]

// Rarity styling helper
const getRarityStyle = (rarity: string) => {
  switch (rarity) {
    case 'Common':
      return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
    case 'Rare':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
    case 'Epic':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
    case 'Legendary':
      return 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

// Calculate stats
const totalAchievements = games.reduce((sum, game) => sum + game.achievements.length, 0)
const unlockedAchievements = games.reduce(
  (sum, game) => sum + game.achievements.filter((a) => a.unlocked).length,
  0
)
const totalXP = games.reduce(
  (sum, game) => sum + game.achievements.filter((a) => a.unlocked).reduce((s, a) => s + a.xp, 0),
  0
)

export default function AchievementsPage() {
  const [selectedGame, setSelectedGame] = useState('all')

  const filteredGames = selectedGame === 'all' ? games : games.filter((g) => g.id === selectedGame)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-accent to-primary py-16 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-12 w-12 text-primary-foreground" />
            <h1 className="text-5xl font-bold text-primary-foreground text-balance">
              Achievements
            </h1>
          </div>
          <p className="text-center text-primary-foreground/90 text-lg mb-8">
            {'Track your progress and unlock rewards across all Motion Play games'}
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card className="bg-background/95 backdrop-blur border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Achievements</p>
                    <p className="text-2xl font-bold text-foreground">
                      {unlockedAchievements}/{totalAchievements}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/95 backdrop-blur border-accent/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-accent/10">
                    <Zap className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total XP</p>
                    <p className="text-2xl font-bold text-foreground">{totalXP.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/95 backdrop-blur border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completion</p>
                    <p className="text-2xl font-bold text-foreground">
                      {Math.round((unlockedAchievements / totalAchievements) * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Sidebar - Player Stats & Rewards */}
          <div className="lg:col-span-1 space-y-6">
            <PlayerStats
              level={12}
              currentXP={1250}
              xpToNextLevel={2000}
              rank="Rising Star"
              streak={7}
              totalGamesPlayed={45}
            />
            <TokenRewards
              totalEarned={12.45}
              pendingRewards={0.85}
              nextMilestone={750}
              milestoneReward={5}
            />
          </div>

          {/* Right Content - Challenges & Leaderboard */}
          <div className="lg:col-span-2 space-y-6">
            <DailyChallenges />
            <Leaderboard />
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="mx-auto max-w-6xl px-4 pb-12">
        <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedGame}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-8 h-auto p-2">
            <TabsTrigger value="all" className="text-sm">
              All Games
            </TabsTrigger>
            {games.map((game) => (
              <TabsTrigger key={game.id} value={game.id} className="text-sm">
                <span className="mr-1">{game.icon}</span>
                <span className="hidden lg:inline">{game.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedGame} className="space-y-8">
            {filteredGames.map((game) => {
              const gameUnlocked = game.achievements.filter((a) => a.unlocked).length
              const gameTotal = game.achievements.length
              const gameProgress = (gameUnlocked / gameTotal) * 100

              return (
                <div key={game.id} className="space-y-4">
                  {/* Game Header */}
                  <Card className={`overflow-hidden bg-gradient-to-r ${game.color} border-0`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="text-5xl">{game.icon}</div>
                          <div>
                            <h2 className="text-2xl font-bold text-white text-balance">
                              {game.name}
                            </h2>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                {game.difficulty}
                              </Badge>
                              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                {game.duration}
                              </Badge>
                              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                {game.calories} cal
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white/90 text-sm mb-1">
                            {gameUnlocked}/{gameTotal} Unlocked
                          </div>
                          <Progress value={gameProgress} className="h-2 w-32 bg-white/20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Achievements Grid */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {game.achievements.map((achievement, idx) => (
                      <Card
                        key={idx}
                        className={`group transition-all hover:shadow-lg ${
                          achievement.unlocked
                            ? 'border-primary/30 bg-card'
                            : 'border-border bg-muted/30'
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div
                              className={`relative flex-shrink-0 rounded-xl overflow-hidden ${
                                achievement.unlocked ? 'ring-2 ring-primary/20' : ''
                              }`}
                            >
                              <Image
                                src={achievement.badge}
                                alt={achievement.name}
                                width={80}
                                height={80}
                                className={`transition-all ${
                                  achievement.unlocked
                                    ? 'group-hover:scale-110'
                                    : 'grayscale opacity-50'
                                }`}
                              />
                              {!achievement.unlocked && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                  <Lock className="h-8 w-8 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3
                                  className={`font-semibold text-balance ${
                                    achievement.unlocked
                                      ? 'text-foreground'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  {achievement.name}
                                </h3>
                                <Badge
                                  variant={achievement.unlocked ? 'default' : 'secondary'}
                                  className="flex-shrink-0"
                                >
                                  {achievement.xp} XP
                                </Badge>
                              </div>
                              <p
                                className={`text-sm mb-2 ${
                                  achievement.unlocked
                                    ? 'text-muted-foreground'
                                    : 'text-muted-foreground/70'
                                }`}
                              >
                                {achievement.description}
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge
                                  className={`text-xs border ${getRarityStyle(achievement.rarity)}`}
                                  variant="outline"
                                >
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  {achievement.rarity}
                                </Badge>
                                {achievement.unlocked && (
                                  <div className="flex items-center gap-1 text-xs text-primary">
                                    <Trophy className="h-3 w-3" />
                                    <span>Unlocked</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
