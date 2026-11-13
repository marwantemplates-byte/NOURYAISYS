import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

/**
 * Refreshes the Supabase session cookie and guards private routes.
 * Real protection is RLS in the database; this only redirects for a good UX.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims() verifies the JWT locally (ES256 signing keys) — no network round trip,
  // and still refreshes an expired session. Much faster than getUser().
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims?.sub ? { id: data.claims.sub } : null;

  const { pathname, search } = request.nextUrl;
  const isAdminLogin = pathname === "/admin/login";
  const isAdmin = pathname.startsWith("/admin") && !isAdminLogin;
  const isStudent = pathname.startsWith("/app");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Admin pages → the admin's own login page (/admin/login), never the students' /login
  if (isAdmin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (isStudent && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  // Only where a session matters — the public home page stays static and fast.
  matcher: ["/app/:path*", "/admin/:path*", "/login", "/register", "/reset-password", "/auth/:path*"],
};
