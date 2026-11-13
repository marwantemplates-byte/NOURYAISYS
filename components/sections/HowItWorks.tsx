import SectionHeading from "./SectionHeading";

export const STEPS = [
  { title: "سجّل وعرّف بمشروعك", text: "أنشئ حسابك وأضف تخصصك وفكرة مشروعك في دقائق." },
  { title: "تابع الدورات والأحداث", text: "أكّد حضورك في الدورات والورشات، حضوريًا أو أونلاين." },
  { title: "حوّل فكرتك إلى نموذج أولي ومؤسسة", text: "بمرافقة المؤطرين، ابنِ نموذجك الأولي وانطلق في تأسيس مؤسستك." },
];

export default function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="bg-olive py-20 text-white md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading id="how-title" eyebrow="كيف تعمل الحاضنة" title="ثلاث خطوات من الفكرة إلى المؤسسة" light />
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-7">
              <span
                aria-hidden="true"
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-gold font-heading text-xl font-bold text-ink"
              >
                {i + 1}
              </span>
              <h3 className="mb-2 text-xl font-bold text-gold-light">{s.title}</h3>
              <p className="leading-relaxed text-white/80">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
