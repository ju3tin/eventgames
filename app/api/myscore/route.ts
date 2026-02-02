// app/api/my-scores/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username')?.trim();

  if (!username) {
    return NextResponse.json(
      { error: 'username query parameter is required' },
      { status: 400 }
    );
  }

  // ────────────────────────────────────────────────
  // 1. Get all individual scores for this exact username
  //    Use LEFT JOIN + filter on profiles.username
  // ────────────────────────────────────────────────
  const { data: scores, error: scoresError, count } = await supabase
    .from('leaderboard')
    .select(`
      id,
      score,
      duration_seconds,
      created_at,
      game_id,
      metadata,
      profile_id,
      profiles!leaderboard_profile_id_fkey (
        username,
        full_name,
        avatar_url
      )
    `)
    .eq('profiles.username', username)     // ← exact match (case sensitive)
    // or use .ilike('profiles.username', username) for case-insensitive
    .order('created_at', { ascending: false });

  if (scoresError) {
    console.error('My scores error:', scoresError);
    return NextResponse.json(
      { error: 'Database error', details: scoresError.message },
      { status: 500 }
    );
  }

  // ────────────────────────────────────────────────
  // 2. Calculate totals (only for matching rows)
  // ────────────────────────────────────────────────
  const total_score = scores.reduce((sum, row) => sum + (row.score || 0), 0);
  const total_duration = scores.reduce((sum, row) => sum + (row.duration_seconds || 0), 0);
  const highest_score = scores.length > 0 ? Math.max(...scores.map(r => r.score || 0)) : 0;
  const last_played = scores[0]?.created_at || null;

  return NextResponse.json({
    success: true,
    requested_username: username,
    found_rows: scores.length,
    total_score,
    stats: {
      games_played: scores.length,
      total_duration,
      highest_score,
      last_played
    },
    scores: scores || []
  });
}

export const revalidate = 30;