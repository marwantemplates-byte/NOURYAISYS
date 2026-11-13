import type { Metadata } from "next";
import Link from "next/link";
import ItemCard from "@/components/app/ItemCard";
import { Alert } from "@/components/ui/form";
import { loadItemsWithRsvp } from "@/lib/feed";
import { sortFeed, type ItemType } from "@/lib/items";
import { requireProfile } from "@/lib/session";

export const metadata: Metadata = { title: "الدورات والأحداث — حاضنة الأعمال" };

const TABS: { key: "all" | ItemType; label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "post", label: "منشورات" },
  { key: "event", label: "أحداث" },
  { key: "course", label: "دورات" },
];

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab: rawTab } = await searchParams;
  const tab = TABS.some((t) => t.key === rawTab) ? (rawTab as (typeof TABS)[number]["key"]) : "all";

  const { supabase, user, profile } = await requireProfile();
  const { items, state, error } = await loadItemsWithRsvp(supabase, user.id);
  const shown = sortFeed(tab === "all" ? items : items.filter((i) => i.type === tab));
  const firstName = profile?.full_name?.split(" ")[0];

  return (
    <>
      <h1 className="text-3xl font-bold text-olive">{firstName ? `مرحبًا ${firstName} 👋` : "مرحبًا 👋"}</h1>
      <p className="mt-2 text-lg text-ink/70">الدورات والأحداث والمنشورات الخاصة بالحاضنة.</p>

      <nav aria-label="تصفية حسب النوع" className="mt-6 -mx-4 overflow-x-auto px-4">
        <ul className="flex gap-2">
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <li key={t.key}>
                <Link
                  href={t.key === "all" ? "/app" : `/app?tab=${t.key}`}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-5 font-medium transition-colors ${
                    active ? "bg-olive text-white" : "bg-white text-ink ring-1 ring-olive/15 hover:ring-olive/40"
                  }`}
                >
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-8">
        {error ? (
          <Alert>تعذّر تحميل المحتوى. أعد تحميل الصفحة بعد قليل.</Alert>
        ) : shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-olive/20 bg-white/60 p-10 text-center">
            <p className="text-lg font-medium text-olive">لا يوجد شيء هنا حاليًا</p>
            <p className="mt-1 text-ink/60">ستظهر هنا الدورات والأحداث فور نشرها من طرف الإدارة.</p>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((item) => (
              <li key={item.id}>
                <ItemCard item={item} state={state[item.id]} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
