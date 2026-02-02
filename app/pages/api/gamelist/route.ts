// app/api/gameslist/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // adjust path if your client is elsewhere

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('gameslist')
      .select('*')
      .order('title', { ascending: true }); // or .order('id'), .order('created_at', { ascending: false }), etc.

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch games', details: error.message },
        { status: 500 }
      );
    }

    // Optional: transform booleans if Supabase returns 0/1 (rare in recent versions)
    const games = (data || []).map(game => ({
      ...game,
      isLocked: !!game.isLocked,
      comingSoon: !!game.comingSoon,
    }));

    return NextResponse.json({
      success: true,
      data: games,
      count: games.length,
      // timestamp: new Date().toISOString(), // optional
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: add cache control (good for lists that don't change often)
export const revalidate = 60;     // revalidate every 60 seconds (ISR)
export const dynamic = 'force-dynamic'; // or 'force-static' if you want full static