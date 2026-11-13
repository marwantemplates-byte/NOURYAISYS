import type { Item } from "@/lib/items";
import { formatDate } from "@/lib/items";

function Row({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-ink/75">
      <svg className="mt-0.5 shrink-0 text-emerald" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={icon} />
      </svg>
      <span>{children}</span>
    </li>
  );
}

export default function ItemMeta({ item }: { item: Item }) {
  return (
    <ul className="space-y-2 text-[15px]">
      {item.starts_at && (
        <Row icon="M7 3v3M17 3v3M4 8h16M5 5h14v15H5z">
          <time dateTime={item.starts_at}>{formatDate(item.starts_at)}</time>
        </Row>
      )}
      {item.mode !== "online" && item.location && (
        <Row icon="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11zm0-8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z">{item.location}</Row>
      )}
      {item.mode === "online" && <Row icon="M4 6h11v12H4zM15 10l5-3v10l-5-3">عن بُعد عبر Google Meet</Row>}
      {item.trainer_name && <Row icon="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0">{item.trainer_name}</Row>}
    </ul>
  );
}
