// app/game/[slug]/page.tsx
import { notFound } from 'next/navigation';
import GameOverClient from './GameOverClient'; // We'll create this next

// This is a Server Component (no 'use client')
export default async function GamePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ score?: string; duration?: string }>; // optional query params for game-over data
}) {
  const { slug } = await params;
  const search = await searchParams;

  // Example: fetch game data from Supabase (Server Component → safe & fast)
  // Replace this with your real Supabase query
  const game = await fetchGameBySlug(slug); // ← implement this function

  if (!game) {
    notFound();
  }

  // Get score & duration – could come from:
  //   - URL query params (e.g. ?score=1500&duration=45) after game ends
  //   - cookies / localStorage (but prefer query for SSR)
  //   - or passed via context/state if using a game engine
  const finalScore = search.score ? Number(search.score) : 0;
  const durationSeconds = search.duration ? Number(search.duration) : 0;

  // If no valid score → maybe show "Play the game" or redirect
  if (finalScore <= 0 || durationSeconds <= 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-4xl mb-4">Game: {game.title}</h1>
          <p className="text-xl mb-6">Play to submit a score!</p>
          {/* Your game canvas / start button here */}
        </div>
      </div>
    );
  }

  // Show Game Over UI (client component for interactivity)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <GameOverClient
        gameId={game.game_id}           // uuid from DB
        finalScore={finalScore}
        durationSeconds={durationSeconds}
        slug={slug}
        gameTitle={game.title}
      />
    </div>
  );
}

// Dummy fetch function – replace with real Supabase query
async function fetchGameBySlug(slug: string) {
  // Example using Supabase server client
  // const supabase = await createServerClient();
  // const { data, error } = await supabase
  //   .from('gameslist')
  //   .select('id, game_id, title, ...')
  //   .eq('slug', slug)
  //   .single();

  // if (error || !data) return null;

  // For demo / placeholder:
  if (slug === 'example-game') {
    return {
      game_id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Super Flappy Adventure',
      slug: 'example-game',
    };
  }
  return null;
}