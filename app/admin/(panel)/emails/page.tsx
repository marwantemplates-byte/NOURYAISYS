import EmailComposer from "@/components/admin/EmailComposer";
import { emailConfigured } from "@/lib/email";
import { requireProfile } from "@/lib/session";

type Campaign = { id: string; subject: string; recipients_count: number; sent_count: number; failed_count: number; status: string; created_at: string };

const fmt = new Intl.DateTimeFormat("ar-DZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Algiers" });
const STATUS: Record<string, string> = { sending: "قيد الإرسال", done: "تم", failed: "فشل" };

export default async function EmailsPage({ searchParams }: { searchParams: Promise<{ item?: string }> }) {
  const { item } = await searchParams;
  const { supabase } = await requireProfile("/admin/login");
  const [{ data: students }, { data: items }, { data: campaigns }] = await Promise.all([
    supabase.from("profiles").select("id,email,specialty").eq("role", "student").eq("status", "active"),
    supabase.from("items").select("id,title").in("type", ["event", "course"]).order("starts_at", { ascending: false }),
    supabase.from("email_campaigns").select("id,subject,recipients_count,sent_count,failed_count,status,created_at").order("created_at", { ascending: false }).limit(15).returns<Campaign[]>(),
  ]);

  return (
    <>
      <h1 className="text-3xl font-bold text-olive">الإيميل الجماعي</h1>
      <p className="mb-6 mt-1 text-ink/70">رسالة واحدة لكل الطلبة، لتخصص معيّن، أو للحاضرين في دورة.</p>
      <EmailComposer students={students ?? []} items={items ?? []} configured={emailConfigured()} initialItem={item} />

      <section className="mt-8 rounded-2xl border border-olive/10 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-olive">سجل الحملات</h2>
        {!campaigns?.length ? (
          <p className="mt-3 text-ink/50">لم تُرسل أي حملة بعد.</p>
        ) : (
          <ul className="mt-3 divide-y divide-olive/10">
            {campaigns.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="min-w-0">
                  <p className="truncate font-bold">{c.subject}</p>
                  <p className="text-sm text-ink/55">{fmt.format(new Date(c.created_at))}</p>
                </div>
                <p className="text-sm">
                  <span className="font-bold text-emerald">{c.sent_count}</span> / {c.recipients_count} أُرسل
                  {c.failed_count > 0 && <span className="text-red-800"> · {c.failed_count} فشل</span>}
                  <span className="ms-2 rounded-full bg-olive/10 px-2 py-0.5 text-xs">{STATUS[c.status] ?? c.status}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
