// Example: in a Server Component, Server Action, or Client Component
import { createClient } from '@/lib/supabase/server';   // or your client helper

async function getLeaderboard(gameId?: string, limit = 50) {
  const supabase = await createClient();   // or supabase = createClient() if not async

  let query = supabase
    .from('leaderboard_with_profiles')     // ← use the view name here!
    .select('*')                           // or pick columns: 'score, display_name, avatar_url, ...'
    .order('score', { ascending: false })
    .limit(limit);

  if (gameId) {
    query = query.eq('game_id', gameId);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Leaderboard error:', error.message);
    throw error; // or return { error }
  }

  return {
    leaderboard: data ?? [],
    total: count ?? data?.length ?? 0,
  };
}