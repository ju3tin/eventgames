'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Game = {
  id: number;
  created_at: string;
  title: string;
  description: string | null;
  // Add other fields as needed...
};

export default function Home() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGames() {
      try {
        const { data, error } = await supabase.from('gameslist').select('*').order('id');
        if (error) throw error;
        setGames(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">Error: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Games List (Simple View)</h1>
      <ul className="list-disc pl-5">
        {games.map((game) => (
          <li key={game.id}>{game.title} - {game.description || 'No desc'}</li>
        ))}
      </ul>
    </div>
  );
}