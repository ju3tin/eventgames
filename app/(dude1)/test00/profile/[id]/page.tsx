import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { ProfileHero } from "@/components/profile-hero";
import { ProfileStats } from "@/components/profile-stats";
import { ProfileMatchHistory } from "@/components/profile-match-history";
import { ProfileAchievements } from "@/components/profile-achievements";
import { ProfileFriends } from "@/components/profile-friends";
import { getProfileById, PROFILES } from "@/lib/profiles-data";

export function generateStaticParams() {
  return PROFILES.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = getProfileById(Number(id));
  if (!profile) {
    return { title: "Player Not Found - NEXUS Arena" };
  }
  return {
    title: `${profile.username} - NEXUS Arena`,
    description: `View ${profile.username}'s gamer profile. ${profile.rank} rank, ${profile.wins} wins, ${profile.kd} K/D.`,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = getProfileById(Number(id));

  if (!profile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <ProfileHero profile={profile} />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-8">
          {/* Main content */}
          <div className="flex-1 space-y-10">
            <ProfileStats profile={profile} />
            <ProfileMatchHistory profile={profile} />
            <ProfileAchievements profile={profile} />
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <ProfileFriends profile={profile} />
          </aside>
        </div>
      </div>
    </div>
  );
}
