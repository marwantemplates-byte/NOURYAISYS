"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import Spinner from "@/components/ui/Spinner";

const NAV = [
  { href: "/app", label: "الدورات والأحداث", icon: "M7 3v3M17 3v3M4 8h16M5 5h14v15H5z" },
  { href: "/app/profile", label: "ملفي", icon: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0" },
  { href: "/", label: "الصفحة الرئيسية", icon: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/** Student area frame: top bar with a ☰ button that opens the menu (all screen sizes). */
export default function StudentShell({ name, subtitle, children }: { name: string; subtitle?: string; children: ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    setOpen(false);
    setPending(null);
  }, [pathname, search]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/app" ? pathname === "/app" || pathname.startsWith("/app/items") : pathname === href);

  return (
    <div className="min-h-svh bg-ivory">
      <header className="sticky top-0 z-40 border-b border-olive/10 bg-ivory/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="student-drawer"
            aria-label="فتح القائمة"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-olive hover:bg-olive/5"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <Link href="/app" className="flex min-h-11 items-center gap-2 font-heading text-lg font-bold text-olive sm:text-xl">
            حاضنة الأعمال
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-lg bg-olive text-base text-gold-light">
              ح
            </span>
          </Link>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label="إغلاق القائمة" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/45" />
          <aside id="student-drawer" aria-label="قائمة الطالب" className="absolute inset-y-0 right-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 bg-olive px-5 pb-5 pt-4 text-white">
              <div className="min-w-0 pt-2">
                <p className="truncate text-lg font-bold">{name || "مرحبًا"}</p>
                {subtitle && <p className="truncate text-sm text-white/70">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق القائمة"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-white/10"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-1">
                {NAV.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        aria-busy={pending === item.href || undefined}
                        onClick={() => {
                          if (active) setOpen(false);
                          else setPending(item.href);
                        }}
                        className={`flex min-h-12 items-center gap-3 rounded-xl px-3 font-medium transition-colors ${
                          active ? "bg-olive/10 text-olive" : "text-ink hover:bg-olive/5"
                        } ${pending === item.href ? "pending-ring bg-gold-light/30" : ""}`}
                      >
                        <span className={active || pending === item.href ? "text-emerald" : "text-ink/60"}>
                          {pending === item.href ? <Spinner className="m-[1px]" /> : <Icon d={item.icon} />}
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <form action="/auth/signout" method="post" className="border-t border-olive/10 p-3">
              <button type="submit" className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 font-medium text-red-800 hover:bg-red-50">
                <Icon d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
                خروج
              </button>
            </form>
          </aside>
        </div>
      )}

      <main id="main" className="mx-auto max-w-5xl px-4 py-8 sm:px-8 md:py-10">
        {children}
      </main>
    </div>
  );
}
