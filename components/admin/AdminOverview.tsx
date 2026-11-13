import Link from "next/link";

export type LatestStudent = {
  id: string;
  full_name: string;
  email: string;
  specialty: string | null;
  level: string | null;
  project_title: string | null;
  created_at: string;
};

/** Admin overview UI (data comes from app/admin/page.tsx). */
export default function AdminOverview({
  name,
  total,
  week,
  withPdf,
  latest,
}: {
  name: string;
  total: number;
  week: number;
  withPdf: number;
  latest: LatestStudent[];
}) {
  const stats = [
    { label: "عدد المسجلين", value: total, big: true },
    { label: "تسجيلات هذا الأسبوع", value: week },
    { label: "ملفات مشاريع (PDF)", value: withPdf },
  ];
  const fmt = new Intl.DateTimeFormat("ar-DZ", { day: "numeric", month: "long", timeZone: "Africa/Algiers" });

  return (
    <>
      <h1 className="text-3xl font-bold text-olive">مرحبًا {name} 👋</h1>
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
        <div className="flex items-center justify-between gap-3">
          <h2 id="latest-title" className="text-xl font-bold text-olive">آخر المسجلين</h2>
          <Link href="/admin/students" className="inline-flex min-h-11 items-center rounded-xl border-2 border-olive/20 px-4 font-bold text-olive hover:border-olive">
            جدول كل الطلبة ←
          </Link>
        </div>
        {latest.length > 0 ? (
          <ul className="mt-4 divide-y divide-olive/10 rounded-2xl border border-olive/10 bg-white shadow-sm">
            {latest.map((s) => (
              <li key={s.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink">{s.full_name || "—"}</p>
                  <p className="truncate text-sm text-ink/60" dir="ltr">{s.email}</p>
                </div>
                <p className="text-sm text-ink/80 sm:w-48">
                  {[s.specialty, s.level].filter(Boolean).join(" · ") || "—"}
                </p>
                <p className="text-sm text-ink/80 sm:w-64 sm:truncate">{s.project_title || "—"}</p>
                <p className="text-xs text-ink/50 sm:w-24 sm:text-left">{fmt.format(new Date(s.created_at))}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-olive/20 bg-white/60 p-8 text-center text-ink/60">
            لا يوجد طلبة مسجلون بعد.
          </p>
        )}
      </section>
    </>
  );
}
