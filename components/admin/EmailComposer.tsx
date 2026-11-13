"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert, Field, Input, Select, Textarea } from "@/components/ui/form";
import Spinner from "@/components/ui/Spinner";
import { createClient } from "@/lib/supabase/client";

type Student = { id: string; email: string; specialty: string | null };
type ItemOpt = { id: string; title: string };
type AudienceType = "all" | "specialty" | "item";

export default function EmailComposer({
  students,
  items,
  configured,
  initialItem,
}: {
  students: Student[];
  items: ItemOpt[];
  configured: boolean;
  initialItem?: string;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<AudienceType>(initialItem ? "item" : "all");
  const [specialty, setSpecialty] = useState("");
  const [itemId, setItemId] = useState(initialItem ?? "");
  const [itemEmails, setItemEmails] = useState<string[] | null>(null);
  const [busy, setBusy] = useState<"test" | "send" | null>(null);
  const [result, setResult] = useState<{ kind: "success" | "error" | "info"; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const specialties = useMemo(
    () => [...new Set(students.map((s) => s.specialty?.trim()).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "ar")),
    [students],
  );

  // Attendees of a course
  useEffect(() => {
    if (type !== "item" || !itemId) return setItemEmails(null);
    let cancel = false;
    createClient()
      .from("rsvps")
      .select("profiles!rsvps_user_id_fkey(email,status)")
      .eq("item_id", itemId)
      .then(({ data }: { data: unknown[] | null }) => {
        if (cancel) return;
        const rows = (data ?? []) as unknown as { profiles: { email: string; status: string } | null }[];
        setItemEmails(rows.filter((r) => r.profiles?.status === "active").map((r) => r.profiles!.email));
      });
    return () => {
      cancel = true;
    };
  }, [type, itemId]);

  const recipients = useMemo(() => {
    if (type === "item") return itemEmails ?? [];
    if (type === "specialty") return specialty ? students.filter((s) => s.specialty?.trim() === specialty).map((s) => s.email) : [];
    return students.map((s) => s.email);
  }, [type, specialty, itemEmails, students]);

  const audience = type === "all" ? { type } : type === "specialty" ? { type, value: specialty } : { type, item_id: itemId };

  const send = async (test: boolean) => {
    setResult(null);
    if (!subject.trim() || !body.trim()) return setResult({ kind: "error", text: "اكتب الموضوع والنص." });
    if (!test) {
      if (!recipients.length) return setResult({ kind: "error", text: "لا يوجد مستلمون." });
      if (!window.confirm(`إرسال هذا الإيميل إلى ${recipients.length} مستلم؟`)) return;
    }
    setBusy(test ? "test" : "send");
    try {
      const res = await fetch("/api/admin/emails", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subject, body, audience, test }),
      });
      const j = await res.json();
      if (!res.ok) {
        setResult({ kind: "error", text: j.message || j.error || "تعذّر الإرسال." });
      } else {
        setResult({
          kind: j.failed ? "info" : "success",
          text: test ? "تم إرسال نسخة تجريبية إلى بريدك." : `تم الإرسال: ${j.sent} نجح${j.failed ? ` — ${j.failed} فشل` : ""}.`,
        });
        if (!test) router.refresh();
      }
    } catch {
      setResult({ kind: "error", text: "تعذّر الاتصال بالخادم." });
    }
    setBusy(null);
  };

  const copyAll = async () => {
    const text = recipients.join(", ");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt("انسخ الإيميلات:", text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-5 rounded-2xl border border-olive/10 bg-white p-5 shadow-sm sm:p-6">
        {!configured && (
          <Alert kind="info">
            <strong>خدمة الإرسال غير مفعّلة بعد.</strong> أضف <code dir="ltr">GMAIL_USER</code> و <code dir="ltr">GMAIL_APP_PASSWORD</code> في Vercel.
            إلى ذلك الحين: اضغط «نسخ كل الإيميلات» وأرسل من Gmail (ضعها في خانة Bcc).
          </Alert>
        )}

        <fieldset>
          <legend className="mb-2 font-medium">المستلمون</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ["all", "كل الطلبة"],
                ["specialty", "تخصص معيّن"],
                ["item", "الحاضرون في دورة"],
              ] as [AudienceType, string][]
            ).map(([k, label]) => (
              <label key={k} className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 px-3 font-medium ${type === k ? "border-emerald bg-emerald/10 text-olive" : "border-olive/15"}`}>
                <input type="radio" name="aud" className="h-5 w-5 accent-emerald" checked={type === k} onChange={() => setType(k)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        {type === "specialty" && (
          <Field label="التخصص" htmlFor="sp">
            <Select id="sp" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
              <option value="">— اختر —</option>
              {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
        )}
        {type === "item" && (
          <Field label="الدورة / الحدث" htmlFor="it">
            <Select id="it" value={itemId} onChange={(e) => setItemId(e.target.value)}>
              <option value="">— اختر —</option>
              {items.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
            </Select>
          </Field>
        )}

        <Field label="الموضوع" htmlFor="subject" required>
          <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Field>
        <Field label="النص" htmlFor="body" required>
          <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-48" />
        </Field>

        {result && <Alert kind={result.kind}>{result.text}</Alert>}

        <div className="flex flex-col gap-3 border-t border-olive/10 pt-5 sm:flex-row sm:flex-wrap">
          <button type="button" onClick={() => send(false)} disabled={!!busy || !configured} className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gold px-6 text-lg font-bold text-ink hover:bg-gold-light disabled:opacity-50 ${busy === "send" ? "pending-ring" : ""}`}>
            {busy === "send" && <Spinner />} إرسال إلى {recipients.length} مستلم
          </button>
          <button type="button" onClick={() => send(true)} disabled={!!busy || !configured} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-olive/25 px-5 font-bold text-olive hover:border-olive disabled:opacity-50 ${busy === "test" ? "pending-ring" : ""}`}>
            {busy === "test" && <Spinner />} إرسال تجريبي لبريدي
          </button>
          <button type="button" onClick={copyAll} disabled={!recipients.length} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-olive px-5 font-bold text-white hover:bg-emerald disabled:opacity-50">
            {copied ? "✓ تم النسخ" : "📋 نسخ كل الإيميلات"}
          </button>
        </div>
      </form>

      {/* Preview */}
      <aside aria-label="معاينة" className="h-fit rounded-2xl border border-olive/10 bg-white p-4 shadow-sm lg:sticky lg:top-6">
        <p className="mb-3 text-sm font-bold text-ink/60">
          معاينة · <span className="text-emerald">{recipients.length} مستلم</span>
        </p>
        <div className="overflow-hidden rounded-xl border border-olive/10">
          <div className="bg-olive px-4 py-3 text-sm font-bold text-gold-light">حاضنة الأعمال — جامعة الأمير عبد القادر</div>
          <div className="p-4">
            <p className="text-lg font-bold text-olive">{subject || "موضوع الرسالة"}</p>
            <p className="mt-2 whitespace-pre-line leading-relaxed text-ink/85">{body || "نص الرسالة يظهر هنا…"}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
