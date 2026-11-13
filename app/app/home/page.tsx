import type { Metadata } from "next";
import Link from "next/link";
import IncubatorInfo from "@/components/app/IncubatorInfo";
import ItemCard from "@/components/app/ItemCard";
import { loadItemsWithRsvp } from "@/lib/feed";
import { sortFeed } from "@/lib/items";
import { requireProfile } from "@/lib/session";

export const metadata: Metadata = { title: "الصفحة الرئيسية — حاضنة الأعمال" };

/** Student home: upcoming courses + about the incubator, on one page. */
export default async function StudentHomePage() {
  const { supabase, user, profile } = await requireProfile();
  const { items, state } = await loadItemsWithRsvp(supabase, user.id);
  const upcoming = sortFeed(items.filter((i) => i.type === "course" && !state[i.id]?.ended)).slice(0, 3);
  const firstName = profile?.full_name?.split(" ")[0];

  return (
    <>
      <h1 className="text-3xl font-bold text-olive">{firstName ? `مرحبًا ${firstName} 👋` : "مرحبًا 👋"}</h1>

      <section aria-labelledby="home-courses" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="home-courses" className="text-xl font-bold text-olive">الدورات القادمة</h2>
          <Link href="/app?tab=course" className="inline-flex min-h-11 items-center font-bold text-emerald hover:underline">كل الدورات ←</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-olive/20 bg-white/60 p-8 text-center text-ink/60">لا توجد دورات قادمة حاليًا.</p>
        ) : (
          <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((it) => (
              <li key={it.id}>
                <ItemCard item={it} state={state[it.id]} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-12">
        <IncubatorInfo />
      </div>
    </>
  );
}
