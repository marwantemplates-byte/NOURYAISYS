import { notFound } from "next/navigation";
import ItemForm from "@/components/admin/ItemForm";
import { ITEM_COLUMNS, type Item } from "@/lib/items";
import { requireProfile } from "@/lib/session";

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireProfile("/admin/login");
  const { data: item } = await supabase.from("items").select(ITEM_COLUMNS).eq("id", id).maybeSingle<Item>();
  if (!item) notFound();
  const { data: link } = await supabase.rpc("get_meeting_link", { p_item_id: id });
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold text-olive">تعديل</h1>
      <div className="mt-6 rounded-2xl border border-olive/10 bg-white p-6 shadow-sm sm:p-8">
        <ItemForm item={item} meetingLink={(link as string | null) ?? null} />
      </div>
    </div>
  );
}
