import Link from "next/link";
import { pct } from "@/lib/admin";
import { ITEM_COLUMNS, TYPE_LABELS, formatDate, type Item } from "@/lib/items";
import { requireProfile } from "@/lib/session";

type Student = { id: string; full_name: string; specialty: string | null; level: string | null; has_prototype: boolean; project_file: string | null; created_at: string };

function Bars({ title, data, total }: { title: string; data: [string, number][]; total: number }) {
  return (
    <section className="rounded-2xl border border-olive/10 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-olive">{title}</h2>
      {data.length === 0 ? (
        <p className="mt-3 text-ink/50">لا توجد بيانات بعد.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {data.map(([label, n]) => (
            <li key={label}>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-ink">{label}</span>
                <span className="text-ink/60">{n}</span>
              </div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-olive/10" aria-hidden="true">
                <div className="h-full rounded-full bg-emerald" style={{ width: `${Math.max(4, pct(n, total))}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const count = (arr: (string | null)[]) => {
  const m = new Map<string, number>();
  for (const v of arr) m.set(v?.trim() || "غير محدد", (m.get(v?.trim() || "غير محدد") ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

export default async function AdminHome() {
  const { supabase, profile } = await requireProfile("/admin/login");
  const nowIso = new Date().toISOString();
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;

  const [{ data: st }, { data: rs }, { data: up }] = await Promise.all([
    supabase.from("profiles").select("id,full_name,specialty,level,has_prototype,project_file,created_at").eq("role", "student").returns<Student[]>(),
    supabase.from("rsvps").select("user_id,item_id,attended"),
    supabase.from("items").select(ITEM_COLUMNS).eq("published", true).in("type", ["event", "course"]).gte("starts_at", nowIso).order("starts_at").limit(5).returns<Item[]>(),
  ]);
  const students = st ?? [];
  const rsvps = (rs ?? []) as { user_id: string; item_id: string; attended: boolean | null }[];
  const upcoming = up ?? [];

  const total = students.length;
  const thisWeek = students.filter((s) => new Date(s.created_at).getTime() >= weekAgo).length;
  const withProto = students.filter((s) => s.has_prototype).length;
  const came = rsvps.filter((r) => r.attended === true).length;
  const marked = rsvps.filter((r) => r.attended !== null).length;

  const confirmedByItem = new Map<string, number>();
  for (const r of rsvps) confirmedByItem.set(r.item_id, (confirmedByItem.get(r.item_id) ?? 0) + 1);

  const cameByStudent = new Map<string, number>();
  for (const r of rsvps) if (r.attended === true) cameByStudent.set(r.user_id, (cameByStudent.get(r.user_id) ?? 0) + 1);
  const names = new Map(students.map((s) => [s.id, s.full_name]));
  const top = [...cameByStudent.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const stats = [
    { label: "عدد المسجلين", value: total, big: true },
    { label: "جدد هذا الأسبوع", value: thisWeek },
    { label: "نسبة الحضور العامة", value: marked ? `${pct(came, marked)}%` : "—" },
    { label: "عندهم نموذج أولي", value: withProto },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold text-olive">مرحبًا {profile?.full_name || ""} 👋</h1>
      <p className="mt-1 text-ink/70">نظرة عامة على الحاضنة.</p>

      <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label} className={`rounded-2xl p-5 shadow-sm ${s.big ? "bg-olive text-white" : "border border-olive/10 bg-white"}`}>
            <p className={`text-sm font-medium ${s.big ? "text-gold-light" : "text-ink/60"}`}>{s.label}</p>
            <p className="mt-1 font-heading text-4xl font-bold md:text-5xl">{s.value}</p>
          </li>
        ))}
      </ul>

      <section className="mt-6 rounded-2xl border border-olive/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-olive">الدورات القادمة</h2>
          <Link href="/admin/items/new" className="inline-flex min-h-11 items-center rounded-xl bg-gold px-4 font-bold text-ink hover:bg-gold-light">+ دورة جديدة</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-ink/50">لا توجد دورات قادمة منشورة.</p>
        ) : (
          <ul className="mt-3 divide-y divide-olive/10">
            {upcoming.map((it) => {
              const n = confirmedByItem.get(it.id) ?? 0;
              return (
                <li key={it.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <Link href={`/admin/items/${it.id}`} className="font-bold hover:text-emerald hover:underline">{it.title}</Link>
                    <p className="text-sm text-ink/55">{TYPE_LABELS[it.type]} · {formatDate(it.starts_at)}</p>
                  </div>
                  <span className="rounded-full bg-emerald/10 px-3 py-1 text-sm font-bold text-emerald">
                    {n}{it.capacity ? ` / ${it.capacity}` : ""} مؤكَّد
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Bars title="حسب التخصص" data={count(students.map((s) => s.specialty)).slice(0, 8)} total={total} />
        <Bars title="حسب المستوى" data={count(students.map((s) => s.level))} total={total} />
        <section className="rounded-2xl border border-olive/10 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-olive">الأكثر حضورًا</h2>
          {top.length === 0 ? (
            <p className="mt-3 text-ink/50">لم يُسجَّل أي حضور بعد.</p>
          ) : (
            <ol className="mt-3 space-y-2">
              {top.map(([id, n], i) => (
                <li key={id} className="flex items-center justify-between gap-2">
                  <Link href={`/admin/students/${id}`} className="truncate font-medium hover:text-emerald hover:underline">
                    {i + 1}. {names.get(id) || "—"}
                  </Link>
                  <span className="shrink-0 text-sm text-ink/60">{n} حضور</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <div className="mt-6">
        <Link href="/admin/students" className="inline-flex min-h-11 items-center rounded-xl border-2 border-olive/20 px-4 font-bold text-olive hover:border-olive">جدول كل الطلبة ←</Link>
      </div>
    </>
  );
}
