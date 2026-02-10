import { GameCard } from '@/components/game-card'
//import { games } from '@/lib/games-data'
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function GamesGrid() {
   const supabase = await createClient()



  const { data: games1, error } = await supabase
    .from("gameslist")
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
           {games1?.map(game => (
              <GameCard
                key={game.game_id}
                id={game.game_id}
                title={game.title}
                description={game.description}
                icon={game.icon}
                difficulty={game.difficulty}
                duration={game.duration}
                calories={game.calories}
                players={game.players}
                color={game.color}
                link={game.link}
                isLocked={game.isLocked}
              />
            ))}
        </div>
      </div>
    </section>
  )
}
