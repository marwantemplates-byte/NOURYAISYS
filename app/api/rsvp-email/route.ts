import { NextResponse, type NextRequest } from "next/server";
import { emailConfigured, sendEmail, textToHtml } from "@/lib/email";
import { rsvpEmail } from "@/lib/email-templates";
import { ITEM_COLUMNS, type Item } from "@/lib/items";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Confirmation email after a student confirms attendance. Only for the signed-in student's own RSVP. */
export async function POST(request: NextRequest) {
  if (!emailConfigured()) return NextResponse.json({ ok: false, skipped: "not_configured" });
  const { item_id } = (await request.json().catch(() => ({}))) as { item_id?: string };
  if (!item_id || !/^[0-9a-f-]{36}$/i.test(item_id)) return NextResponse.json({ error: "bad request" }, { status: 400 });

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const uid = auth?.claims?.sub;
  if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // RLS: the student only sees their own RSVP
  const { data: rsvp } = await supabase.from("rsvps").select("item_id,created_at").eq("item_id", item_id).eq("user_id", uid).maybeSingle();
  if (!rsvp) return NextResponse.json({ error: "no rsvp" }, { status: 404 });
  // Only right after confirming (not replayable later)
  if (Date.now() - new Date(rsvp.created_at).getTime() > 10 * 60 * 1000) {
    return NextResponse.json({ ok: false, skipped: "too_late" });
  }
  // Per-student limit (10 automatic emails / 24h, 1 per 20s) — protects the Gmail daily quota
  const { data: allowed, error: limitErr } = await supabase.rpc("allow_auto_email", { p_kind: "rsvp" });
  if (!limitErr && allowed !== true) return NextResponse.json({ ok: false, skipped: "rate_limited" }, { status: 429 });

  const [{ data: item }, { data: me }, { data: link }] = await Promise.all([
    supabase.from("items").select(ITEM_COLUMNS).eq("id", item_id).maybeSingle<Item>(),
    supabase.from("profiles").select("email,full_name").eq("id", uid).maybeSingle(),
    supabase.rpc("get_meeting_link", { p_item_id: item_id }),
  ]);
  if (!item || !me) return NextResponse.json({ error: "not found" }, { status: 404 });

  const m = rsvpEmail(me.full_name, { ...item, meeting_link: (link as string | null) ?? null }, item_id);
  try {
    await sendEmail([me.email], m.subject, textToHtml(m.subject, m.body));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
