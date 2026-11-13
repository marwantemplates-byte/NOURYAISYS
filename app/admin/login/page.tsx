import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "دخول المدير — حاضنة الأعمال",
  robots: { index: false, follow: false },
};

const NOTICES: Record<string, string> = {
  notadmin: "هذا الحساب ليس حساب مدير. سجّل الدخول بحساب الإدارة.",
};

/** The admin's own login page (separate from the students' /login). */
export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  // Already signed in as admin → straight to the dashboard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && !error) {
    const { data: p } = await supabase.from("profiles").select("role,status").eq("id", user.id).maybeSingle();
    if (p?.role === "admin" && p.status === "active") redirect("/admin");
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-olive px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center text-white">
          <span aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold font-heading text-2xl text-ink">
            ح
          </span>
          <h1 className="mt-4 text-2xl font-bold">لوحة تحكم المدير</h1>
          <p className="mt-1 text-white/70">حاضنة الأعمال — دخول الإدارة فقط</p>
        </div>
        <main id="main" className="rounded-2xl bg-white p-6 shadow-2xl shadow-black/30 sm:p-8">
          <AdminLoginForm notice={error ? NOTICES[error] : undefined} />
        </main>
      </div>
    </div>
  );
}
