import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
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
            // Ignore
          }
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'You must be logged in to save a score' },
      { status: 401 }
    )
  }

  try {
    const { game_type, score, duration } = await request.json()

    if (!score || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid score' }, { status: 400 })
    }

    const { error } = await supabase
      .from('game_scores')
      .insert({
        user_id: user.id,
        game_type: game_type || 'punch-targets',
        score,
        duration: duration || 60,
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Score save error:', err)
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    )
  }
}