"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidateTag } from "next/cache"

export async function saveScore(gameId: string, score: number, durationSeconds: number) {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { error: "Not authenticated" }
  }

  // Check if profile exists, create if not
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single()

  if (!profile) {
    const displayName = user.email?.split("@")[0] || "Player"
    await supabase
      .from("profiles")
      .insert({ id: user.id, display_name: displayName })
  }

  const { error } = await supabase
    .from("game_scores")
    .insert({
      user_id: user.id,
      game_id: gameId,
      score,
      duration_seconds: durationSeconds
    })

  if (error) {
    console.error("Error saving score:", error)
    return { error: "Failed to save score" }
  }

  revalidateTag("leaderboard", "max")
  return { success: true }
}

export async function getTopScores(gameId: string, limit = 10) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("game_scores")
    .select(`
      id,
      score,
      duration_seconds,
      created_at,
      profiles (
        display_name
      )
    `)
    .eq("game_id", gameId)
    .order("score", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching scores:", error)
    return []
  }

  return data
}