/** Shared types & helpers for items (posts / events / courses) — mirrors SPEC §4. */
export type ItemType = "post" | "event" | "course";
export type ItemMode = "online" | "onsite" | "hybrid";

export type Item = {
  id: string;
  type: ItemType;
  title: string;
  body: string | null;
  trainer_name: string | null;
  starts_at: string | null;
  ends_at: string | null;
  mode: ItemMode;
  location: string | null;
  image_url: string | null;
  capacity: number | null;
  published: boolean;
  created_at: string;
};

/** Columns students/visitors may read (meeting_link is only available through get_meeting_link). */
export const ITEM_COLUMNS =
  "id,type,title,body,trainer_name,starts_at,ends_at,mode,location,image_url,capacity,published,created_at";

export const TYPE_LABELS: Record<ItemType, string> = {
  course: "دورة تكوينية",
  event: "حدث",
  post: "منشور",
};

export const MODE_LABELS: Record<ItemMode, string> = {
  online: "أونلاين",
  onsite: "حضوري",
  hybrid: "مختلط",
};

const dateFmt = new Intl.DateTimeFormat("ar-DZ", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Algiers",
});

export function formatDate(iso: string | null) {
  return iso ? dateFmt.format(new Date(iso)) : "";
}

export const canRsvp = (t: ItemType) => t === "event" || t === "course";

/** Upcoming events/courses first (soonest first), then posts and past items (newest first). */
export function sortFeed(items: Item[], now = Date.now()) {
  const upcoming = items
    .filter((i) => i.starts_at && new Date(i.starts_at).getTime() >= now)
    .sort((a, b) => +new Date(a.starts_at!) - +new Date(b.starts_at!));
  const rest = items
    .filter((i) => !upcoming.includes(i))
    .sort((a, b) => +new Date(b.starts_at ?? b.created_at) - +new Date(a.starts_at ?? a.created_at));
  return [...upcoming, ...rest];
}
