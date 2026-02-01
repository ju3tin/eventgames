'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProfile() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError && profileError.code !== 'PGRST116') {
    return { error: profileError.message }
  }

  return { 
    user,
    profile: profile || { id: user.id, display_name: null, avatar_url: null }
  }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const displayName = formData.get('display_name') as string
  const avatarUrl = formData.get('avatar_url') as string

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  let error

  if (existingProfile) {
    // Update existing profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: displayName || null,
        avatar_url: avatarUrl || null,
      })
      .eq('id', user.id)
    error = updateError
  } else {
    // Insert new profile
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        display_name: displayName || null,
        avatar_url: avatarUrl || null,
      })
    error = insertError
  }

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}