/** Instant placeholder shown while a page loads (via loading.tsx). */
export default function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div role="status" aria-live="polite" className="animate-pulse">
      <span className="sr-only">جارٍ التحميل…</span>
      <div className="h-9 w-56 rounded-lg bg-olive/10" />
      <div className="mt-3 h-5 w-80 max-w-full rounded bg-olive/10" />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-olive/10 bg-white">
            <div className="aspect-[16/9] bg-olive/10" />
            <div className="space-y-3 p-5">
              <div className="h-5 w-3/4 rounded bg-olive/10" />
              <div className="h-4 w-1/2 rounded bg-olive/10" />
              <div className="h-11 rounded-xl bg-olive/10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
