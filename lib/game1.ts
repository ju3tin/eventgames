// lib/supabase/games.ts   ← new helper file
import { createClient } from '@/lib/supabase/server'; // your SSR client helper

import type { LucideIcon } from 'lucide-react';
import { Hand, Target, Swords, Music, Dumbbell, Bird } from 'lucide-react';

export interface Game {
  id: string;           // this will be game_id uuid from DB → string
  title: string;
  description: string;
  icon: LucideIcon;     // we map string → icon component
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  calories: string;
  players: string;
  color: string;
  link: string;
  isLocked?: boolean;
  comingSoon?: boolean;
}

// Map DB icon names → Lucide components (you can expand this)
const iconMap: Record<string, LucideIcon> = {
  Hand: Hand,
  Target: Target,
  Swords: Swords,
  Music: Music,
  Dumbbell: Dumbbell,
  Bird: Bird,
  // add more as needed
  default: Hand, // fallback
};

export async function getGames(): Promise<Game[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('gameslist')
    .select(`
      game_id,
      title,
      description,
      icon,           // ← assuming you have a column "icon" with values like 'Hand', 'Target', ...
      difficulty,
      duration,
      calories,
      players,
      color,
      link,
      "isLocked",
      "comingSoon"
    `)
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching games:', error);
    return []; // or throw error — your choice
  }

  // Transform DB rows → your Game type
  return (data || []).map(row => ({
    id: row.game_id,
    title: row.title || '',
    description: row.description || '',
    icon: iconMap[row.icon] || iconMap.default,
    difficulty: (row.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
    duration: row.duration || 'N/A',
    calories: row.calories || 'N/A',
    players: row.players || '1 Player',
    color: row.color || 'bg-gray-500',
    link: row.link || '#',
    isLocked: row.isLocked ?? false,
    comingSoon: row.comingSoon ?? false,
  }));
}