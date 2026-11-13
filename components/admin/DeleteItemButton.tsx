"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Spinner from "@/components/ui/Spinner";
import { createClient } from "@/lib/supabase/client";

export default function DeleteItemButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const del = async () => {
    if (!window.confirm(`حذف «${title}» نهائيًا؟ سيتم حذف تأكيدات الحضور المرتبطة به أيضًا.`)) return;
    setBusy(true);
    const { error } = await createClient().from("items").delete().eq("id", id);
    setBusy(false);
    if (error) return window.alert("تعذّر الحذف: " + error.message);
    router.refresh();
  };
  return (
    <button
      type="button"
      onClick={del}
      disabled={busy}
      className={`inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-sm font-medium text-red-800 hover:bg-red-50 ${busy ? "pending-ring" : ""}`}
    >
      {busy && <Spinner className="h-4 w-4" />} حذف
    </button>
  );
}
