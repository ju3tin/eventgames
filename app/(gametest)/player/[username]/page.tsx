import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type PageProps = {
  params: Promise<{
    username: string
  }>
}

export default async function Page({ params }: PageProps) {
  const { username } = await params

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (error) {
    console.error('Supabase error:', error)
    return <div>Error loading profile</div>
  }

  if (!data) {
    return notFound()
  }

  console.log('Profile:', data)

  return (
    <main>
      <h1>Profile page</h1>
      <p>Username: {data.username}</p>
    </main>
  )
}
