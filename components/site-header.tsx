import Link from "next/link";
import { Crosshair } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Crosshair className="h-6 w-6 text-primary" />
          <span className="font-display text-xl font-bold uppercase tracking-wider text-foreground">
            NEXUS<span className="text-primary">Arena</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          <Link
            href="/"
            className="text-sm font-medium text-primary transition-colors"
          >
            Players
          </Link>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Leaderboards
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Tournaments
          </a>
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            News
          </a>
        </nav>

        {/* CTA */}
        <button
          type="button"
          className="rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Sign In
        </button>
      </div>
    </header>
  );
}
