import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { emailConfigured, sendEmail, textToHtml } from "@/lib/email";
import { welcomeEmail } from "@/lib/email-templates";

/** Send the welcome email once (after the student confirms the account). Never throws. */
export async function sendWelcomeOnce(supabase: SupabaseClient, userId: string) {
  try {
    if (!emailConfigured()) return;
    const { data: p } = await supabase
      .from("profiles")
      .select("email,full_name,role,welcome_sent_at")
      .eq("id", userId)
      .maybeSingle();
    if (!p || p.role !== "student" || p.welcome_sent_at) return;
    // Mark first so a double click on the link can't send it twice
    const { error } = await supabase.from("profiles").update({ welcome_sent_at: new Date().toISOString() }).eq("id", userId);
    if (error) return; // column missing (SQL 007 not run yet) → skip quietly
    const m = welcomeEmail(p.full_name);
    await sendEmail([p.email], m.subject, textToHtml(m.subject, m.body));
  } catch (e) {
    console.error("welcome email failed", (e as Error).message);
  }
}
