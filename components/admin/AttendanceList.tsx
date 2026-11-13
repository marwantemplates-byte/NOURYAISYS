"use client";

import { useMemo, useState } from "react";
import Spinner from "@/components/ui/Spinner";
import { downloadCsv, pct } from "@/lib/admin";
import { createClient } from "@/lib/supabase/client";

export type AttendeeRow = {
  user_id: string;
  attended: boolean | null;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  specialty: string | null;
  level: string | null;
};

/** Confirmed students for one course + actual attendance (حاضر / غائب). */
export default function AttendanceList({ itemId, itemTitle, adminId, rows: initial }: { itemId: string; itemTitle: string; adminId: string; rows: AttendeeRow[] }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const confirmed = rows.length;
    const came = rows.filter((r) => r.attended === true).length;
    const absent = rows.filter((r) => r.attended === false).length;
    return { confirmed, came, absent, rate: pct(came, came + absent) };
  }, [rows]);

  const mark = async (userId: string, value: boolean | null) => {
    setBusy(userId + String(value));
    setError("");
    const { error } = await createClient()
      .from("rsvps")
      .update({ attended: value, checked_at: value === null ? null : new Date().toISOString(), checked_by: value === null ? null : adminId })
      .eq("item_id", itemId)
      .eq("user_id", userId);
    setBusy(null);
    if (error) return setError("تعذّر الحفظ: " + error.message);
    setRows((rs) => rs.map((r) => (r.user_id === userId ? { ...r, attended: value } : r)));
  };

  const exportCsv = () =>
    downloadCsv(
      `hodour-${itemId.slice(0, 8)}.csv`,
      ["الاسم", "البريد الإلكتروني", "الهاتف", "التخصص", "المستوى", "تاريخ التأكيد", "الحضور"],
      rows.map((r) => [r.full_name, r.email, r.phone, r.specialty, r.level, new Date(r.created_at).toLocaleString("fr-DZ"), r.attended === true ? "حاضر" : r.attended === false ? "غائب" : "—"]),
    );

  const card = "rounded-2xl border border-olive/10 bg-white p-4 text-center shadow-sm";

  return (
    <>
      <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <li className={card}><p className="text-sm text-ink/60">أكّدوا</p><p className="font-heading text-4xl font-bold text-olive">{stats.confirmed}</p></li>
        <li className={card}><p className="text-sm text-ink/60">حضروا</p><p className="font-heading text-4xl font-bold text-emerald">{stats.came}</p></li>
        <li className={card}><p className="text-sm text-ink/60">غابوا</p><p className="font-heading text-4xl font-bold text-red-800">{stats.absent}</p></li>
        <li className={card}><p className="text-sm text-ink/60">نسبة الحضور</p><p className="font-heading text-4xl font-bold text-ink">{stats.rate}%</p></li>
      </ul>

      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={exportCsv} disabled={!rows.length} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald px-5 font-bold text-white hover:bg-olive disabled:opacity-50">
          ⬇ تصدير Excel
        </button>
        <a href={`/admin/emails?item=${itemId}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-olive/25 px-5 font-bold text-olive hover:border-olive">
          ✉ راسلهم بالإيميل
        </a>
      </div>
      {error && <p role="alert" className="mt-3 font-medium text-red-700">{error}</p>}

      {rows.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-olive/20 bg-white/70 p-10 text-center text-ink/60">لم يؤكد أي طالب حضوره في «{itemTitle}» بعد.</p>
      ) : (
        <ul className="mt-6 divide-y divide-olive/10 rounded-2xl border border-olive/10 bg-white shadow-sm">
          {rows.map((r, i) => (
            <li key={r.user_id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">
                  <span className="text-ink/40">{i + 1}. </span>
                  <a href={`/admin/students/${r.user_id}`} className="hover:text-emerald hover:underline">{r.full_name || "—"}</a>
                </p>
                <p className="truncate text-sm text-ink/60">
                  <span dir="ltr">{r.email}</span>
                  {r.specialty && ` · ${r.specialty}`}
                  {r.level && ` · ${r.level}`}
                </p>
              </div>
              <div className="flex items-center gap-2" role="group" aria-label={`حضور ${r.full_name}`}>
                <button
                  type="button"
                  aria-pressed={r.attended === true}
                  disabled={!!busy}
                  onClick={() => mark(r.user_id, r.attended === true ? null : true)}
                  className={`inline-flex min-h-11 items-center gap-1 rounded-xl px-4 font-bold transition-colors ${
                    r.attended === true ? "bg-emerald text-white" : "border-2 border-emerald/30 text-emerald hover:bg-emerald/10"
                  } ${busy === r.user_id + String(r.attended === true ? null : true) ? "pending-ring" : ""}`}
                >
                  {busy === r.user_id + String(r.attended === true ? null : true) && <Spinner className="h-4 w-4" />} حاضر ✓
                </button>
                <button
                  type="button"
                  aria-pressed={r.attended === false}
                  disabled={!!busy}
                  onClick={() => mark(r.user_id, r.attended === false ? null : false)}
                  className={`inline-flex min-h-11 items-center gap-1 rounded-xl px-4 font-bold transition-colors ${
                    r.attended === false ? "bg-red-700 text-white" : "border-2 border-red-700/30 text-red-800 hover:bg-red-50"
                  } ${busy === r.user_id + String(r.attended === false ? null : false) ? "pending-ring" : ""}`}
                >
                  {busy === r.user_id + String(r.attended === false ? null : false) && <Spinner className="h-4 w-4" />} غائب ✗
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
