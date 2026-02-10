import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server"
import AuthErrorPage from "@/app/(games)/auth/error/page";

export async function POST(req: Request) {
 const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user ) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // 2️⃣ Parse body
  const body = await req.json();
  const { game_id, score, duration_seconds, metadata } = body;

  // 3️⃣ Validate input
  if (!game_id || typeof score !== "number" || typeof duration_seconds !== "number") {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 }
    );
  }

  if (score < 0 || duration_seconds < 0) {
    return NextResponse.json(
      { error: "Score and duration must be >= 0" },
      { status: 400 }
    );
  }

  // 4️⃣ Insert score
  const { error: insertError } = await supabase
    .from("leaderboard")
    .insert({
      user_id: user.id,
      game_id,
      score,
      duration_seconds,
      metadata: metadata ?? null,
    });

  if (insertError) {
    console.error(insertError);
    return NextResponse.json(
      { error: "Failed to submit score" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
