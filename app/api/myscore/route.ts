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

  // Fetch only scores where the joined profile has this exact username
  const { data: scores, error, count } = await supabase
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
    .eq('profiles.username', username)     // ← this is the key filter
    .order('created_at', { ascending: false });

  if (error) {
    console.error('My scores fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scores', details: error.message },
      { status: 500 }
    );
  }

  // If no rows matched
  if (!scores || scores.length === 0) {
    return NextResponse.json({
      success: true,
      requested_username: username,
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

  // Calculate totals from the filtered results
  const total_score = scores.reduce((sum, row) => sum + (row.score || 0), 0);
  const total_duration = scores.reduce((sum, row) => sum + (row.duration_seconds || 0), 0);
  const highest_score = Math.max(...scores.map(row => row.score || 0));
  const last_played = scores[0].created_at; // newest first

  return NextResponse.json({
    success: true,
    requested_username: username,
    found_scores: scores.length,
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