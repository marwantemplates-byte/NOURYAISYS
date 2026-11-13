import { MODE_LABELS, TYPE_LABELS, type Item } from "@/lib/items";

export default function Badges({ item }: { item: Item }) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="rounded-full bg-gold px-3 py-1 text-sm font-bold text-ink">{TYPE_LABELS[item.type]}</span>
      {item.type !== "post" && (
        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${
            item.mode === "online" ? "bg-white text-emerald ring-1 ring-emerald/30" : "bg-olive text-white"
          }`}
        >
          {MODE_LABELS[item.mode]}
        </span>
      )}
    </div>
  );
}
