// app/api/scores/all.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Ignore set errors in API routes
          }
        },
      },
    }
  )

  try {
    const { searchParams } = new URL(request.url)
    
    const game_type = searchParams.get('game_type') || 'punch-targets'
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100) // max 100 for safety
    const offset = Number(searchParams.get('offset')) || 0

    const { data, error, count } = await supabase
      .from('game_scores')
      .select(
        `
        id,
        score,
        duration,
        created_at,
        user:users!inner (email)
        `,
        { count: 'exact' }
      )
      .eq('game_type', game_type)
      .order('score', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching scores:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Anonymize emails (show only first part for privacy)
    const anonymizedScores = data?.map(item => ({
      id: item.id,
      score: item.score,
      duration: item.duration,
      created_at: item.created_at,
      user: item.user?.email
        ? { email: item.user.email.split('@')[0] + '...' }
        : { email: 'Anonymous' }
    })) || []

    return NextResponse.json({
      scores: anonymizedScores,
      total: count || 0,
      limit,
      offset
    })
  } catch (err) {
    console.error('Server error in /api/scores/all:', err)
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    )
  }
}