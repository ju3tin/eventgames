import { GameCard } from '@/components/game-card'
import { games } from '@/lib/games-data'

export function GamesGrid() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4">
            Choose Your Game
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select from our collection of motion-controlled mini games
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
      </div>
    </section>
  )
}
