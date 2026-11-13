import "server-only";

/**
 * Email provider behind ONE function (SPEC §3) — Brevo today, easy to swap later.
 * Server only. Env vars (Vercel → Settings → Environment Variables):
 *   BREVO_API_KEY       (secret, required)
 *   BREVO_SENDER_EMAIL  (a sender verified in Brevo, required)
 *   BREVO_SENDER_NAME   (optional, default "حاضنة الأعمال")
 */
export const emailConfigured = () => !!process.env.BREVO_API_KEY && !!process.env.BREVO_SENDER_EMAIL;

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Plain text → simple RTL HTML email. */
export function textToHtml(subject: string, body: string) {
  return `<!doctype html><html lang="ar" dir="rtl"><body style="margin:0;background:#FAF7F0;font-family:Tahoma,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px">
<div style="background:#1F3D2B;color:#E8D5A3;padding:16px 20px;border-radius:12px 12px 0 0;font-weight:bold">حاضنة الأعمال — جامعة الأمير عبد القادر</div>
<div style="background:#fff;padding:24px 20px;border-radius:0 0 12px 12px;color:#1A1A1A;line-height:1.9">
<h2 style="margin:0 0 12px;color:#1F3D2B">${escapeHtml(subject)}</h2>
<div>${escapeHtml(body).replace(/\n/g, "<br>")}</div>
</div></div></body></html>`;
}

/** Send the same email to many recipients (batches of 50). Returns sent / failed counts. */
export async function sendEmail(to: string[], subject: string, html: string) {
  const key = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!key || !senderEmail) throw new Error("EMAIL_NOT_CONFIGURED");
  const sender = { email: senderEmail, name: process.env.BREVO_SENDER_NAME || "حاضنة الأعمال" };

  let sent = 0;
  let failed = 0;
  const unique = [...new Set(to.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  for (let i = 0; i < unique.length; i += 50) {
    const batch = unique.slice(i, i + 50);
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": key, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          sender,
          subject,
          htmlContent: html,
          // One separate email per recipient (nobody sees the other addresses)
          messageVersions: batch.map((email) => ({ to: [{ email }] })),
        }),
      });
      if (res.ok) sent += batch.length;
      else failed += batch.length;
    } catch {
      failed += batch.length;
    }
  }
  return { sent, failed, total: unique.length };
}
