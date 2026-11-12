import Link from "next/link";
import { MODE_LABELS, TYPE_LABELS, UPCOMING_EVENTS } from "@/data/events";
import SectionHeading from "./SectionHeading";

const dateFmt = new Intl.DateTimeFormat("ar-DZ", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Algiers",
});

function Meta({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-ink/75">
      <svg className="mt-0.5 shrink-0 text-emerald" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={icon} />
      </svg>
      <span>{children}</span>
    </li>
  );
}

export default function Events() {
  return (
    <section id="events" aria-labelledby="events-title" className="scroll-mt-20 bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading id="events-title" eyebrow="قريبًا" title="الأحداث والدورات القادمة" />
          <Link
            href="/app"
              prefetch={false}
            className="mb-10 inline-flex min-h-11 items-center justify-center self-start rounded-xl border-2 border-olive px-6 font-bold text-olive transition-colors hover:bg-olive hover:text-white md:mb-14 md:self-auto"
          >
            عرض الكل
          </Link>
        </div>

        <ul className="grid gap-6 md:grid-cols-3">
          {UPCOMING_EVENTS.map((e) => (
            <li key={e.id}>
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-olive/10 bg-ivory shadow-sm transition-shadow hover:shadow-md">
                <div className="relative aspect-[16/9] bg-gradient-to-br from-olive via-emerald to-olive">
                  {e.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <svg className="absolute inset-0 h-full w-full text-gold/25" aria-hidden="true">
                      <defs>
                        <pattern id={`p-${e.id}`} width="28" height="28" patternUnits="userSpaceOnUse">
                          <path d="M14 2l12 12-12 12L2 14z" fill="none" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#p-${e.id})`} />
                    </svg>
                  )}
                  <div className="absolute inset-x-3 top-3 flex justify-between gap-2">
                    <span className="rounded-full bg-gold px-3 py-1 text-sm font-bold text-ink">{TYPE_LABELS[e.type]}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        e.mode === "online" ? "bg-white text-emerald" : "bg-olive/90 text-white ring-1 ring-white/30"
                      }`}
                    >
                      {MODE_LABELS[e.mode]}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="mb-4 text-xl font-bold leading-snug text-olive">{e.title}</h3>
                  <ul className="mt-auto space-y-2 text-[15px]">
                    <Meta icon="M7 3v3M17 3v3M4 8h16M5 5h14v15H5z">
                      <time dateTime={e.starts_at}>{dateFmt.format(new Date(e.starts_at))}</time>
                    </Meta>
                    <Meta icon="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11zm0-8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z">
                      {e.location}
                    </Meta>
                    <Meta icon="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0">{e.trainer_name}</Meta>
                  </ul>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
