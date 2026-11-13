import StudentsTable, { type StudentRow } from "@/components/admin/StudentsTable";
import { requireProfile } from "@/lib/session";

export default async function StudentsPage() {
  const { supabase } = await requireProfile("/admin/login");
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id,full_name,email,phone,faculty,specialty,level,project_title,project_idea,has_prototype,prototype_desc,prototype_link,project_file,status,created_at",
    )
    .eq("role", "student")
    .order("created_at", { ascending: false })
    .returns<Omit<StudentRow, "confirmed" | "attended" | "rate">[]>();

  // Attendance per student (admin can read all rsvps)
  const { data: rsvps } = await supabase.from("rsvps").select("user_id,attended");
  const agg = new Map<string, { confirmed: number; came: number; absent: number }>();
  for (const r of rsvps ?? []) {
    const a = agg.get(r.user_id) ?? { confirmed: 0, came: 0, absent: 0 };
    a.confirmed++;
    if (r.attended === true) a.came++;
    if (r.attended === false) a.absent++;
    agg.set(r.user_id, a);
  }
  const rows: StudentRow[] = (data ?? []).map((s) => {
    const a = agg.get(s.id) ?? { confirmed: 0, came: 0, absent: 0 };
    return { ...s, confirmed: a.confirmed, attended: a.came, rate: a.came + a.absent > 0 ? Math.round((a.came / (a.came + a.absent)) * 100) : -1 };
  });

  return (
    <>
      <h1 className="text-3xl font-bold text-olive">الطلبة</h1>
      <p className="mt-1 text-ink/70">جدول كل المسجلين بمعلومات التسجيل.</p>
      {error ? (
        <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          تعذّر تحميل الطلبة. أعد تحميل الصفحة.
        </p>
      ) : (
        <StudentsTable rows={rows} />
      )}
    </>
  );
}
