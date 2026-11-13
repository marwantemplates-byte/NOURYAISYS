import Link from "next/link";
import type { ReactNode } from "react";
import HeroScene from "@/components/hero/HeroScene";

/**
 * Layout for login / register / password pages:
 * the same university photo + drifting leaves as the home hero (fixed behind the page,
 * with extra leaves at the top), and the form on a white card for readability.
 */
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
    <div className="relative min-h-svh">
      {/* Fixed background: does not scroll with the form */}
      <div className="fixed inset-0 z-0 bg-olive" aria-hidden="true">
        <HeroScene extraTopLeaves />
      </div>

      <div className="relative z-10">
        <header>
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 text-white sm:px-8 md:h-20">
            <Link href="/" className="flex min-h-11 items-center gap-2 font-heading text-xl font-bold md:text-2xl">
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-base text-gold-light ring-1 ring-white/30">
                ح
              </span>
              حاضنة الأعمال
            </Link>
            <Link href="/" className="inline-flex min-h-11 items-center rounded-lg px-3 font-medium hover:bg-white/10">
              الرئيسية
            </Link>
          </div>
        </header>

        <main id="main" className="px-4 pb-16 pt-6 sm:px-8 md:pt-10">
          <div className={`mx-auto ${wide ? "max-w-2xl" : "max-w-md"}`}>
            <h1 className="text-3xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] md:text-4xl">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-lg text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]">{subtitle}</p>
            )}
            <div className="mt-6 rounded-2xl bg-white/[0.97] p-6 shadow-2xl shadow-black/30 ring-1 ring-black/5 sm:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
