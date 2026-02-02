// app/api/leaderboard/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('game_id');
  const limit = Number(searchParams.get('limit')) || 50;
  const offset = Number(searchParams.get('offset')) || 0;

  let query = supabase
    .from('leaderboard')
    .select(`
      id,
      score,
      duration_seconds,
      created_at,
      game_id,
      username,
      metadata,
      profile_id,
      profiles!leaderboard_profile_id_fkey (
        username,
        full_name,
        avatar_url
      )
    `)
    .order('score', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);

  if (gameId) {
    query = query.eq('game_id', gameId);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to load leaderboard', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: data || [],
    count: count ?? 0,
    total: count,
  });
}

export const revalidate = 30;