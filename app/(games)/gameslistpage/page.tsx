// app/games/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2, Clock, Star } from 'lucide-react';

async function getGames() {
  const supabase = await createClient();

  const { data: games, error } = await supabase
    .from('gameslist')
    .select('id, slug, title, description, thumbnail_url, difficulty, play_count')
    .eq('is_active', true)
    .order('play_count', { ascending: false }) // popular first; or .order('title')
    .limit(20); // for now; later add pagination

  if (error) {
    console.error('Error fetching games:', error);
    return [];
  }

  return games ?? [];
}

export default async function GamesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
  //  redirect('/auth/login');
  }

  const games = await getGames();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold font-serif text-balance">
              Play Our <span className="text-primary">Games</span>
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl">
              Challenge yourself with fun games, track your scores, and climb the leaderboard!
            </p>
          </div>

          {games.length === 0 ? (
            <div className="text-center py-16">
              <Gamepad2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No games available yet</h2>
              <p className="text-muted-foreground">Check back soon — we're adding more!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.map((game) => (
                <Card 
                  key={game.id} 
                  className="overflow-hidden border-border/50 bg-card/60 backdrop-blur-sm hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  {game.thumbnail_url ? (
                    <div className="relative h-48 w-full">
                      <Image
                        src={game.thumbnail_url}
                        alt={game.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        unoptimized // if using Supabase public URLs
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Gamepad2 className="w-20 h-20 text-primary/40" />
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <CardTitle className="font-serif text-xl">{game.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        game.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                        game.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {game.difficulty?.toUpperCase() || 'MEDIUM'}
                      </span>
                      {game.play_count > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Played {game.play_count.toLocaleString()} times
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {game.description || "A fun and challenging game to test your skills."}
                    </p>

                    <Button asChild className="w-full">
                      <Link href={`/games/${game.slug}`}>
                        <Gamepad2 className="w-4 h-4 mr-2" />
                        Play Now
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Optional: Load more / pagination placeholder */}
          {games.length >= 20 && (
            <div className="text-center mt-12">
              <Button variant="outline" disabled>
                Load More Games (coming soon)
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}