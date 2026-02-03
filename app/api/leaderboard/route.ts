// app/api/leaderboard/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // ← use your SSR helper (with cookies)

export async function GET(request: Request) {
  const supabase = await createClient(); // ← await if your helper is async

  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('game_id');
  const limit = Number(searchParams.get('limit')) || 50;
  const offset = Number(searchParams.get('offset')) || 0;

  // Build query
  let query = supabase
    .from('leaderboard')
    .select(
      `
      id,
      user_id,
      game_id,
      score,
      duration_seconds,
      created_at,
      player:profiles!user_id_fkey (    // ← correct foreign key + alias
        username,
        full_name,
        avatar_url,
        display_name    // ← add if you use this field
      )
    `,
      { count: 'exact' } // ← enables .count() to work
    )
    .order('score', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1); // range is fine for pagination

  if (gameId) {
    query = query.eq('game_id', gameId);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Leaderboard fetch error:', error.message);
    return NextResponse.json(
      { success: false, error: 'Failed to load leaderboard', details: error.message },
      { status: 500 }
    );
  }

  // Optional: transform/flatten data if you prefer flat structure
  const transformed = data?.map((entry: any) => ({
    ...entry,
    player_name: entry.player?.[0]?.display_name ||
                 entry.player?.[0]?.username ||
                 entry.player?.[0]?.full_name ||
                 'Anonymous',
    avatar_url: entry.player?.[0]?.avatar_url || null,
    // remove nested player if frontend doesn't need it
  })) ?? [];

  return NextResponse.json({
    success: true,
    data: transformed,
    pagination: {
      count: count ?? 0,           // total matching rows
      returned: data?.length ?? 0,
      limit,
      offset,
    },
  });
}

// Revalidate every 30 seconds (ISR)
export const revalidate = 30;