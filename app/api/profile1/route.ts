// app/api/profiles/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient'; // your public anon client

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Optional query params (for flexibility later)
  const limit = Number(searchParams.get('limit')) || 100;
  const offset = Number(searchParams.get('offset')) || 0;

  const { data, error, count } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      full_name,
      created_at
      // avatar_url,     // add if you have this column
    `)
    .order('created_at', { ascending: false }) // newest first, or change to 'username'
    .limit(limit)
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Profiles fetch error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to load profiles', 
        details: error.message 
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: data || [],
    count: count ?? data?.length ?? 0,
    total: count,
  });
}

// Revalidate every 60 seconds (good for semi-dynamic data)
export const revalidate = 60;