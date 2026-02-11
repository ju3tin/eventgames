"use client";

import Image from "next/image";
import Link from "next/link";
import { Gamepad2, Trophy, Swords, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GamerProfile } from "@/lib/profiles-data";

function StatusIndicator({ status }: { status: GamerProfile["status"] }) {
  return (
    <span className="flex items-center gap-1.5">
      <Circle
        className={cn(
          "h-2.5 w-2.5 fill-current",
          status === "online" && "text-primary",
          status === "in-game" && "text-amber-400",
          status === "offline" && "text-muted-foreground"
        )}
      />
      <span
        className={cn(
          "text-xs font-medium capitalize",
          status === "online" && "text-primary",
          status === "in-game" && "text-amber-400",
          status === "offline" && "text-muted-foreground"
        )}
      >
        {status === "in-game" ? "In Game" : status}
      </span>
    </span>
  );
}

export function GamerProfileCard({ profile }: { profile: GamerProfile }) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.15)]">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-primary/30 transition-all duration-300 group-hover:bg-primary/60" />

      <div className="p-5">
        {/* Avatar + Info Row */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border">
              <Image
                src={profile.avatar || "/placeholder.svg"}
                alt={`${profile.username}'s avatar`}
                fill
                className="object-cover"
              />
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
              {profile.level}
            </div>
          </div>

          {/* Username + Status */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-bold tracking-wide truncate text-foreground">
              {profile.username}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <StatusIndicator status={profile.status} />
            </div>
            <Badge
              variant="outline"
              className="mt-2 border-primary/30 text-primary text-[10px] uppercase tracking-widest"
            >
              {profile.rank}
            </Badge>
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-border" />

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="flex flex-col items-center gap-1">
            <Gamepad2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Game
            </span>
            <span className="text-xs font-semibold text-foreground truncate max-w-full">
              {profile.mainGame}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Trophy className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Wins
            </span>
            <span className="text-xs font-semibold text-foreground">
              {profile.wins.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Swords className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              K/D
            </span>
            <span className="text-xs font-semibold text-foreground">
              {profile.kd.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-secondary/50 px-5 py-3">
        <Link
          href={`/profile/${profile.id}`}
          className="block w-full text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
