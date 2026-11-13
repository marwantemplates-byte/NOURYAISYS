import CountUp from "@/components/CountUp";
import { PARTNERS_COUNT, STATS } from "@/data/site";
import { createPublicClient } from "@/lib/supabase/server";

/** Live numbers from Supabase (public_stats); placeholder values only if the DB is unreachable. */
async function getStats() {
  try {
    const { data, error } = await createPublicClient().rpc("public_stats");
    if (error || !data?.[0]) throw error;
    const s = data[0] as { students: number; projects: number; trainings: number };
    return [
      { value: Number(s.students), suffix: "", label: "طالب مسجّل" },
      { value: Number(s.projects), suffix: "", label: "مشروع مرافَق" },
      { value: Number(s.trainings), suffix: "", label: "دورة تكوينية" },
      { value: PARTNERS_COUNT, suffix: "", label: "شريك" },
    ];
  } catch {
    return STATS;
  }
}

export default async function Stats() {
  const stats = await getStats();
  return (
    <section aria-labelledby="stats-title" className="py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <h2 id="stats-title" className="sr-only">
          الحاضنة بالأرقام
        </h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {stats.map((s) => (
            <li key={s.label} className="rounded-2xl border border-gold/30 bg-white px-4 py-8 text-center shadow-sm">
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
