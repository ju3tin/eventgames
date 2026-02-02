// app/leaderboard/page.tsx
import Link from 'next/link';

type LeaderboardEntry = {
  id: string;
  score: number;
  duration_seconds: number;
  created_at: string;
  game_id: number | null;
  username: string | null;
  metadata: any | null;
  profile_id: string | null;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

async function getLeaderboard() {
  const res = await fetch(`https://motionplay.vercel.app/api/leaderboard`, {
    next: { revalidate: 30 }, // ISR – refreshes every 30 seconds
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch leaderboard: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error || 'API returned failure');
  }

  return json.data as LeaderboardEntry[];
}

// Force dynamic rendering – fixes the "couldn't be rendered statically" error
export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  let entries: LeaderboardEntry[] = [];
  let errorMsg: string | null = null;

  try {
    entries = await getLeaderboard();
  } catch (err: any) {
    errorMsg = err.message || 'Could not load leaderboard';
    console.error('Leaderboard page error:', err);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Leaderboard
          </h1>
          
          <p className="mt-4 sm:mt-0 text-gray-600">
            {entries.length} scores • Updated live
          </p>
        </div>

        {errorMsg ? (
          <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-2xl text-center shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p>{errorMsg}</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              No scores yet
            </h2>
            <p className="text-gray-600">
              Be the first to make it to the leaderboard!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Rank</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Player</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Game</th>
                    <th className="px-6 py-5 text-right text-sm font-semibold text-gray-700">Score</th>
                    <th className="px-6 py-5 text-right text-sm font-semibold text-gray-700">Duration</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {entries.map((entry, index) => {
                    const rank = index + 1;
                    const displayName =
                      entry.profiles?.username ||
                      entry.username ||
                      'Anonymous';

                    const avatar = entry.profiles?.avatar_url;

                    return (
                      <tr 
                        key={entry.id} 
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-gray-900">
                          {rank}
                          {rank <= 3 && (
                            <span className="ml-3 text-2xl">
                              {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            {avatar ? (
                              <img
                                src={avatar}
                                alt=""
                                className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-xl shadow-sm">
                                {displayName.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">
                                {displayName}
                              </div>
                              {entry.profiles?.full_name && (
                                <div className="text-sm text-gray-500">
                                  {entry.profiles.full_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600">
                          {entry.game_id ? `Game ${entry.game_id}` : '—'}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right font-bold text-gray-900 text-lg">
                          {entry.score.toLocaleString()}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm text-gray-600">
                          {entry.duration_seconds}s
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                          {new Date(entry.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}