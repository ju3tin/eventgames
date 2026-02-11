"use client";

import { useState } from "react";
import { Search, Users } from "lucide-react";
import { GamerProfileCard } from "@/components/gamer-profile-card";
import { PROFILES } from "@/lib/profiles-data";

export function ProfilesGrid() {
  const [search, setSearch] = useState("");

  const filtered = PROFILES.filter((p) =>
    p.username.toLowerCase().includes(search.toLowerCase())
  );

  const onlineCount = PROFILES.filter(
    (p) => p.status === "online" || p.status === "in-game"
  ).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-foreground sm:text-4xl">
            All Players
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {PROFILES.length} registered players &middot; {onlineCount} online
              now
            </span>
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 pl-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            aria-label="Search players by username"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((profile) => (
          <GamerProfileCard key={profile.id} profile={profile} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Users className="h-10 w-10 text-muted-foreground" />
          <p className="text-lg font-semibold text-foreground">
            No players found
          </p>
          <p className="text-sm text-muted-foreground">
            {"Try a different search term."}
          </p>
        </div>
      )}
    </main>
  );
}
