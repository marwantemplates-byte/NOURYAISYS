import Link from "next/link";
import DeleteItemButton from "@/components/admin/DeleteItemButton";
import { ITEM_COLUMNS, MODE_LABELS, TYPE_LABELS, formatDate, type Item } from "@/lib/items";
import { requireProfile } from "@/lib/session";

export default async function AdminItemsPage() {
  const { supabase } = await requireProfile("/admin/login");
  const { data: items } = await supabase
    .from("items")
    .select(ITEM_COLUMNS)
    .order("starts_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .returns<Item[]>();
  const list = items ?? [];
  const { data: counts } = await supabase.rpc("get_rsvp_counts", { p_item_ids: list.map((i) => i.id) });
  const countMap = new Map(((counts as { item_id: string; confirmed: number }[]) ?? []).map((c) => [c.item_id, Number(c.confirmed)]));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-olive">الدورات والأحداث</h1>
          <p className="mt-1 text-ink/70">برمجة دورة تكوينية، حدث أو منشور.</p>
        </div>
        <Link href="/admin/items/new" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gold px-5 text-lg font-bold text-ink hover:bg-gold-light">
          <span aria-hidden="true">+</span> دورة جديدة
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-olive/20 bg-white/70 p-10 text-center text-ink/60">
          لا توجد عناصر بعد. اضغط «+ دورة جديدة» لإضافة أول دورة.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {list.map((it) => {
            const confirmed = countMap.get(it.id) ?? 0;
            return (
              <li key={it.id} className="flex flex-col gap-3 rounded-2xl border border-olive/10 bg-white p-4 shadow-sm md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    <span className="rounded-full bg-gold/30 px-2 py-0.5 text-ink">{TYPE_LABELS[it.type]}</span>
                    {it.type !== "post" && <span className="rounded-full bg-olive/10 px-2 py-0.5 text-olive">{MODE_LABELS[it.mode]}</span>}
                    {it.published ? (
                      <span className="rounded-full bg-emerald/15 px-2 py-0.5 text-emerald">منشور</span>
                    ) : (
                      <span className="rounded-full bg-ink/10 px-2 py-0.5 text-ink/70">مسودة</span>
                    )}
                  </div>
                  <p className="mt-2 truncate text-lg font-bold text-ink">{it.title}</p>
                  <p className="text-sm text-ink/60">
                    {it.starts_at ? formatDate(it.starts_at) : "بدون تاريخ"}
                    {it.type !== "post" && ` · المؤكَّدون: ${confirmed}${it.capacity ? ` / ${it.capacity}` : ""}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {it.type !== "post" && (
                    <Link href={`/admin/items/${it.id}`} className="inline-flex min-h-10 items-center rounded-lg bg-olive px-3 text-sm font-bold text-white hover:bg-emerald">
                      الحضور ({confirmed})
                    </Link>
                  )}
                  <Link href={`/admin/items/${it.id}/edit`} className="inline-flex min-h-10 items-center rounded-lg border border-olive/25 px-3 text-sm font-bold text-olive hover:border-olive">
                    تعديل
                  </Link>
                  <DeleteItemButton id={it.id} title={it.title} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
