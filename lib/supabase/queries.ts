// lib/supabase/queries.ts
import { supabase } from '@/lib/supabaseClient';

export async function getAllGames() {
  const { data, error } = await supabase
    .from('gameslist')
    .select('id, title, slug')
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching games:', error);
    return [];
  }

  return data || [];
}