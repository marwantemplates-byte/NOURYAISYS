import type { Item } from "@/lib/items";

/**
 * Fallback sample events — shown on the home page ONLY if Supabase can't be reached.
 * Real events come from the `items` table (published = true).
 */
const base = { body: null, ends_at: null, image_url: null, capacity: null, published: true, created_at: "2026-11-01T00:00:00Z" };

export const SAMPLE_ITEMS: Item[] = [
  {
    ...base,
    id: "sample-1",
    type: "course",
    title: "من الفكرة إلى نموذج العمل: ورشة Business Model Canvas",
    starts_at: "2026-11-22T09:30:00+01:00",
    mode: "onsite",
    location: "قاعة المحاضرات الكبرى — الجامعة",
    trainer_name: "د. أستاذ مكوّن",
  },
  {
    ...base,
    id: "sample-2",
    type: "course",
    title: "مسار القرار 1275: كيف تحضّر مشروع «شهادة — مؤسسة ناشئة»",
    starts_at: "2026-11-26T14:00:00+01:00",
    mode: "online",
    location: null,
    trainer_name: "أ. أستاذة مكوّنة",
  },
  {
    ...base,
    id: "sample-3",
    type: "event",
    title: "يوم الابتكار: عرض مشاريع الطلبة أمام لجنة من الخبراء",
    starts_at: "2026-12-03T10:00:00+01:00",
    mode: "onsite",
    location: "بهو الجامعة — قسنطينة",
    trainer_name: "فريق الحاضنة",
  },
];
