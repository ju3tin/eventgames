// app/players/page.tsx
import { createClient } from "@/lib/supabase/server"
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 3600; // revalidate every hour (optional ISR)

export default async function PlayersPage() {
  const supabase = await createClient()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url, bio')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return <div>Error loading players...</div>;
  }

  if (!profiles?.length) {
    return <div>No players found.</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">All Players</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {profiles.map((profile) => (
          <Link
            key={profile.username}
            href={`/${profile.username}`}
            className="group block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition"
          >
            <div className="p-4">
              {profile.avatar_url ? (
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || profile.username}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
                  No avatar
                </div>
              )}

              <h2 className="text-xl font-semibold text-center group-hover:text-blue-600">
                {profile.full_name || profile.username}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
                @{profile.username}
              </p>
              {profile.bio && (
                <p className="mt-3 text-sm line-clamp-3 text-center">
                  {profile.bio}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}