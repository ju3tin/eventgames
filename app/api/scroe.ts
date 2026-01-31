// app/api/scores/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

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

    const { error } = await supabase.from('game_scores').insert({
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