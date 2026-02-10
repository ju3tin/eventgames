import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server";

export async function GET() {
 const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ loggedIn: false }, { status: 200 });
  }

  return NextResponse.json({
    loggedIn: true,
    user: {
      id: user.id,
      email: user.email,
    },
  });
}
