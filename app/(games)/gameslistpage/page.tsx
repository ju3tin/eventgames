// app/gameslist/page.tsx
import { createClient } from '@/lib/supabase/server1' // adjust path if needed

// Define a TypeScript type matching your table (optional but recommended)
type Game = {
  id: number
  created_at: string
  title: string
  description: string | null
  icon: string | null
  difficulty: string | null
  duration: number | null
  calories: number | null
  players: number | null
  color: string | null
  link: string | null
  isLocked: boolean | null
  comingSoon: boolean | null
}

export default async function GamesListPage() {
  const supabase = createClient()

  // Fetch all rows from gameslist table
  const { data: games, error } = await supabase
    .from('gameslist')
    .select('*')
    .order('id', { ascending: true }) // optional: sort by id

  if (error) {
    console.error('Error fetching games:', error)
    return (
      <div className="p-8 text-red-600">
        Error loading games: {error.message}
      </div>
    )
  }

  if (!games || games.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Games List</h1>
        <p className="text-gray-500">No games found in the database yet.</p>
        <p className="mt-2">Add some rows in Supabase Table Editor!</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Games List</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game: Game) => (
          <div
            key={game.id}
            className="bg-white border rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            style={game.color ? { borderTop: `4px solid ${game.color}` } : {}}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                {game.icon && (
                  <div className="text-4xl">{game.icon}</div> // assuming emoji/icon string
                )}
                <h2 className="text-2xl font-semibold">{game.title}</h2>
              </div>

              <p className="text-gray-600 mb-4">{game.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Difficulty:</span>{' '}
                  {game.difficulty || '—'}
                </div>
                <div>
                  <span className="font-medium">Duration:</span>{' '}
                  {game.duration ? `${game.duration} min` : '—'}
                </div>
                <div>
                  <span className="font-medium">Calories:</span>{' '}
                  {game.calories || '—'}
                </div>
                <div>
                  <span className="font-medium">Players:</span>{' '}
                  {game.players || '—'}
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                {game.isLocked && (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    Locked
                  </span>
                )}
                {game.comingSoon && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    Coming Soon
                  </span>
                )}
                {game.link && (
                  <a
                    href={game.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Play →
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-gray-500 mt-10 text-sm">
        Fetched {games.length} game{games.length !== 1 ? 's' : ''} from Supabase
      </p>
    </div>
  )
}