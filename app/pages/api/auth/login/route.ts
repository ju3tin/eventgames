// app/api/auth/login/route.ts
import { createClient } from '@/lib/supabase/server'; // adjust path
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();   // ← NO await here!

  // Now supabase is the real SupabaseClient → .auth exists
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  // Cookies are auto-set by @supabase/ssr during signInWithPassword
  return NextResponse.json({
    message: 'Login successful',
    user: data.user,
  });
}