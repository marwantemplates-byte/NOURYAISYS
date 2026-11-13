import Link from "next/link";
import type { ReactNode } from "react";
import { requireProfile } from "@/lib/session";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireProfile();
  const blocked = profile?.status === "blocked";

  return (
    <div className="min-h-svh bg-ivory">
      <header className="sticky top-0 z-40 border-b border-olive/10 bg-ivory/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-8">
          <Link href="/app" className="flex min-h-11 items-center gap-2 font-heading text-lg font-bold text-olive sm:text-xl">
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-lg bg-olive text-base text-gold-light">
              ح
            </span>
            <span className="hidden sm:inline">حاضنة الأعمال</span>
          </Link>
          <nav aria-label="قائمة الطالب" className="flex items-center gap-1">
            <Link href="/app" className="inline-flex min-h-11 items-center rounded-lg px-3 font-medium text-ink hover:bg-olive/5">
              الدورات
            </Link>
            <Link href="/app/profile" className="inline-flex min-h-11 items-center rounded-lg px-3 font-medium text-ink hover:bg-olive/5">
              ملفي
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="inline-flex min-h-11 items-center rounded-lg px-3 font-medium text-ink/70 hover:bg-olive/5 hover:text-red-800">
                خروج
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-4 py-8 sm:px-8 md:py-10">
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
      </main>
    </div>
  );
}
