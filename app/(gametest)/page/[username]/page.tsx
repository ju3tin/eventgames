// app/[username]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Profile } from '@/types/profile';
import { createClient } from "@/lib/supabase/server"
interface Props {
  params: { username: string };
}

export const revalidate = 3600;

export default async function PlayerProfile({ params }: Props) {
   const supabase = await createClient()


 const { data: profile2, error } = await supabase
    .from("profile")
    .select(`
      id,
      game_id,
      title,
      description,
      icon,
      difficulty,
      duration,
      calories,
      players,
      color,
      link,
      isLocked,
      comingSoon,
      slug
    `)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching games:", error)
  }


  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://motionplay.vercel.app'}/api/profile1`, {
    cache: 'no-store',
  });

  if (!res.ok) notFound();

  const json = await res.json() as { success: boolean; data: Profile[] };

  if (!json.success) notFound();

  const profile = json.data.find(p => p.username === params.username);

  if (!profile) notFound();

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {profile.avatar_url ? (
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
              <Image
                src={profile.avatar_url}
                alt={profile.full_name || profile.username}
                fill
                className="object-cover rounded-full border-4 border-gray-200"
                priority
              />
            </div>
          ) : (
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-gray-300 flex items-center justify-center text-4xl font-bold">
              {profile.username?.[0]?.toUpperCase() || '?'}
            </div>
          )}

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-bold mb-2">
              {profile.full_name || profile.username}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              @{profile.username}
            </p>
            <p className="text-sm text-gray-500">
              Joined {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}