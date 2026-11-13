import type { SupabaseClient } from "@supabase/supabase-js";
import { ITEM_COLUMNS, type Item } from "@/lib/items";

export type RsvpState = {
  confirmed: boolean;
  attended: boolean | null;
  confirmedCount: number;
  full: boolean;
  ended: boolean;
  meetingLink: string | null;
};

/** Load published items (optionally one) + the student's RSVPs, counts and meeting links. */
export async function loadItemsWithRsvp(supabase: SupabaseClient, userId: string, onlyId?: string) {
  let q = supabase.from("items").select(ITEM_COLUMNS).eq("published", true);
  if (onlyId) q = q.eq("id", onlyId);
  const { data: items, error } = await q.returns<Item[]>();
  if (error) return { items: [] as Item[], state: {} as Record<string, RsvpState>, error: error.message };

  const ids = (items ?? []).map((i) => i.id);
  const [{ data: mine }, { data: counts }] = await Promise.all([
    supabase.from("rsvps").select("item_id,attended").eq("user_id", userId).in("item_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]),
    supabase.rpc("get_rsvp_counts", { p_item_ids: ids }),
  ]);

  const mineMap = new Map((mine ?? []).map((r: { item_id: string; attended: boolean | null }) => [r.item_id, r.attended]));
  const countMap = new Map(((counts as { item_id: string; confirmed: number }[]) ?? []).map((c) => [c.item_id, Number(c.confirmed)]));
  const now = Date.now();

  const state: Record<string, RsvpState> = {};
  await Promise.all(
    (items ?? []).map(async (it) => {
      const confirmed = mineMap.has(it.id);
      const confirmedCount = countMap.get(it.id) ?? 0;
      const endIso = it.ends_at ?? it.starts_at;
      let meetingLink: string | null = null;
      if (confirmed && it.mode !== "onsite") {
        const { data } = await supabase.rpc("get_meeting_link", { p_item_id: it.id });
        meetingLink = (data as string | null) ?? null;
      }
      state[it.id] = {
        confirmed,
        attended: confirmed ? (mineMap.get(it.id) ?? null) : null,
        confirmedCount,
        full: it.capacity != null && confirmedCount >= it.capacity,
        ended: !!endIso && new Date(endIso).getTime() < now,
        meetingLink,
      };
    }),
  );

  return { items: items ?? [], state, error: null as string | null };
}
