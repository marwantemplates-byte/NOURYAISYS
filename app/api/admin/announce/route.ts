import { NextResponse, type NextRequest } from "next/server";
import { emailConfigured, sendEmail, textToHtml } from "@/lib/email";
import { announcementEmail } from "@/lib/email-templates";
import { ITEM_COLUMNS, TYPE_LABELS, type Item } from "@/lib/items";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Admin: announce a newly published course/event to all active students (logged as a campaign). */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const uid = auth?.claims?.sub;
  if (!uid) return NextResponse.json({ error: "غير مسجّل الدخول." }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("role,status").eq("id", uid).maybeSingle();
  if (me?.role !== "admin" || me.status !== "active") return NextResponse.json({ error: "غير مسموح." }, { status: 403 });
  if (!emailConfigured()) return NextResponse.json({ error: "خدمة الإيميل غير مفعّلة." }, { status: 503 });

  const { item_id } = (await request.json().catch(() => ({}))) as { item_id?: string };
  const { data: item } = await supabase.from("items").select(ITEM_COLUMNS).eq("id", item_id ?? "").maybeSingle<Item>();
  if (!item || !item.published) return NextResponse.json({ error: "العنصر غير منشور." }, { status: 400 });

  const { data: students } = await supabase.from("profiles").select("email").eq("role", "student").eq("status", "active");
  const emails = (students ?? []).map((s) => s.email);
  if (!emails.length) return NextResponse.json({ ok: true, sent: 0, failed: 0 });

  const label = item.type === "event" ? "فعالية" : item.type === "post" ? "منشور" : TYPE_LABELS[item.type];
  // No Meet link in announcements: it is only for confirmed students
  const m = announcementEmail({ ...item, meeting_link: null }, item.id, label);
  const { data: c } = await supabase
    .from("email_campaigns")
    .insert({ subject: m.subject, body: m.body, audience: { type: "all", announce_item: item.id }, recipients_count: emails.length, status: "sending", created_by: uid })
    .select("id")
    .single();
  try {
    const r = await sendEmail(emails, m.subject, textToHtml(m.subject, m.body));
    if (c?.id) await supabase.from("email_campaigns").update({ sent_count: r.sent, failed_count: r.failed, status: r.sent ? "done" : "failed" }).eq("id", c.id);
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    if (c?.id) await supabase.from("email_campaigns").update({ status: "failed", failed_count: emails.length }).eq("id", c.id);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
