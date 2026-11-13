import Link from "next/link";
import Badges from "@/components/app/Badges";
import ItemImage from "@/components/app/ItemImage";
import ItemMeta from "@/components/app/ItemMeta";
import RsvpButton from "@/components/app/RsvpButton";
import type { RsvpState } from "@/lib/feed";
import { canRsvp, type Item } from "@/lib/items";

export default function ItemCard({ item, state }: { item: Item; state: RsvpState }) {
  const spotsLeft = item.capacity != null ? Math.max(0, item.capacity - state.confirmedCount) : null;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-olive/10 bg-white shadow-sm">
      <Link href={`/app/items/${item.id}`} tabIndex={-1} aria-hidden="true">
        <ItemImage id={item.id} src={item.image_url} className="aspect-[16/9]" />
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <Badges item={item} />
        <h2 className="text-xl font-bold leading-snug text-olive">
          <Link href={`/app/items/${item.id}`} className="hover:text-emerald hover:underline hover:underline-offset-4">
            {item.title}
          </Link>
        </h2>
        {item.type === "post" ? (
          item.body && <p className="line-clamp-4 leading-relaxed text-ink/75">{item.body}</p>
        ) : (
          <ItemMeta item={item} />
        )}
        {canRsvp(item.type) && (
          <div className="mt-auto space-y-2 pt-2">
            {spotsLeft != null && !state.full && !state.ended && (
              <p className="text-sm text-ink/60">الأماكن المتبقية: {spotsLeft}</p>
            )}
            <RsvpButton
              itemId={item.id}
              online={item.mode !== "onsite"}
              confirmed={state.confirmed}
              attended={state.attended}
              meetingLink={state.meetingLink}
              full={state.full}
              ended={state.ended}
            />
          </div>
        )}
      </div>
    </article>
  );
}
