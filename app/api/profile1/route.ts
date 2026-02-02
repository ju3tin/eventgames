// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = await cookies(); // ← Required in Next.js 15

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  // Get current authenticated user from session (cookies)
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('Auth error:', authError);
    return NextResponse.json(
      { error: 'Unauthorized - not authenticated', details: authError?.message },
      { status: 401 }
    );
  }

  // Fetch profile (RLS ensures only own row is accessible)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(`
      username,
      full_name,
      created_at
      // avatar_url,     // ← uncomment if you add this field later
      // website,        // ← add any extra fields you need
    `)
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Profile fetch error:', profileError);
    if (profileError.code === 'PGRST116') { // no rows found
      return NextResponse.json({
        success: true,
        data: null, // profile not created yet
        user: {
          id: user.id,
          email: user.email,
        },
      });
    }
    return NextResponse.json(
      { error: 'Failed to load profile', details: profileError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: profile,
    user: {
      id: user.id,
      email: user.email,
      // Add more user fields if needed: last_sign_in_at, etc.
    },
  });
}

// Optional: revalidate often if profile changes are frequent
// (or remove if profile data rarely changes)
export const revalidate = 60; // seconds