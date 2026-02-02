// app/api/my-scores/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username || username.trim() === '') {
    return NextResponse.json(
      { error: 'username query parameter is required' },
      { status: 400 }
    );
  }

  // ────────────────────────────────────────────────
  // Fetch all individual scores for this username
  // ────────────────────────────────────────────────
  const { data: scores, error: scoresError } = await supabase
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
    .ilike('profiles.username', username.trim())   // case-insensitive match
    .order('created_at', { ascending: false });

  if (scoresError) {
    console.error('My scores fetch error:', scoresError);
    return NextResponse.json(
      { error: 'Failed to fetch scores', details: scoresError.message },
      { status: 500 }
    );
  }

  if (!scores || scores.length === 0) {
    return NextResponse.json({
      success: true,
      username: username.trim(),
      message: 'No scores found for this username',
      total_score: 0,
      stats: {
        games_played: 0,
        total_duration: 0,
        highest_score: 0,
        last_played: null
      },
      scores: []
    });
  }

  // ────────────────────────────────────────────────
  // Calculate totals in Next.js (simple & safe)
  // ────────────────────────────────────────────────
  const total_score = scores.reduce((sum, row) => sum + row.score, 0);
  const total_duration = scores.reduce((sum, row) => sum + (row.duration_seconds || 0), 0);
  const highest_score = Math.max(...scores.map(row => row.score), 0);
  const last_played = scores[0]?.created_at || null; // already sorted newest first

  return NextResponse.json({
    success: true,
    username: username.trim(),
    total_score,
    stats: {
      games_played: scores.length,
      total_duration,
      highest_score,
      last_played
    },
    scores
  });
}

export const revalidate = 30;
