// app/game/[slug]/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type SubmitState =
  | { success: true; message: string }
  | { success: false; error: string }
  | null;

export async function submitGameScore(
  prevState: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'You must be signed in to submit a score.' };
  }

  const game_id = formData.get('game_id') as string;
  const scoreRaw = formData.get('score');
  const durationRaw = formData.get('duration_seconds');

  if (!game_id || scoreRaw == null || durationRaw == null) {
    return { success: false, error: 'Missing required fields.' };
  }

  const score = Number(scoreRaw);
  const duration_seconds = Number(durationRaw);

  if (isNaN(score) || isNaN(duration_seconds)) {
    return { success: false, error: 'Invalid score or duration.' };
  }

  const { error } = await supabase
    .from('leaderboard')
    .insert({
      user_id: user.id,
      game_id,
      score,
      duration_seconds,
    });

  if (error) {
    console.error('Insert error:', error);
    return { success: false, error: error.message || 'Failed to submit score.' };
  }

  revalidatePath('/leaderboard'); // optional

  // This line MUST exist — it's the success path after the error check
  return { success: true, message: 'Score submitted successfully!' };
}