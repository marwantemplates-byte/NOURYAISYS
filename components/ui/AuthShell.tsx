import Link from "next/link";
import type { ReactNode } from "react";

/** Simple centered card layout for auth pages (login, register, password). */
export default function AuthShell({
  title,
  subtitle,
  children,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-svh bg-ivory">
      <header className="border-b border-olive/10 bg-white/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex min-h-11 items-center gap-2 font-heading text-xl font-bold text-olive">
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-lg bg-olive text-base text-gold-light">
              ح
            </span>
            حاضنة الأعمال
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center rounded-lg px-3 text-ink/70 hover:text-emerald">
            الرئيسية
          </Link>
        </div>
      </header>
      <main id="main" className="px-5 py-10 sm:px-8 md:py-16">
        <div className={`mx-auto ${wide ? "max-w-2xl" : "max-w-md"}`}>
          <h1 className="text-3xl font-bold text-olive">{title}</h1>
          {subtitle && <p className="mt-2 text-lg text-ink/70">{subtitle}</p>}
          <div className="mt-8 rounded-2xl border border-olive/10 bg-white p-6 shadow-sm sm:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
