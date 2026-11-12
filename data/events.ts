/**
 * Sample upcoming events & courses for the home page.
 * Static placeholder data — replace with Supabase `items` later (same field names as SPEC §4).
 */
export type EventItem = {
  id: string;
  type: "course" | "event" | "post";
  title: string;
  starts_at: string; // ISO date-time
  mode: "online" | "onsite" | "hybrid";
  location: string;
  trainer_name: string;
  image_url?: string; // optional; a styled placeholder is shown when empty
};

export const UPCOMING_EVENTS: EventItem[] = [
  {
    id: "sample-1",
    type: "course",
    title: "من الفكرة إلى نموذج العمل: ورشة Business Model Canvas",
    starts_at: "2026-11-22T09:30:00+01:00",
    mode: "onsite",
    location: "قاعة المحاضرات الكبرى — الجامعة",
    trainer_name: "د. أستاذ مكوّن",
  },
  {
    id: "sample-2",
    type: "course",
    title: "مسار القرار 1275: كيف تحضّر مشروع «شهادة — مؤسسة ناشئة»",
    starts_at: "2026-11-26T14:00:00+01:00",
    mode: "online",
    location: "Google Meet",
    trainer_name: "أ. أستاذة مكوّنة",
  },
  {
    id: "sample-3",
    type: "event",
    title: "يوم الابتكار: عرض مشاريع الطلبة أمام لجنة من الخبراء",
    starts_at: "2026-12-03T10:00:00+01:00",
    mode: "onsite",
    location: "بهو الجامعة — قسنطينة",
    trainer_name: "فريق الحاضنة",
  },
];

export const TYPE_LABELS: Record<EventItem["type"], string> = {
  course: "دورة تكوينية",
  event: "حدث",
  post: "منشور",
};

export const MODE_LABELS: Record<EventItem["mode"], string> = {
  online: "أونلاين",
  onsite: "حضوري",
  hybrid: "مختلط",
};
