import Image from "next/image";
import Link from "next/link";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROFILES, type GamerProfile } from "@/lib/profiles-data";

export function ProfileFriends({ profile }: { profile: GamerProfile }) {
  const friends = profile.friends
    .map((id) => PROFILES.find((p) => p.id === id))
    .filter(Boolean) as GamerProfile[];

  if (friends.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-lg font-bold uppercase tracking-wider text-foreground">
        {"Friends (" + friends.length + ")"}
      </h2>
      <div className="mt-4 space-y-2">
        {friends.map((friend) => (
          <Link
            key={friend.id}
            href={`/profile/${friend.id}`}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/20"
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border">
              <Image
                src={friend.avatar || "/placeholder.svg"}
                alt={`${friend.username}'s avatar`}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">
                {friend.username}
              </span>
              <span className="flex items-center gap-1.5 mt-0.5">
                <Circle
                  className={cn(
                    "h-2 w-2 fill-current",
                    friend.status === "online" && "text-primary",
                    friend.status === "in-game" && "text-amber-400",
                    friend.status === "offline" && "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] capitalize",
                    friend.status === "online" && "text-primary",
                    friend.status === "in-game" && "text-amber-400",
                    friend.status === "offline" && "text-muted-foreground",
                  )}
                >
                  {friend.status === "in-game" ? "In Game" : friend.status}
                </span>
              </span>
            </div>
            <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
              {friend.rank}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
