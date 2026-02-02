// app/leaderboard/page.tsx
type LeaderboardEntry = {
  id: string;
  score: number;
  duration_seconds: number;
  created_at: string;
  game_id: number | null;
  username: string | null;           // denormalized fallback
  metadata: any | null;
  profile_id: string | null;
  profiles: {
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

async function getAllScores() {
  const res = await fetch('/api/leaderboard', {  // change to your production URL in Vercel
    next: { revalidate: 30 },
    cache: 'no-store', // remove if you want caching
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch leaderboard: ${res.status}`);
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error || 'API returned failure');
  }

  // Sort client-side if API doesn't sort (your API already does .order('score', { ascending: false }))
  return json.data as LeaderboardEntry[];
}

export default async function LeaderboardPage() {
  let entries: LeaderboardEntry[] = [];
  let errorMsg: string | null = null;

  try {
    entries = await getAllScores();
  } catch (err: any) {
    errorMsg = err.message || 'Could not load scores';
    console.error(err);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-10 text-center">
          All Scores Leaderboard
        </h1>

        {errorMsg ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-center">
            {errorMsg}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 text-gray-600 text-xl">
            No scores have been recorded yet.
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
                        {rank <= 3 && (
                          <span className="ml-2 text-xl">
                            {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                              {playerName.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="font-medium text-gray-900">
                            {playerName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {entry.game_id ? `Game ${entry.game_id}` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                        {entry.duration_seconds}s
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
        )}
      </div>
    </div>
  );
}