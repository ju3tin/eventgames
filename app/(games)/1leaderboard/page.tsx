// app/leaderboard/page.tsx
import Link from 'next/link';

type LeaderboardEntry = {
  id: string;
  score: number;
  duration_seconds: number;
  created_at: string;
  game_id: number | null;
  username: string | null;           // denormalized (may be null)
  metadata: any | null;
  profile_id: string;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

async function getLeaderboard(gameId?: string) {
  const params = new URLSearchParams();
  if (gameId) params.set('game_id', gameId);

  const url = `/api/leaderboard?${params.toString()}`;

  const res = await fetch(url, {
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error || 'API error');
  }

  return json.data as LeaderboardEntry[];
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { game?: string };
}) {
  const gameId = searchParams.game;

  let entries: LeaderboardEntry[] = [];
  let errorMsg: string | null = null;

  try {
    entries = await getLeaderboard(gameId);
  } catch (err: any) {
    errorMsg = err.message || 'Failed to load leaderboard';
    console.error(err);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            {gameId ? `Game ${gameId} Leaderboard` : 'Leaderboard'}
          </h1>

          {gameId && (
            <Link
              href="/leaderboard"
              className="mt-4 sm:mt-0 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              ← Back to Global
            </Link>
          )}
        </div>

        {errorMsg ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
            {errorMsg}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 text-gray-600 text-xl">
            No scores yet — be the first!
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Player</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Game</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Score</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((entry, index) => {
                  const rank = index + 1;
                  const playerName =
                    entry.profiles?.username ||
                    entry.username ||
                    'Anonymous';

                  const avatar = entry.profiles?.avatar_url;

                  return (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {rank}
                        {rank === 1 && <span className="ml-2 text-2xl">🥇</span>}
                        {rank === 2 && <span className="ml-2 text-2xl">🥈</span>}
                        {rank === 3 && <span className="ml-2 text-2xl">🥉</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt="Avatar"
                              className="h-10 w-10 rounded-full object-cover border border-gray-300"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                              {playerName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="font-medium text-gray-900">
                            {playerName}
                            {entry.profiles?.full_name && (
                              <div className="text-sm text-gray-500">
                                {entry.profiles.full_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {entry.game_id ? `Game ${entry.game_id}` : 'Global'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                        {entry.duration_seconds}s
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}