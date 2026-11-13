import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

/** POST-only sign out (a form button), so links/prefetch can't log people out. */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // ?to=/admin/login for the admin; home page for students
  const to = safeNext(request.nextUrl.searchParams.get("to"), "/");
  return NextResponse.redirect(new URL(to, request.nextUrl.origin), { status: 303 });
}
