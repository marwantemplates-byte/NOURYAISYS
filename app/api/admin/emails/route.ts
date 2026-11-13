import { NextResponse, type NextRequest } from "next/server";
import { emailConfigured, sendEmail, textToHtml } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

type Audience = { type: "all" } | { type: "specialty"; value: string } | { type: "item"; item_id: string };

/** Bulk email (admin only). Recipients are recomputed on the server — the client list is never trusted. */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const uid = auth?.claims?.sub;
  if (!uid) return NextResponse.json({ error: "غير مسجّل الدخول." }, { status: 401 });
  const { data: me } = await supabase.from("profiles").select("role,status,email").eq("id", uid).maybeSingle();
  if (me?.role !== "admin" || me.status !== "active") return NextResponse.json({ error: "غير مسموح." }, { status: 403 });

  const { subject, body, audience, test } = (await request.json()) as { subject?: string; body?: string; audience?: Audience; test?: boolean };
  if (!subject?.trim() || !body?.trim() || !audience) return NextResponse.json({ error: "الموضوع والنص مطلوبان." }, { status: 400 });
  if (!emailConfigured()) {
    return NextResponse.json({ error: "NO_KEY", message: "خدمة الإيميل غير مفعّلة: أضف BREVO_API_KEY و BREVO_SENDER_EMAIL في Vercel." }, { status: 503 });
  }

  // Recipients (RLS: the admin can read all profiles / rsvps)
  let emails: string[] = [];
  if (test) {
    emails = [me.email];
  } else if (audience.type === "item") {
    const { data } = await supabase
      .from("rsvps")
      .select("profiles!rsvps_user_id_fkey(email,status)")
      .eq("item_id", audience.item_id)
      .returns<{ profiles: { email: string; status: string } | null }[]>();
    emails = (data ?? []).filter((r) => r.profiles?.status === "active").map((r) => r.profiles!.email);
  } else {
    let q = supabase.from("profiles").select("email").eq("role", "student").eq("status", "active");
    if (audience.type === "specialty") q = q.eq("specialty", audience.value);
    const { data } = await q;
    emails = (data ?? []).map((r) => r.email);
  }
  if (!emails.length) return NextResponse.json({ error: "لا يوجد مستلمون." }, { status: 400 });

  // Log the campaign (not for test sends)
  let campaignId: string | null = null;
  if (!test) {
    const { data: c } = await supabase
      .from("email_campaigns")
      .insert({ subject: subject.trim(), body: body.trim(), audience, recipients_count: emails.length, status: "sending", created_by: uid })
      .select("id")
      .single();
    campaignId = c?.id ?? null;
  }

  try {
    const r = await sendEmail(emails, subject.trim(), textToHtml(subject.trim(), body.trim()));
    if (campaignId) {
      await supabase
        .from("email_campaigns")
        .update({ sent_count: r.sent, failed_count: r.failed, status: r.sent > 0 ? "done" : "failed" })
        .eq("id", campaignId);
    }
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    if (campaignId) await supabase.from("email_campaigns").update({ status: "failed", failed_count: emails.length }).eq("id", campaignId);
    return NextResponse.json({ error: "تعذّر الإرسال: " + (e as Error).message }, { status: 500 });
  }
}
