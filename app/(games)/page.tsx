import { HeroSection } from '@/components/hero-section'
import { FeaturesSection } from '@/components/features-section'
import { GamesGrid } from '@/components/games-grid'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <GamesGrid />
      </main>
      <Footer />
    </div>
  )
}
