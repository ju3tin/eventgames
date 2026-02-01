import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getProfile, signOut } from './actions'
import { ProfileForm } from '@/components/profile-form'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Gamepad2, LogOut, Target, Clock, Flame } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

async function getPlayerStats(userId: string) {
  const supabase = await createClient()
  
  // Get total games played
  const { count: gamesPlayed } = await supabase
    .from('game_scores')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get best score
  const { data: bestScore } = await supabase
    .from('game_scores')
    .select('score')
    .eq('user_id', userId)
    .order('score', { ascending: false })
    .limit(1)
    .single()

  // Get total time played
  const { data: totalTime } = await supabase
    .from('game_scores')
    .select('duration_seconds')
    .eq('user_id', userId)

  const totalSeconds = totalTime?.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0) || 0
  const totalMinutes = Math.floor(totalSeconds / 60)

  return {
    gamesPlayed: gamesPlayed || 0,
    bestScore: bestScore?.score || 0,
    totalMinutes,
  }
}

export default async function ProfilePage() {
  const result = await getProfile()

  if (result.error || !result.user) {
    redirect('/auth/login')
  }

  const { user, profile } = result
  const stats = await getPlayerStats(user.id)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-balance">
              Your <span className="text-primary">Profile</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and view your stats
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Profile Form */}
            <ProfileForm 
              profile={profile} 
              email={user.email || ''} 
            />

            {/* Stats & Actions */}
            <div className="space-y-6">
              {/* Player Stats */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <Trophy className="w-5 h-5 text-accent" />
                    Your Stats
                  </CardTitle>
                  <CardDescription>
                    Your gaming achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <Gamepad2 className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{stats.gamesPlayed}</p>
                      <p className="text-xs text-muted-foreground">Games Played</p>
                    </div>
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <Target className="w-6 h-6 mx-auto mb-2 text-accent" />
                      <p className="text-2xl font-bold">{stats.bestScore.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Best Score</p>
                    </div>
                    <div className="text-center p-4 bg-secondary/50 rounded-lg">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-chart-3" />
                      <p className="text-2xl font-bold">{stats.totalMinutes}</p>
                      <p className="text-xs text-muted-foreground">Minutes Played</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif">
                    <Flame className="w-5 h-5 text-accent" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full justify-start" variant="secondary">
                    <Link href="/games">
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      Play Games
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="secondary">
                    <Link href="/leaderboard">
                      <Trophy className="w-4 h-4 mr-2" />
                      View Leaderboard
                    </Link>
                  </Button>
                  <form action={signOut}>
                    <Button 
                      type="submit" 
                      variant="outline" 
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}