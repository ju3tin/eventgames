import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { GameCard } from '@/components/game-card'
import { games } from '@/lib/games-data'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function GamesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
              Game Selection
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Choose a game below to start playing. Make sure your webcam is ready 
              and you have enough space to move around!
            </p>
          </div>

          {/* Games Filter */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <span className="text-sm text-muted-foreground">Filter by difficulty:</span>
            {['All', 'Easy', 'Medium', 'Hard'].map((filter) => (
              <button
                key={filter}
                className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                  filter === 'All' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Games Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>

          {/* Tips Section */}
          <div className="mt-16 p-8 rounded-2xl bg-secondary/50 border border-border">
            <h2 className="font-serif text-2xl font-bold mb-4">Tips for Best Experience</h2>
            <ul className="grid md:grid-cols-2 gap-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">1</span>
                <span>Make sure you have good lighting so the camera can see you clearly.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">2</span>
                <span>Stand about 6-8 feet away from your camera for full body detection.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">3</span>
                <span>Wear fitted clothing for more accurate pose detection.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">4</span>
                <span>Clear the space around you to avoid bumping into objects.</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}