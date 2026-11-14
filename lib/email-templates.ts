import "server-only";
import { MODE_LABELS, formatDate, type ItemMode } from "@/lib/items";

/** Ready-made texts for the automatic emails (plain text → wrapped by textToHtml). */
const SITE = "https://incubator-platform-beryl.vercel.app";

export function welcomeEmail(name: string) {
  return {
    subject: "مرحبًا بك في حاضنة الأعمال 🌿",
    body: `مرحبًا ${name || ""}،

تم تفعيل حسابك في منصة حاضنة الأعمال — جامعة الأمير عبد القادر للعلوم الإسلامية.

من حسابك يمكنك:
• متابعة الدورات التكوينية والأحداث وتأكيد حضورك.
• تحديث معلومات مشروعك في أي وقت من صفحة «ملفي».

ادخل إلى حسابك: ${SITE}/login

بالتوفيق في مشروعك!
فريق حاضنة الأعمال`,
  };
}

type ItemInfo = { title: string; starts_at: string | null; mode: ItemMode | string; location: string | null; meeting_link?: string | null; trainer_name?: string | null };

function details(i: ItemInfo) {
  const lines = [`• العنوان: ${i.title}`];
  if (i.starts_at) lines.push(`• التاريخ: ${formatDate(i.starts_at)}`);
  lines.push(`• النمط: ${MODE_LABELS[i.mode as ItemMode] ?? i.mode}`);
  if (i.mode !== "online" && i.location) lines.push(`• المكان: ${i.location}`);
  if (i.mode !== "onsite" && i.meeting_link) lines.push(`• رابط الدورة (Google Meet): ${i.meeting_link}`);
  if (i.trainer_name) lines.push(`• المكوّن: ${i.trainer_name}`);
  return lines.join("\n");
}

export function rsvpEmail(name: string, item: ItemInfo, itemId: string) {
  return {
    subject: `تأكيد حضورك: ${item.title}`,
    body: `مرحبًا ${name || ""}،

تم تأكيد مشاركتك. هذه التفاصيل:

${details(item)}

سنرسل لك تذكيرًا قبل الموعد. إذا لم تعد تستطيع الحضور، ألغِ مشاركتك من المنصة ليستفيد غيرك من المكان:
${SITE}/app/items/${itemId}

فريق حاضنة الأعمال`,
  };
}

export function reminderEmail(name: string, item: ItemInfo, itemId: string) {
  return {
    subject: `تذكير: ${item.title} — قريبًا`,
    body: `مرحبًا ${name || ""}،

نذكّرك بموعد قريب أكّدت حضورك فيه:

${details(item)}

التفاصيل: ${SITE}/app/items/${itemId}

نراك قريبًا!
فريق حاضنة الأعمال`,
  };
}

export function announcementEmail(item: ItemInfo & { body?: string | null }, itemId: string, typeLabel: string) {
  return {
    subject: `${typeLabel} جديدة: ${item.title}`,
    body: `السلام عليكم،

يسرّ حاضنة الأعمال أن تعلن عن ${typeLabel} جديدة:

${details(item)}
${item.body ? `\n${item.body}\n` : ""}
أكّد مشاركتك من هنا (الأماكن قد تكون محدودة):
${SITE}/app/items/${itemId}

فريق حاضنة الأعمال`,
  };
}
