import CountUp from "@/components/CountUp";
import { STATS } from "@/data/site";

export default function Stats() {
  return (
    <section aria-labelledby="stats-title" className="py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2 id="stats-title" className="sr-only">
          الحاضنة بالأرقام
        </h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {STATS.map((s) => (
            <li
              key={s.label}
              className="rounded-2xl border border-gold/30 bg-white px-4 py-8 text-center shadow-sm"
            >
              <p className="font-heading text-4xl font-bold text-emerald md:text-5xl">
                <CountUp value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 font-medium text-ink/75">{s.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
