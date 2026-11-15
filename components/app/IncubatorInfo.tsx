import { STEPS } from "@/components/sections/HowItWorks";
import { INCUBATOR_ADDRESS, INCUBATOR_AUDIENCE, STARTUP_DZ, STUDENT_OFFERS } from "@/data/incubator";
import { CONTACT } from "@/data/site";

/** About the incubator + what it offers (used inside the student area). */
export default function IncubatorInfo({ withContact = false }: { withContact?: boolean }) {
  return (
    <div className="space-y-8">
      <section aria-labelledby="about-in" className="rounded-2xl bg-olive p-6 text-white sm:p-8">
        <p className="text-sm font-bold text-gold-light">من نحن</p>
        <h2 id="about-in" className="mt-1 text-2xl font-bold">حاضنة الأعمال — جامعة الأمير عبد القادر</h2>
        <p className="mt-3 leading-relaxed text-white/85">
          فضاء يرافق الطلبة أصحاب الأفكار، من أول خطوة حتى إطلاق نموذج أولي ومؤسسة ناشئة، في إطار يجمع بين قيم الجامعة وروح الابتكار.
        </p>
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-white/10 px-4 py-3 leading-relaxed text-gold-light">
          <svg className="mt-0.5 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 21a8 8 0 0116 0M19 8l2 2-2 2" />
          </svg>
          <span>{INCUBATOR_AUDIENCE}</span>
        </p>
      </section>

      <section aria-labelledby="offers-in">
        <h2 id="offers-in" className="text-xl font-bold text-olive">ماذا تقدّم لك الحاضنة؟</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {STUDENT_OFFERS.map((o) => (
            <li key={o.title} className="rounded-2xl border border-olive/10 bg-white p-5 shadow-sm">
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-olive text-gold-light">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={o.icon} />
                </svg>
              </span>
              <h3 className="text-lg font-bold text-olive">{o.title}</h3>
              <p className="mt-1 leading-relaxed text-ink/75">{o.text}</p>
              {o.extra && (
                <p className="mt-2 flex items-start gap-2 leading-relaxed text-ink/75">
                  <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span>{o.extra}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="steps-in">
        <h2 id="steps-in" className="text-xl font-bold text-olive">كيف تستفيد؟</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-gold/30 bg-white p-5 shadow-sm">
              <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-heading font-bold text-ink">{i + 1}</span>
              <h3 className="mt-3 font-bold text-olive">{s.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink/75">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {withContact && (
        <section aria-labelledby="contact-in" className="rounded-2xl border border-olive/10 bg-white p-5 shadow-sm">
          <h2 id="contact-in" className="text-xl font-bold text-olive">تواصل معنا</h2>
          <ul className="mt-3 space-y-1">
            <li><a href={`mailto:${CONTACT.email}`} className="inline-flex min-h-11 items-center gap-2 hover:text-emerald">✉ <span dir="ltr">{CONTACT.email}</span></a></li>
            {CONTACT.phone && <li><a href={CONTACT.phoneHref} className="inline-flex min-h-11 items-center gap-2 hover:text-emerald">☎ <span dir="ltr">{CONTACT.phone}</span></a></li>}
            <li className="flex min-h-11 items-start gap-2 py-2">
              <span aria-hidden="true">📍</span>
              <span>
                <span className="font-medium">العنوان:</span> {INCUBATOR_ADDRESS}
              </span>
            </li>
          </ul>
          <p className="mt-3 border-t border-olive/10 pt-3 text-sm">
            <a
              href={STARTUP_DZ.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 font-medium text-emerald underline underline-offset-4 hover:text-olive"
            >
              {STARTUP_DZ.label}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 3h7v7M21 3l-9 9M19 14v6H4V5h6" />
              </svg>
              <span className="sr-only">(يفتح في نافذة جديدة)</span>
            </a>
          </p>
        </section>
      )}
    </div>
  );
}
