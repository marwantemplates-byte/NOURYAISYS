import { NextResponse, type NextRequest } from "next/server";
import { emailConfigured, sendEmail, textToHtml } from "@/lib/email";
import { reminderEmail } from "@/lib/email-templates";
import { createPublicClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

type Due = { email: string; full_name: string; item_id: string; title: string; starts_at: string; mode: string; location: string | null; meeting_link: string | null };

/**
 * Vercel Cron (see vercel.json): reminds confirmed students of courses starting in the next 30 hours.
 * Protected by CRON_SECRET (Vercel sends it as "Authorization: Bearer …"); the same secret is
 * checked again inside the database function claim_due_reminders().
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!emailConfigured()) return NextResponse.json({ ok: false, skipped: "email not configured" });

  const { data, error } = await createPublicClient().rpc("claim_due_reminders", { p_secret: secret });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  let failed = 0;
  for (const r of (data ?? []) as Due[]) {
    const m = reminderEmail(r.full_name, r, r.item_id);
    try {
      const res = await sendEmail([r.email], m.subject, textToHtml(m.subject, m.body));
      sent += res.sent;
      failed += res.failed;
    } catch {
      failed++;
    }
  }
  return NextResponse.json({ ok: true, reminders: (data ?? []).length, sent, failed });
}
