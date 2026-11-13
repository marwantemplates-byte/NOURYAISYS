/** Small shared helpers for the admin area. */

export const ITEM_IMAGES_BUCKET = "item-images";

/** Algeria is UTC+1 all year (no DST). ISO → value for <input type="datetime-local">. */
export function toLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + 60 * 60 * 1000);
  return d.toISOString().slice(0, 16);
}

/** <input type="datetime-local"> value (Algeria time) → ISO string. */
export function fromLocalInput(v: string) {
  return v ? new Date(`${v}:00+01:00`).toISOString() : null;
}

/** Download rows as a CSV file that Excel opens correctly in Arabic. */
export function downloadCsv(filename: string, head: string[], rows: unknown[][]) {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = "﻿" + [head, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const pct = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);
