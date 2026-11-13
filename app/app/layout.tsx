import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import StudentShell from "@/components/app/StudentShell";
import { requireProfile } from "@/lib/session";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireProfile();
  // Admins never see the student area (they belong in /admin)
  if (profile?.role === "admin" && profile.status === "active") redirect("/admin");
  const blocked = profile?.status === "blocked";

  return (
    <Suspense>
      <StudentShell name={profile?.full_name ?? ""} subtitle={[profile?.specialty, profile?.level].filter(Boolean).join(" · ")}>
        {blocked ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
            <h1 className="text-xl font-bold">حسابك موقوف</h1>
            <p className="mt-2">تواصل مع إدارة الحاضنة لإعادة تفعيله.</p>
          </div>
        ) : !profile ? (
          <div role="alert" className="rounded-2xl border border-gold/40 bg-gold-light/30 p-6">
            <h1 className="text-xl font-bold text-olive">لم نجد ملفك</h1>
            <p className="mt-2">حدث خطأ في إنشاء ملفك الشخصي. تواصل مع إدارة الحاضنة.</p>
          </div>
        ) : (
          children
        )}
      </StudentShell>
    </Suspense>
  );
}
