import "server-only";
import nodemailer from "nodemailer";

/**
 * Email provider behind ONE function (SPEC §3). Two options — whichever is configured:
 *
 *  A) Gmail (simplest): Vercel env vars
 *       GMAIL_USER          = incubator.emir@gmail.com
 *       GMAIL_APP_PASSWORD  = 16-letter Google "App password" (secret)
 *     Limit ≈ 500 recipients / day.
 *
 *  B) Brevo API:
 *       BREVO_API_KEY, BREVO_SENDER_EMAIL (verified sender)
 *
 *  Optional: EMAIL_SENDER_NAME (default "حاضنة الأعمال").
 */
const gmailConfigured = () => !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD;
const brevoConfigured = () => !!process.env.BREVO_API_KEY && !!process.env.BREVO_SENDER_EMAIL;
export const emailConfigured = () => gmailConfigured() || brevoConfigured();
const senderName = () => process.env.EMAIL_SENDER_NAME || process.env.BREVO_SENDER_NAME || "حاضنة الأعمال";

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

/** Send the same email to many recipients. Returns sent / failed counts. */
export async function sendEmail(to: string[], subject: string, html: string) {
  const unique = [...new Set(to.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  if (gmailConfigured()) return sendWithGmail(unique, subject, html);
  if (brevoConfigured()) return sendWithBrevo(unique, subject, html);
  throw new Error("EMAIL_NOT_CONFIGURED");
}

/** Gmail SMTP: groups of 40 in Bcc (nobody sees the other addresses). */
async function sendWithGmail(list: string[], subject: string, html: string) {
  const user = process.env.GMAIL_USER!;
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass: process.env.GMAIL_APP_PASSWORD!.replace(/\s+/g, "") },
  });
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < list.length; i += 40) {
    const batch = list.slice(i, i + 40);
    try {
      await transporter.sendMail({ from: { name: senderName(), address: user }, to: user, bcc: batch, subject, html });
      sent += batch.length;
    } catch (e) {
      console.error("gmail send failed", (e as Error).message);
      failed += batch.length;
    }
  }
  transporter.close();
  return { sent, failed, total: list.length };
}

/** Brevo API: batches of 50, one separate email per recipient. */
async function sendWithBrevo(list: string[], subject: string, html: string) {
  const sender = { email: process.env.BREVO_SENDER_EMAIL!, name: senderName() };
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < list.length; i += 50) {
    const batch = list.slice(i, i + 50);
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": process.env.BREVO_API_KEY!, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ sender, subject, htmlContent: html, messageVersions: batch.map((email) => ({ to: [{ email }] })) }),
      });
      if (res.ok) sent += batch.length;
      else failed += batch.length;
    } catch {
      failed += batch.length;
    }
  }
  return { sent, failed, total: list.length };
}
