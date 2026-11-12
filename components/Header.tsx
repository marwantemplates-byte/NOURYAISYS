"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { href: "#top", label: "الرئيسية" },
  { href: "#about", label: "من نحن" },
  { href: "#events", label: "الأحداث" },
  { href: "#contact", label: "تواصل" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 768 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? "bg-ivory/95 text-ink shadow-sm backdrop-blur-md" : "bg-transparent text-white"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8 md:h-20">
        <Link href="/" className="flex min-h-11 items-center gap-2 font-heading text-xl font-bold md:text-2xl">
          <span
            aria-hidden="true"
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-base ${
              solid ? "bg-olive text-gold-light" : "bg-white/15 text-gold-light ring-1 ring-white/30"
            }`}
          >
            ح
          </span>
          حاضنة الأعمال
        </Link>

        <nav aria-label="القائمة الرئيسية" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`inline-flex min-h-11 items-center rounded-lg px-3 font-medium transition-colors ${
                    solid ? "hover:bg-olive/5 hover:text-emerald" : "hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
              prefetch={false}
            className={`inline-flex min-h-11 items-center rounded-xl border-2 px-5 font-medium transition-colors ${
              solid ? "border-olive/25 text-olive hover:border-olive" : "border-white/60 hover:bg-white/10"
            }`}
          >
            دخول
          </Link>
          <Link
            href="/register"
              prefetch={false}
            className="inline-flex min-h-11 items-center rounded-xl bg-gold px-5 font-bold text-ink transition-colors hover:bg-gold-light"
          >
            سجّل الآن
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-olive/10 bg-ivory md:hidden">
          <nav aria-label="القائمة على الهاتف" className="mx-auto max-w-6xl px-5 py-4">
            <ul className="flex flex-col">
              {NAV.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center rounded-lg px-3 text-lg font-medium text-ink hover:bg-olive/5"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/login"
              prefetch={false}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-olive/25 font-medium text-olive"
              >
                دخول
              </Link>
              <Link
                href="/register"
              prefetch={false}
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gold font-bold text-ink"
              >
                سجّل الآن
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
