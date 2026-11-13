import Link from "next/link";
import { notFound } from "next/navigation";
import AttendanceList, { type AttendeeRow } from "@/components/admin/AttendanceList";
import { ITEM_COLUMNS, MODE_LABELS, TYPE_LABELS, formatDate, type Item } from "@/lib/items";
import { requireProfile } from "@/lib/session";

type RsvpWithProfile = {
  user_id: string;
  attended: boolean | null;
  created_at: string;
  profiles: { full_name: string; email: string; phone: string | null; specialty: string | null; level: string | null } | null;
};

export default async function ItemAttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase, user } = await requireProfile("/admin/login");
  const { data: item } = await supabase.from("items").select(ITEM_COLUMNS).eq("id", id).maybeSingle<Item>();
  if (!item) notFound();

  const { data } = await supabase
    .from("rsvps")
    .select("user_id,attended,created_at,profiles!rsvps_user_id_fkey(full_name,email,phone,specialty,level)")
    .eq("item_id", id)
    .order("created_at", { ascending: true })
    .returns<RsvpWithProfile[]>();

  const rows: AttendeeRow[] = (data ?? []).map((r) => ({
    user_id: r.user_id,
    attended: r.attended,
    created_at: r.created_at,
    full_name: r.profiles?.full_name ?? "",
    email: r.profiles?.email ?? "",
    phone: r.profiles?.phone ?? null,
    specialty: r.profiles?.specialty ?? null,
    level: r.profiles?.level ?? null,
  }));

  return (
    <>
      <Link href="/admin/items" className="inline-flex min-h-11 items-center gap-1 font-medium text-emerald hover:underline">
        <span aria-hidden="true">→</span> الدورات والأحداث
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-olive">{item.title}</h1>
      <p className="mt-1 text-ink/70">
        {TYPE_LABELS[item.type]} · {MODE_LABELS[item.mode]}
        {item.starts_at && ` · ${formatDate(item.starts_at)}`}
        {item.capacity && ` · العدد الأقصى ${item.capacity}`}
        {!item.published && " · (مسودة)"}
      </p>
      <AttendanceList itemId={item.id} itemTitle={item.title} adminId={user.id} rows={rows} />
    </>
  );
}
