import React from "react"
import {
  Trophy,
  Swords,
  Timer,
  Crosshair,
  Flame,
  Target,
  Gamepad2,
  TrendingUp,
} from "lucide-react";
import type { GamerProfile } from "@/lib/profiles-data";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

function StatCard({ icon, label, value, highlight }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 text-center transition-colors hover:border-primary/20">
      <div className={highlight ? "text-primary" : "text-muted-foreground"}>
        {icon}
      </div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="font-display text-xl font-bold tracking-wide text-foreground">
        {value}
      </span>
    </div>
  );
}

export function ProfileStats({ profile }: { profile: GamerProfile }) {
  return (
    <section>
      <h2 className="font-display text-lg font-bold uppercase tracking-wider text-foreground">
        Career Stats
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          label="Total Wins"
          value={profile.wins.toLocaleString()}
          highlight
        />
        <StatCard
          icon={<Swords className="h-5 w-5" />}
          label="K/D Ratio"
          value={profile.kd.toFixed(2)}
        />
        <StatCard
          icon={<Gamepad2 className="h-5 w-5" />}
          label="Total Matches"
          value={profile.totalMatches.toLocaleString()}
        />
        <StatCard
          icon={<Timer className="h-5 w-5" />}
          label="Hours Played"
          value={profile.hoursPlayed.toLocaleString()}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Win Rate"
          value={profile.winRate + "%"}
          highlight
        />
        <StatCard
          icon={<Crosshair className="h-5 w-5" />}
          label="Headshots"
          value={profile.headshots > 0 ? profile.headshots.toLocaleString() : "N/A"}
        />
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          label="Best Streak"
          value={profile.longestStreak.toString()}
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Top Agent"
          value={profile.topAgent}
        />
      </div>
    </section>
  );
}
