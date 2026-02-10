import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type PageProps = {
  params: {
    username: string
  }
}

export default async function Page({ params }: PageProps) {
  const { username } = params

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    console.error('Supabase error:', error)
  } else {
    console.log('Profile:', data)
  }

  return (
    <main>
      <h1>Profile page</h1>
      <p>Username: {username}</p>
      <p>Check the server console</p> 
    </main>
  )
}
