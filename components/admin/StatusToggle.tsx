"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Spinner from "@/components/ui/Spinner";
import { createClient } from "@/lib/supabase/client";

/** Block / re-activate a student account. */
export default function StatusToggle({ id, status }: { id: string; status: "active" | "blocked" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const blocked = status === "blocked";
  const toggle = async () => {
    if (!window.confirm(blocked ? "إعادة تفعيل هذا الحساب؟" : "توقيف هذا الحساب؟ لن يستطيع الطالب استعمال المنصة.")) return;
    setBusy(true);
    const { error } = await createClient().from("profiles").update({ status: blocked ? "active" : "blocked" }).eq("id", id);
    setBusy(false);
    if (error) return window.alert("تعذّر التغيير: " + error.message);
    router.refresh();
  };
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 font-bold ${blocked ? "bg-emerald text-white hover:bg-olive" : "border-2 border-red-700/30 text-red-800 hover:bg-red-50"} ${busy ? "pending-ring" : ""}`}
    >
      {busy && <Spinner className="h-4 w-4" />}
      {blocked ? "إعادة تفعيل الحساب" : "توقيف الحساب"}
    </button>
  );
}
