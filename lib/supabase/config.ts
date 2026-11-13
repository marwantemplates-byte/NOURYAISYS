/**
 * Supabase public config.
 * The publishable key is designed to be public (RLS protects the data), so a default
 * is kept here so the site works even before Vercel env vars are set.
 * Override with NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
 * NEVER put the service_role / secret key in the code or in NEXT_PUBLIC_* variables.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bdsargwpkhqqoiuttdxh.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_iQsuZqpFRBQXwvRJU9IOIg_ZjrzjCNz";
