import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  faculty: string | null;
  specialty: string | null;
  level: string | null;
  project_title: string | null;
  project_idea: string | null;
  has_prototype: boolean;
  prototype_desc: string | null;
  prototype_link: string | null;
  project_file: string | null;
  role: "student" | "admin";
  status: "active" | "blocked";
};

/** Signed-in user + profile (cached per request). Redirects to `loginPath` if signed out. */
export const requireProfile = cache(async (loginPath: string = "/login?next=/app") => {
  const supabase = await createClient();
  // Local JWT verification (no extra request to Supabase Auth on every page)
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect(loginPath);
  const user = { id: claims.sub, email: (claims.email as string | undefined) ?? "" };
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
  return { supabase, user, profile };
});
