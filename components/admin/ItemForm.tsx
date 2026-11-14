"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Field, Input, Select, Textarea } from "@/components/ui/form";
import Spinner from "@/components/ui/Spinner";
import { ITEM_IMAGES_BUCKET, fromLocalInput, toLocalInput } from "@/lib/admin";
import { arabicError } from "@/lib/errors";
import type { Item, ItemMode, ItemType } from "@/lib/items";
import { createClient } from "@/lib/supabase/client";

type Values = {
  type: ItemType;
  title: string;
  body: string;
  trainer_name: string;
  starts_at: string;
  ends_at: string;
  mode: ItemMode;
  location: string;
  meeting_link: string;
  capacity: string;
  image_url: string;
};

/** Create / edit a course, event or post. Saves as draft or published. */
export default function ItemForm({ item, meetingLink }: { item?: Item; meetingLink?: string | null }) {
  const router = useRouter();
  const [v, setV] = useState<Values>({
    type: item?.type ?? "course",
    title: item?.title ?? "",
    body: item?.body ?? "",
    trainer_name: item?.trainer_name ?? "",
    starts_at: toLocalInput(item?.starts_at),
    ends_at: toLocalInput(item?.ends_at),
    mode: item?.mode ?? "onsite",
    location: item?.location ?? "",
    meeting_link: meetingLink ?? "",
    capacity: item?.capacity ? String(item.capacity) : "",
    image_url: item?.image_url ?? "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  // Announcement email: proposed for new items (or items not yet published)
  const [announce, setAnnounce] = useState(!item?.published);

  const set = <K extends keyof Values>(k: K, val: Values[K]) => setV((p) => ({ ...p, [k]: val }));
  const isPost = v.type === "post";

  const save = async (publish: boolean) => {
    setError("");
    const e: Record<string, string> = {};
    if (!v.title.trim()) e.title = "اكتب العنوان.";
    if (!isPost && !v.starts_at) e.starts_at = "اختر التاريخ والساعة.";
    if (!isPost && v.mode !== "online" && !v.location.trim()) e.location = "اكتب المكان.";
    if (!isPost && v.mode !== "onsite" && !/^https?:\/\//i.test(v.meeting_link.trim())) e.meeting_link = "ضع رابط Google Meet يبدأ بـ https://";
    if (v.capacity && !(Number(v.capacity) > 0)) e.capacity = "العدد الأقصى يجب أن يكون رقمًا موجبًا.";
    if (image && !image.type.startsWith("image/")) e.image = "اختر صورة (JPG أو PNG).";
    if (image && image.size > 5 * 1024 * 1024) e.image = "حجم الصورة أكبر من 5 ميغا.";
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(publish ? "publish" : "draft");
    const supabase = createClient();
    let image_url = v.image_url || null;
    if (image) {
      const ext = (image.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${crypto.randomUUID()}.${ext || "jpg"}`;
      const up = await supabase.storage.from(ITEM_IMAGES_BUCKET).upload(path, image, { contentType: image.type });
      if (up.error) {
        setSaving(null);
        return setError("تعذّر رفع الصورة: " + arabicError(up.error.message));
      }
      image_url = supabase.storage.from(ITEM_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
    }

    const row = {
      type: v.type,
      title: v.title.trim(),
      body: v.body.trim() || null,
      trainer_name: isPost ? null : v.trainer_name.trim() || null,
      starts_at: isPost ? null : fromLocalInput(v.starts_at),
      ends_at: isPost ? null : fromLocalInput(v.ends_at),
      mode: v.mode,
      location: isPost || v.mode === "online" ? null : v.location.trim() || null,
      meeting_link: isPost || v.mode === "onsite" ? null : v.meeting_link.trim() || null,
      capacity: isPost || !v.capacity ? null : Number(v.capacity),
      image_url,
      published: publish,
    };

    // Never ask the API to return meeting_link (column is not readable directly)
    const res = item
      ? await supabase.from("items").update(row).eq("id", item.id).select("id").single()
      : await supabase.from("items").insert(row).select("id").single();
    if (res.error) {
      setSaving(null);
      return setError(arabicError(res.error.message));
    }
    if (publish && announce && res.data?.id) {
      const r = await fetch("/api/admin/announce", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ item_id: res.data.id }),
      }).catch(() => null);
      if (!r || !r.ok) {
        const j = r ? await r.json().catch(() => ({})) : {};
        window.alert("تم النشر، لكن تعذّر إرسال إيميل الإعلان" + (j.error ? `: ${j.error}` : "."));
      }
    }
    setSaving(null);
    router.push("/admin/items");
    router.refresh();
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="النوع" htmlFor="type" required>
          <Select id="type" value={v.type} onChange={(e) => set("type", e.target.value as ItemType)}>
            <option value="course">دورة تكوينية</option>
            <option value="event">حدث</option>
            <option value="post">منشور</option>
          </Select>
        </Field>
        {!isPost && (
          <Field label="النمط" htmlFor="mode" required>
            <Select id="mode" value={v.mode} onChange={(e) => set("mode", e.target.value as ItemMode)}>
              <option value="onsite">حضوري</option>
              <option value="online">أونلاين (Google Meet)</option>
              <option value="hybrid">مختلط</option>
            </Select>
          </Field>
        )}
      </div>

      <Field label={isPost ? "العنوان" : "عنوان الدورة"} htmlFor="title" required error={errors.title}>
        <Input id="title" value={v.title} onChange={(e) => set("title", e.target.value)} aria-invalid={!!errors.title || undefined} />
      </Field>
      <Field label="الوصف" htmlFor="body">
        <Textarea id="body" value={v.body} onChange={(e) => set("body", e.target.value)} />
      </Field>

      {!isPost && (
        <>
          <Field label="الأستاذ المكوّن" htmlFor="trainer_name">
            <Input id="trainer_name" value={v.trainer_name} onChange={(e) => set("trainer_name", e.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="التاريخ والساعة (البداية)" htmlFor="starts_at" required error={errors.starts_at}>
              <Input id="starts_at" type="datetime-local" dir="ltr" value={v.starts_at} onChange={(e) => set("starts_at", e.target.value)} />
            </Field>
            <Field label="النهاية (اختياري)" htmlFor="ends_at">
              <Input id="ends_at" type="datetime-local" dir="ltr" value={v.ends_at} onChange={(e) => set("ends_at", e.target.value)} />
            </Field>
          </div>
          {v.mode !== "online" && (
            <Field label="المكان" htmlFor="location" required error={errors.location}>
              <Input id="location" value={v.location} onChange={(e) => set("location", e.target.value)} placeholder="مثال: قاعة المحاضرات الكبرى" />
            </Field>
          )}
          {v.mode !== "onsite" && (
            <Field label="رابط الدورة (Google Meet)" htmlFor="meeting_link" required error={errors.meeting_link} hint="يظهر للطلبة فقط بعد تأكيد حضورهم.">
              <Input id="meeting_link" type="url" dir="ltr" value={v.meeting_link} onChange={(e) => set("meeting_link", e.target.value)} placeholder="https://meet.google.com/..." />
            </Field>
          )}
          <Field label="العدد الأقصى (اختياري)" htmlFor="capacity" error={errors.capacity} hint="اتركه فارغًا إذا لا يوجد حد.">
            <Input id="capacity" type="number" min={1} inputMode="numeric" dir="ltr" value={v.capacity} onChange={(e) => set("capacity", e.target.value)} />
          </Field>
        </>
      )}

      <Field label="الصورة (اختياري)" htmlFor="image" error={errors.image} hint="JPG أو PNG، 5 ميغا كحد أقصى.">
        <div className="flex flex-wrap items-center gap-3">
          {v.image_url && !image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.image_url} alt="" className="h-16 w-28 rounded-lg object-cover" />
          )}
          <input id="image" type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] ?? null)} className="peer sr-only" />
          <label htmlFor="image" className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-olive px-5 font-bold text-white hover:bg-emerald peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-gold">
            🖼️ {image ? "تغيير الصورة" : v.image_url ? "استبدال الصورة" : "اختر صورة"}
          </label>
          {image && <span className="text-sm text-olive">✓ {image.name}</span>}
          {v.image_url && !image && (
            <button type="button" onClick={() => set("image_url", "")} className="min-h-11 text-sm text-red-800 underline">
              حذف الصورة
            </button>
          )}
        </div>
      </Field>

      {error && <Alert>{error}</Alert>}

      <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border-2 border-gold/40 bg-gold-light/20 p-3">
        <input type="checkbox" checked={announce} onChange={(e) => setAnnounce(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-emerald" />
        <span>
          <span className="font-bold">📢 إرسال إيميل إعلان لكل الطلبة</span>
          <span className="block text-sm text-ink/65">يُرسل عند الضغط على «حفظ ونشر» فقط (ليس مع المسودة).</span>
        </span>
      </label>

      <div className="flex flex-col gap-3 border-t border-olive/10 pt-5 sm:flex-row">
        <button
          type="button"
          onClick={() => save(true)}
          disabled={!!saving}
          className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gold px-6 text-lg font-bold text-ink hover:bg-gold-light ${saving === "publish" ? "pending-ring" : ""}`}
        >
          {saving === "publish" && <Spinner />} حفظ ونشر
        </button>
        <button
          type="button"
          onClick={() => save(false)}
          disabled={!!saving}
          className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-olive/25 px-6 font-bold text-olive hover:border-olive ${saving === "draft" ? "pending-ring" : ""}`}
        >
          {saving === "draft" && <Spinner />} حفظ كمسودة
        </button>
        <Link href="/admin/items" className="inline-flex min-h-12 items-center justify-center px-4 text-ink/60 hover:text-ink">
          إلغاء
        </Link>
      </div>
    </form>
  );
}
