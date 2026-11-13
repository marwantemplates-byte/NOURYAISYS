"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import Spinner from "@/components/ui/Spinner";

type NavItem = { href: string; label: string; icon: string; soon?: boolean };

const NAV: NavItem[] = [
  { href: "/admin", label: "نظرة عامة", icon: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10" },
  { href: "/admin/students", label: "الطلبة", icon: "M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 21a8 8 0 0116 0" },
  { href: "/admin/items", label: "الدورات والأحداث", icon: "M7 3v3M17 3v3M4 8h16M5 5h14v15H5z", soon: true },
  { href: "/admin/attendance", label: "الحضور", icon: "M9 12l2 2 4-4M5 4h14v16H5z", soon: true },
  { href: "/admin/emails", label: "الإيميل الجماعي", icon: "M4 6h16v12H4zM4 7l8 6 8-6", soon: true },
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/** Admin frame: sidebar on the right (desktop) / ☰ drawer (mobile). Nothing from the student area. */
export default function AdminShell({ name, children }: { name: string; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);

  // Close the drawer / clear the loading ring once the new page is shown
  useEffect(() => {
    setOpen(false);
    setPending(null);
  }, [pathname]);
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

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold font-heading text-base text-ink">
          ح
        </span>
        <div className="leading-tight">
          <p className="font-heading text-lg font-bold">لوحة التحكم</p>
          <p className="text-xs text-white/60">حاضنة الأعمال</p>
        </div>
      </div>

      <nav aria-label="قائمة المدير" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = isActive(item.href);
            if (item.soon) {
              return (
                <li key={item.href}>
                  <span className="flex min-h-12 cursor-not-allowed items-center gap-3 rounded-xl px-3 text-white/45" aria-disabled="true">
                    <Icon d={item.icon} />
                    <span className="flex-1">{item.label}</span>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px]">قريبًا</span>
                  </span>
                </li>
              );
            }
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
                    active ? "bg-gold text-ink" : "text-white/90 hover:bg-white/10"
                  } ${pending === item.href ? "pending-ring bg-white/10" : ""}`}
                >
                  {pending === item.href ? <Spinner className="m-[1px] text-gold" /> : <Icon d={item.icon} />}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <p className="truncate px-3 pb-2 text-sm text-white/60">{name}</p>
        <Link href="/" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-white/80 hover:bg-white/10">
          <Icon d="M14 3h7v7M21 3l-9 9M19 14v6H4V5h6" />
          عرض الموقع
        </Link>
        <form action="/auth/signout?to=/admin/login" method="post">
          <button type="submit" className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-white/80 hover:bg-white/10 hover:text-white">
            <Icon d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />
            خروج
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-svh bg-[#F3F1EA]">
      {/* Desktop sidebar (right side, RTL) */}
      <aside className="fixed inset-y-0 right-0 z-30 hidden w-64 bg-olive text-white lg:block">{sidebar}</aside>

      {/* Mobile top bar with ☰ */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-olive px-4 text-white lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="admin-drawer"
          aria-label="فتح القائمة"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <p className="font-heading text-lg font-bold">لوحة التحكم</p>
        <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold font-heading text-base text-ink">
          ح
        </span>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="إغلاق القائمة" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/50" />
          <aside id="admin-drawer" className="absolute inset-y-0 right-0 w-72 max-w-[85vw] bg-olive text-white shadow-2xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="إغلاق القائمة"
              className="absolute left-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main id="main" className="px-4 py-6 sm:px-6 lg:mr-64 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  );
}
