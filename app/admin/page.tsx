import AdminOverview, { type LatestStudent } from "@/components/admin/AdminOverview";
import { requireProfile } from "@/lib/session";

/** Admin overview (first version): registration numbers + latest students. */
export default async function AdminHome() {
  const { supabase, profile } = await requireProfile();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  const [total, week, withPdf, latest] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student").gte("created_at", weekAgo),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student").not("project_file", "is", null),
    supabase
      .from("profiles")
      .select("id,full_name,email,specialty,level,project_title,created_at")
      .eq("role", "student")
      .order("created_at", { ascending: false })
      .limit(8)
      .returns<LatestStudent[]>(),
  ]);

  return (
    <AdminOverview
      name={profile?.full_name || "بالمدير"}
      total={total.count ?? 0}
      week={week.count ?? 0}
      withPdf={withPdf.count ?? 0}
      latest={latest.data ?? []}
    />
  );
}
