"use client";

import { useState } from "react";
import { Alert, Textarea } from "@/components/ui/form";
import Spinner from "@/components/ui/Spinner";
import { createClient } from "@/lib/supabase/client";

export type Note = { id: string; note: string; created_at: string };

const fmt = new Intl.DateTimeFormat("ar-DZ", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Algiers" });

/** Admin-only follow-up notes on a student (students never see them). */
export default function StudentNotes({ studentId, adminId, initial }: { studentId: string; adminId: string; initial: Note[] }) {
  const [notes, setNotes] = useState(initial);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    const { data, error } = await createClient()
      .from("student_notes")
      .insert({ student_id: studentId, note: text.trim(), created_by: adminId })
      .select("id,note,created_at")
      .single();
    setBusy(false);
    if (error || !data) return setError("تعذّر الحفظ: " + (error?.message ?? ""));
    setNotes((n) => [data as Note, ...n]);
    setText("");
  };

  const remove = async (id: string) => {
    if (!window.confirm("حذف هذه الملاحظة؟")) return;
    const { error } = await createClient().from("student_notes").delete().eq("id", id);
    if (error) return setError("تعذّر الحذف: " + error.message);
    setNotes((n) => n.filter((x) => x.id !== id));
  };

  return (
    <div>
      <form onSubmit={add} className="space-y-3">
        <label htmlFor="note" className="sr-only">ملاحظة جديدة</label>
        <Textarea id="note" value={text} onChange={(e) => setText(e.target.value)} placeholder="مثال: قدّم النموذج الأولي — يحتاج مرافقة في التمويل…" className="min-h-24" />
        {error && <Alert>{error}</Alert>}
        <button type="submit" disabled={busy || !text.trim()} className={`inline-flex min-h-11 items-center gap-2 rounded-xl bg-olive px-5 font-bold text-white hover:bg-emerald disabled:opacity-50 ${busy ? "pending-ring" : ""}`}>
          {busy && <Spinner className="h-4 w-4" />} إضافة الملاحظة
        </button>
      </form>
      {notes.length === 0 ? (
        <p className="mt-4 text-ink/50">لا توجد ملاحظات بعد.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="rounded-xl border border-gold/30 bg-gold-light/20 p-4">
              <p className="whitespace-pre-line leading-relaxed text-ink">{n.note}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-ink/50">
                <span>{fmt.format(new Date(n.created_at))}</span>
                <button type="button" onClick={() => remove(n.id)} className="min-h-9 px-2 text-red-800 hover:underline">حذف</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
