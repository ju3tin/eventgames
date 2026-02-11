import { SiteHeader } from "@/components/site-header";
import { ProfilesGrid } from "@/components/profiles-grid";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <ProfilesGrid />
    </div>
  );
}
