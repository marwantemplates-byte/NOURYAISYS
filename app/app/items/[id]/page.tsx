import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Badges from "@/components/app/Badges";
import ItemImage from "@/components/app/ItemImage";
import ItemMeta from "@/components/app/ItemMeta";
import RsvpButton from "@/components/app/RsvpButton";
import { loadItemsWithRsvp } from "@/lib/feed";
import { canRsvp } from "@/lib/items";
import { requireProfile } from "@/lib/session";

export const metadata: Metadata = { title: "التفاصيل — حاضنة الأعمال" };

const UUID_RE = /^[0-9a-f-]{36}$/i;

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { supabase, user } = await requireProfile();
  const { items, state } = await loadItemsWithRsvp(supabase, user.id, id);
  const item = items[0];
  if (!item) notFound();
  const s = state[item.id];
  const spotsLeft = item.capacity != null ? Math.max(0, item.capacity - s.confirmedCount) : null;

  return (
    <article>
      <Link href="/app" className="mb-4 inline-flex min-h-11 items-center gap-1 font-medium text-emerald hover:underline">
        <span aria-hidden="true">→</span> رجوع
      </Link>
      <ItemImage id={item.id} src={item.image_url} className="aspect-[16/9] rounded-2xl md:aspect-[21/9]" />
      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_320px]">
        <div>
          <Badges item={item} />
          <h1 className="mt-4 text-3xl font-bold leading-snug text-olive">{item.title}</h1>
          {item.body && <div className="mt-5 whitespace-pre-line text-lg leading-loose text-ink/85">{item.body}</div>}
        </div>
        {item.type !== "post" && (
          <aside className="h-fit space-y-5 rounded-2xl border border-olive/10 bg-white p-5 shadow-sm md:sticky md:top-24">
            <ItemMeta item={item} />
            {spotsLeft != null && (
              <p className="text-sm text-ink/60">
                المؤكَّدون: {s.confirmedCount} / {item.capacity}
              </p>
            )}
            {canRsvp(item.type) && (
              <RsvpButton
                itemId={item.id}
                online={item.mode !== "onsite"}
                confirmed={s.confirmed}
                attended={s.attended}
                meetingLink={s.meetingLink}
                full={s.full}
                ended={s.ended}
              />
            )}
          </aside>
        )}
      </div>
    </article>
  );
}
