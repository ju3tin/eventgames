import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Circle, MessageSquare, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GamerProfile } from "@/lib/profiles-data";

function StatusDot({ status }: { status: GamerProfile["status"] }) {
  return (
    <span className="flex items-center gap-1.5">
      <Circle
        className={cn(
          "h-2.5 w-2.5 fill-current",
          status === "online" && "text-primary",
          status === "in-game" && "text-amber-400",
          status === "offline" && "text-muted-foreground",
        )}
      />
      <span
        className={cn(
          "text-xs font-medium capitalize",
          status === "online" && "text-primary",
          status === "in-game" && "text-amber-400",
          status === "offline" && "text-muted-foreground",
        )}
      >
        {status === "in-game" ? "In Game" : status}
      </span>
    </span>
  );
}

export function ProfileHero({ profile }: { profile: GamerProfile }) {
  return (
    <section className="relative">
      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden sm:h-56 md:h-64">
        <Image
          src={profile.banner || "/placeholder.svg"}
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* Back button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg bg-secondary/80 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Players
        </Link>
      </div>

      {/* Profile info overlapping banner */}
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-16 flex flex-col gap-5 sm:-mt-20 sm:flex-row sm:items-end sm:gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="relative h-28 w-28 overflow-hidden rounded-xl border-4 border-background sm:h-32 sm:w-32">
              <Image
                src={profile.avatar || "/placeholder.svg"}
                alt={`${profile.username}'s avatar`}
                fill
                className="object-cover"
              />
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-lg border-2 border-background bg-primary text-sm font-bold text-primary-foreground">
              {profile.level}
            </div>
          </div>

          {/* Name and meta */}
          <div className="flex-1 pb-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground sm:text-3xl">
                {profile.username}
              </h1>
              <Badge
                variant="outline"
                className="border-primary/30 text-primary text-xs uppercase tracking-widest"
              >
                {profile.rank}
              </Badge>
              <StatusDot status={profile.status} />
            </div>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground/70">
              {"Joined " + profile.joinedDate + " \u00B7 " + profile.mainGame + " main"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 gap-2 pb-1">
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Add Friend
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:bg-secondary/80"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Message
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
