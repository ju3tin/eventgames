// app/leaderboard/page.tsx
import Link from 'next/link';

type LeaderboardEntry = {
  id: string;
  score: number;
  duration_seconds: number | null;
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

async function getLeaderboardData(gameId?: string, limit = 50, offset = 0) {
  const params = new URLSearchParams();
  if (gameId) params.set('game_id', gameId);
  params.set('limit', limit.toString());
  params.set('offset', offset.toString());

  const url = `/api/leaderboard?${params.toString()}`;

  const res = await fetch(url, {
    next: { revalidate: 30 }, // matches your API revalidate
    cache: 'no-store',        // or remove if you want ISR
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch leaderboard: ${res.status}`);
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error || 'Unknown error');
  }

  return {
    entries: json.data as LeaderboardEntry[],
    total: json.total ?? json.count ?? 0,
  };
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { game?: string; page?: string };
}) {
  const gameId = searchParams.game;
  const page = Number(searchParams.page) || 1;
  const limit = 20; // items per page
  const offset = (page - 1) * limit;

  let entries: LeaderboardEntry[] = [];
  let total = 0;
  let error: string | null = null;

  try {
    const { entries: fetched, total: fetchedTotal } = await getLeaderboardData(
      gameId,
      limit,
      offset
    );
    entries = fetched;
    total = fetchedTotal;
  } catch (err: any) {
    error = err.message || 'Failed to load leaderboard';
    console.error(err);
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-center sm:text-left">
          {gameId ? `Game #${gameId} Leaderboard` : 'Global Leaderboard'}
        </h1>

        {/* Optional: back to global or other filters */}
        {gameId && (
          <Link
            href="/leaderboard"
            className="mt-4 sm:mt-0 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
          >
            ← View Global
          </Link>
        )}
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
          {error}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-xl">No scores recorded yet.</p>
          <p className="mt-2">Be the first to appear here!</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Player</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Game</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {entries.map((entry, index) => {
                  const rank = offset + index + 1;
                  const displayName =
                    entry.profiles?.username ||
                    entry.username ||
                    'Anonymous';

                  return (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {rank}
                        {rank <= 3 && (
                          <span className="ml-2 text-yellow-500">
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {entry.profiles?.avatar_url ? (
                            <img
                              src={entry.profiles.avatar_url}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-gray-900">
                            {displayName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {entry.game_id ? `Game ${entry.game_id}` : 'Global'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {entry.duration_seconds ? `${entry.duration_seconds}s` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Simple pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-4">
              {page > 1 && (
                <Link
                  href={`/leaderboard?page=${page - 1}${gameId ? `&game=${gameId}` : ''}`}
                  className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Previous
                </Link>
              )}

              <span className="px-5 py-2 bg-gray-100 rounded">
                Page {page} of {totalPages}
              </span>

              {page < totalPages && (
                <Link
                  href={`/leaderboard?page=${page + 1}${gameId ? `&game=${gameId}` : ''}`}
                  className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}