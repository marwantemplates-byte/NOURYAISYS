import type { EmailOtpType } from "@supabase/supabase-js";
import { after, NextResponse, type NextRequest } from "next/server";
import { sendWelcomeOnce } from "@/lib/auto-emails";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing route for email links (sign-up confirmation, password recovery).
 * Supports both formats:
 *  - ?token_hash=...&type=signup|recovery|email  (recommended email templates, works on any device)
 *  - ?code=...                                    (default PKCE links, same browser only)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"), type === "recovery" ? "/reset-password" : "/app");

  const supabase = await createClient();
  let ok = false;
  if (tokenHash && type) {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  } else if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  }

  if (!ok) return NextResponse.redirect(new URL("/login?error=link", origin));

  // Account just confirmed → welcome email (in the background, once)
  if (type !== "recovery") {
    const { data } = await supabase.auth.getClaims();
    const uid = data?.claims?.sub;
    if (uid) after(() => sendWelcomeOnce(supabase, uid));
  }
  return NextResponse.redirect(new URL(next, origin));
}
