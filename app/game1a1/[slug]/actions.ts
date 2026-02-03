// app/game/[slug]/actions.ts
'use server';

import { createServerClient } from '@/lib/supabase/server'; // your SSR helper
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitGameScore(formData: FormData) {
  const supabase = await createServerClient();

  // Get current user from session (server-side safe)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to submit a score.' };
  }

  // Extract values from form
  const game_id = formData.get('game_id') as string;
  const scoreRaw = formData.get('score');
  const durationRaw = formData.get('duration_seconds');

  // Basic validation (you can use zod later)
  if (!game_id || !scoreRaw || !durationRaw) {
    return { error: 'Missing required fields.' };
  }

  const score = Number(scoreRaw);
  const duration_seconds = Number(durationRaw);

  if (isNaN(score) || isNaN(duration_seconds)) {
    return { error: 'Invalid score or duration.' };
  }

  // Insert into leaderboard
  const { error } = await supabase.from('leaderboard').insert({
    user_id: user.id,
    game_id,
    score,
    duration_seconds,
    // created_at is automatic
  });

  if (error) {
    console.error('Insert error:', error);
    return { error: error.message || 'Failed to submit score.' };
  }

  // Optional: refresh data / redirect
  revalidatePath('/leaderboard');           // if you have a leaderboard page
  // redirect('/leaderboard');              // or redirect somewhere

  return { success: true, message: 'Score submitted successfully!' };
}