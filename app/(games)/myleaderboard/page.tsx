// app/leaderboard/page.tsx

interface Profile {
  username: string
  full_name: string
  avatar_url: string | null
}

interface LeaderboardEntry {
  id: string
  score: number
  game_id: number
  profiles: Profile
}

interface AggregatedPlayer {
  username: string
  totalScore: number
  totalGames: number
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { username?: string }
}) {
  // 1️⃣ Fetch leaderboard data
  const res = await fetch('https://motionplay.vercel.app/api/leaderboard', {
    cache: 'no-store',
  })
  const json = await res.json()
  const data: LeaderboardEntry[] = json.data

  // 2️⃣ Aggregate by username
  const playersMap = new Map<string, AggregatedPlayer>()

  for (const entry of data) {
    const username = entry.profiles.username

    if (!playersMap.has(username)) {
      playersMap.set(username, {
        username,
        totalScore: 0,
        totalGames: 0,
      })
    }

    const player = playersMap.get(username)!
    player.totalScore += entry.score
    player.totalGames += 1
  }

  let players = Array.from(playersMap.values())

  // 3️⃣ Filter by ?username=
  if (searchParams.username) {
    players = players.filter(
      (p) => p.username === searchParams.username
    )
  }

  // 4️⃣ Optional: sort by score desc
  players.sort((a, b) => b.totalScore - a.totalScore)

  return (
    <div style={{ padding: 24 }}>
      <h1>Leaderboard</h1>

      {searchParams.username && (
        <p>
          Filtering by username: <strong>{searchParams.username}</strong>
        </p>
      )}

      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Total Score</th>
            <th>Games Played</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => (
            <tr key={player.username}>
              <td>{player.username}</td>
              <td>{player.totalScore}</td>
              <td>{player.totalGames}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
