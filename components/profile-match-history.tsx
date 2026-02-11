import { cn } from "@/lib/utils";
import type { GamerProfile } from "@/lib/profiles-data";

export function ProfileMatchHistory({ profile }: { profile: GamerProfile }) {
  return (
    <section>
      <h2 className="font-display text-lg font-bold uppercase tracking-wider text-foreground">
        Recent Matches
      </h2>
      <div className="mt-4 space-y-2">
        {profile.recentGames.map((game, i) => (
          <div
            key={`${game.date}-${i}`}
            className={cn(
              "flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors",
              game.result === "win"
                ? "border-primary/20"
                : "border-destructive/20",
            )}
          >
            {/* Result indicator */}
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold uppercase",
                game.result === "win"
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {game.result === "win" ? "W" : "L"}
            </div>

            {/* Game info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {game.game}
                </span>
                <span className="text-xs text-muted-foreground">
                  {game.score}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {"KDA: " + game.kda}
              </p>
            </div>

            {/* Time */}
            <span className="shrink-0 text-xs text-muted-foreground/70">
              {game.date}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
