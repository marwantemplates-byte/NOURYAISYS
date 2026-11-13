import Link from "next/link";
import type { ReactNode } from "react";

/** Admin page frame: green top bar + content. */
export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-ivory">
      <header className="sticky top-0 z-40 bg-olive text-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-8">
          <Link href="/admin" className="flex min-h-11 items-center gap-2 font-heading text-lg font-bold sm:text-xl">
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-base text-gold-light">
              ح
            </span>
            لوحة التحكم
          </Link>
          <nav aria-label="قائمة المدير" className="flex items-center gap-1">
            <Link href="/app" className="inline-flex min-h-11 items-center rounded-lg px-3 font-medium hover:bg-white/10">
              واجهة الطالب
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="inline-flex min-h-11 items-center rounded-lg px-3 font-medium text-white/80 hover:bg-white/10 hover:text-white">
                خروج
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-8 md:py-10">
        {children}
      </main>
    </div>
  );
}
