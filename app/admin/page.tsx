import { requireProfile } from "@/lib/session";

/** Admin overview (first version): registration numbers + latest students.
 *  Publishing courses (day 3) and students/attendance (day 4) come next. */
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
      .limit(8),
  ]);

  const stats = [
    { label: "عدد المسجلين", value: total.count ?? 0, big: true },
    { label: "تسجيلات هذا الأسبوع", value: week.count ?? 0 },
    { label: "ملفات مشاريع (PDF)", value: withPdf.count ?? 0 },
  ];
  const fmt = new Intl.DateTimeFormat("ar-DZ", { day: "numeric", month: "long", timeZone: "Africa/Algiers" });

  return (
    <>
      <h1 className="text-3xl font-bold text-olive">مرحبًا {profile?.full_name || "بالمدير"} 👋</h1>
      <p className="mt-2 text-lg text-ink/70">نظرة سريعة على التسجيلات.</p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <li key={s.label} className={`rounded-2xl p-6 shadow-sm ${s.big ? "bg-olive text-white" : "border border-olive/10 bg-white"}`}>
            <p className={`text-sm font-medium ${s.big ? "text-gold-light" : "text-ink/60"}`}>{s.label}</p>
            <p className="mt-2 font-heading text-5xl font-bold">{s.value}</p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="latest-title" className="mt-10">
        <h2 id="latest-title" className="text-xl font-bold text-olive">آخر المسجلين</h2>
        {latest.data && latest.data.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-olive/10 bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-right">
              <thead className="bg-olive/5 text-sm text-ink/70">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">الاسم</th>
                  <th scope="col" className="px-4 py-3 font-medium">التخصص</th>
                  <th scope="col" className="px-4 py-3 font-medium">المستوى</th>
                  <th scope="col" className="px-4 py-3 font-medium">المشروع</th>
                  <th scope="col" className="px-4 py-3 font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {latest.data.map((s) => (
                  <tr key={s.id} className="border-t border-olive/10">
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink">{s.full_name || "—"}</span>
                      <span className="block text-sm text-ink/60" dir="ltr">{s.email}</span>
                    </td>
                    <td className="px-4 py-3 text-ink/80">{s.specialty || "—"}</td>
                    <td className="px-4 py-3 text-ink/80">{s.level || "—"}</td>
                    <td className="px-4 py-3 text-ink/80">{s.project_title || "—"}</td>
                    <td className="px-4 py-3 text-sm text-ink/60">{fmt.format(new Date(s.created_at))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-olive/20 bg-white/60 p-8 text-center text-ink/60">
            لا يوجد طلبة مسجلون بعد.
          </p>
        )}
      </section>

      <p className="mt-10 rounded-xl border border-gold/40 bg-gold-light/30 p-4 text-ink/80">
        قريبًا في لوحة التحكم: نشر الدورات والأحداث، جدول كل الطلبة، تسجيل الحضور، والإيميل الجماعي.
      </p>
    </>
  );
}
