import Link from "next/link";
import { notFound } from "next/navigation";
import StatusToggle from "@/components/admin/StatusToggle";
import StudentNotes, { type Note } from "@/components/admin/StudentNotes";
import { pct } from "@/lib/admin";
import { TYPE_LABELS, formatDate, type ItemType } from "@/lib/items";
import { PROJECT_BUCKET } from "@/lib/project-file";
import { requireProfile, type Profile } from "@/lib/session";

type History = {
  item_id: string;
  attended: boolean | null;
  created_at: string;
  items: { title: string; type: ItemType; starts_at: string | null } | null;
};

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-ink/55">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{children || "—"}</dd>
    </div>
  );
}

export default async function StudentFilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase, user } = await requireProfile("/admin/login");

  const { data: s } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle<Profile & { created_at: string }>();
  if (!s) notFound();

  const [{ data: hist }, { data: notes }] = await Promise.all([
    supabase
      .from("rsvps")
      .select("item_id,attended,created_at,items(title,type,starts_at)")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .returns<History[]>(),
    supabase.from("student_notes").select("id,note,created_at").eq("student_id", id).order("created_at", { ascending: false }).returns<Note[]>(),
  ]);
  const history = hist ?? [];
  const came = history.filter((h) => h.attended === true);
  const absent = history.filter((h) => h.attended === false).length;
  const lastCame = came.map((h) => h.items?.starts_at).filter(Boolean).sort().at(-1) ?? null;
  const pdfUrl = s.project_file
    ? (await supabase.storage.from(PROJECT_BUCKET).createSignedUrl(s.project_file, 3600)).data?.signedUrl ?? null
    : null;

  const card = "rounded-2xl border border-olive/10 bg-white p-5 shadow-sm sm:p-6";
  const stat = "rounded-2xl border border-olive/10 bg-white p-4 text-center shadow-sm";

  return (
    <>
      <Link href="/admin/students" className="inline-flex min-h-11 items-center gap-1 font-medium text-emerald hover:underline">
        <span aria-hidden="true">→</span> الطلبة
      </Link>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-olive">{s.full_name || "—"}</h1>
          <p className="mt-1 text-ink/70">
            {[s.specialty, s.level, s.faculty].filter(Boolean).join(" · ") || "—"}
            {s.status === "blocked" && <span className="ms-2 rounded-full bg-red-100 px-2 py-0.5 text-sm font-bold text-red-800">موقوف</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`mailto:${s.email}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-olive px-4 font-bold text-white hover:bg-emerald">✉ راسلو بالإيميل</a>
          {s.role === "student" && <StatusToggle id={s.id} status={s.status} />}
        </div>
      </div>

      {/* Stats */}
      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <li className={stat}><p className="text-sm text-ink/60">أكّد</p><p className="font-heading text-3xl font-bold text-olive">{history.length}</p></li>
        <li className={stat}><p className="text-sm text-ink/60">حضر</p><p className="font-heading text-3xl font-bold text-emerald">{came.length}</p></li>
        <li className={stat}><p className="text-sm text-ink/60">غاب</p><p className="font-heading text-3xl font-bold text-red-800">{absent}</p></li>
        <li className={stat}><p className="text-sm text-ink/60">نسبة الحضور</p><p className="font-heading text-3xl font-bold">{came.length + absent ? `${pct(came.length, came.length + absent)}%` : "—"}</p></li>
        <li className={`${stat} col-span-2 md:col-span-1`}><p className="text-sm text-ink/60">آخر حضور</p><p className="mt-2 text-sm font-bold">{lastCame ? formatDate(lastCame) : "—"}</p></li>
      </ul>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className={card} aria-labelledby="info-t">
          <h2 id="info-t" className="text-xl font-bold text-olive">المعلومات</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Info label="البريد الإلكتروني"><span dir="ltr">{s.email}</span></Info>
            <Info label="الهاتف">{s.phone && <a href={`tel:${s.phone}`} dir="ltr" className="hover:text-emerald">{s.phone}</a>}</Info>
            <Info label="الكلية">{s.faculty}</Info>
            <Info label="التخصص">{s.specialty}</Info>
            <Info label="المستوى">{s.level}</Info>
            <Info label="تاريخ التسجيل">{formatDate(s.created_at)}</Info>
          </dl>
        </section>

        <section className={card} aria-labelledby="proj-t">
          <h2 id="proj-t" className="text-xl font-bold text-olive">المشروع</h2>
          <p className="mt-4 text-lg font-bold">{s.project_title || "—"}</p>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-ink/85">{s.project_idea || "—"}</p>
          <p className="mt-4 text-sm text-ink/55">النموذج الأولي</p>
          <p className="font-medium">{s.has_prototype ? s.prototype_desc || "نعم" : "لا يوجد"}</p>
          {s.prototype_link && (
            <a href={s.prototype_link} target="_blank" rel="noopener noreferrer" dir="ltr" className="mt-1 block break-all text-emerald underline">{s.prototype_link}</a>
          )}
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-gold px-4 font-bold text-ink hover:bg-gold-light">📄 فتح ملف المشروع (PDF)</a>
          )}
        </section>
      </div>

      <section className={`${card} mt-6`} aria-labelledby="hist-t">
        <h2 id="hist-t" className="text-xl font-bold text-olive">سجل الدورات</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-ink/50">لم يسجّل في أي دورة بعد.</p>
        ) : (
          <ul className="mt-3 divide-y divide-olive/10">
            {history.map((h) => (
              <li key={h.item_id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <Link href={`/admin/items/${h.item_id}`} className="font-bold hover:text-emerald hover:underline">{h.items?.title ?? "—"}</Link>
                  <p className="text-sm text-ink/55">
                    {h.items ? TYPE_LABELS[h.items.type] : ""}
                    {h.items?.starts_at && ` · ${formatDate(h.items.starts_at)}`}
                  </p>
                </div>
                <div className="flex gap-2 text-sm font-bold">
                  <span className="rounded-full bg-olive/10 px-2 py-0.5 text-olive">أكّد ✓</span>
                  {h.attended === true && <span className="rounded-full bg-emerald/15 px-2 py-0.5 text-emerald">حضر ✓</span>}
                  {h.attended === false && <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-800">غاب ✗</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`${card} mt-6`} aria-labelledby="notes-t">
        <h2 id="notes-t" className="text-xl font-bold text-olive">ملاحظات المتابعة</h2>
        <p className="mb-4 mt-1 text-sm text-ink/55">خاصة بالإدارة — الطالب لا يراها.</p>
        <StudentNotes studentId={s.id} adminId={user.id} initial={notes ?? []} />
      </section>
    </>
  );
}
