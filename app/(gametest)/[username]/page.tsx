// app/[username]/page.tsx
import { createClient } from "@/lib/supabase/server"
import { notFound } from 'next/navigation';
import Image from 'next/image';

interface Props {
  params: { username: string };
}

export async function generateStaticParams() {
 const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('username')
    .not('username', 'is', null); // skip null usernames

  if (!profiles) return [];

  // Return format: array of { username: "..." }
  return profiles.map((p) => ({ username: p.username }));
}

export const revalidate = 3600; // optional — ISR every hour

export default async function PlayerProfile({ params }: Props) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('username, full_name, avatar_url, website, bio, created_at')
    .eq('username', params.username)
    .single();

  if (error || !profile) {
    console.error(error);
    notFound(); // shows app/not-found.tsx or default 404
  }

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

            {profile.bio && (
              <p className="text-lg mb-6 leading-relaxed">{profile.bio}</p>
            )}

            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline block mb-4"
              >
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}

            <p className="text-sm text-gray-500">
              Joined {new Date(profile.created_at!).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}