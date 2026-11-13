import Link from "next/link";
import Badges from "@/components/app/Badges";
import ItemImage from "@/components/app/ItemImage";
import ItemMeta from "@/components/app/ItemMeta";
import { SAMPLE_ITEMS } from "@/data/events";
import { ITEM_COLUMNS, type Item } from "@/lib/items";
import { createPublicClient } from "@/lib/supabase/server";
import SectionHeading from "./SectionHeading";

/** Next 3 published events/courses from Supabase. Falls back to sample data only if the DB is unreachable. */
async function getUpcoming(): Promise<{ items: Item[]; sample: boolean }> {
  try {
    const { data, error } = await createPublicClient()
      .from("items")
      .select(ITEM_COLUMNS)
      .eq("published", true)
      .in("type", ["event", "course"])
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(3)
      .returns<Item[]>();
    if (error) throw error;
    return { items: data ?? [], sample: false };
  } catch {
    return { items: SAMPLE_ITEMS, sample: true };
  }
}

export default async function Events() {
  const { items, sample } = await getUpcoming();
  return (
    <section id="events" aria-labelledby="events-title" className="scroll-mt-20 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading id="events-title" eyebrow="قريبًا" title="الأحداث والدورات القادمة" />
          <Link
            href="/app"
            prefetch={false}
            className="mb-10 inline-flex min-h-11 items-center justify-center self-start rounded-xl border-2 border-olive px-6 font-bold text-olive transition-colors hover:bg-olive hover:text-white md:mb-14 md:self-auto"
          >
            عرض الكل
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-olive/20 bg-ivory p-10 text-center">
            <p className="text-lg font-medium text-olive">لا توجد أحداث قادمة حاليًا</p>
            <p className="mt-1 text-ink/60">سجّل الآن لتصلك الدورات الجديدة فور الإعلان عنها.</p>
          </div>
        ) : (
          <ul className="grid gap-6 md:grid-cols-3">
            {items.map((e) => (
              <li key={e.id}>
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-olive/10 bg-ivory shadow-sm transition-shadow hover:shadow-md">
                  <div className="relative">
                    <ItemImage id={e.id} src={e.image_url} className="aspect-[16/9]" />
                    <div className="absolute inset-x-3 top-3">
                      <Badges item={e} />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="mb-4 text-xl font-bold leading-snug text-olive">
                      {sample ? (
                        e.title
                      ) : (
                        <Link href={`/app/items/${e.id}`} prefetch={false} className="hover:text-emerald hover:underline hover:underline-offset-4">
                          {e.title}
                        </Link>
                      )}
                    </h3>
                    <div className="mt-auto">
                      <ItemMeta item={e} />
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
