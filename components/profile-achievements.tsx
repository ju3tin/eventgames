import { Award } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GamerProfile } from "@/lib/profiles-data";

const RARITY_STYLES = {
  common: {
    border: "border-muted-foreground/30",
    badge: "bg-muted text-muted-foreground",
    icon: "text-muted-foreground",
  },
  rare: {
    border: "border-blue-500/30",
    badge: "bg-blue-500/10 text-blue-400",
    icon: "text-blue-400",
  },
  epic: {
    border: "border-amber-500/30",
    badge: "bg-amber-500/10 text-amber-400",
    icon: "text-amber-400",
  },
  legendary: {
    border: "border-primary/30",
    badge: "bg-primary/10 text-primary",
    icon: "text-primary",
  },
};

export function ProfileAchievements({ profile }: { profile: GamerProfile }) {
  return (
    <section>
      <h2 className="font-display text-lg font-bold uppercase tracking-wider text-foreground">
        Achievements
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {profile.achievements.map((ach) => {
          const style = RARITY_STYLES[ach.rarity];
          return (
            <div
              key={ach.name}
              className={cn(
                "flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors",
                style.border,
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  style.badge,
                )}
              >
                <Award className={cn("h-5 w-5", style.icon)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {ach.name}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      style.badge,
                    )}
                  >
                    {ach.rarity}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {ach.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
