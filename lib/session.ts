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
  role: "student" | "admin";
  status: "active" | "blocked";
};

/** Signed-in user + profile for /app pages (cached per request). Redirects to /login if signed out. */
export const requireProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/app");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
  return { supabase, user, profile };
});
