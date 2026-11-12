import Link from "next/link";

export default function CallToAction() {
  return (
    <section aria-labelledby="cta-title" className="px-5 py-20 sm:px-8 md:py-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-l from-olive to-emerald px-6 py-14 text-center text-white md:px-12 md:py-16">
        <span aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full border-[18px] border-gold/15" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full border-[18px] border-gold/10" />
        <h2 id="cta-title" className="relative text-3xl font-bold leading-tight md:text-4xl">
          عندك فكرة مشروع؟ <span className="text-gold-light">ابدأ رحلتك اليوم</span>
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-lg text-white/85">
          التسجيل مجاني ومفتوح لكل طلبة الجامعة.
        </p>
        <Link
          href="/register"
              prefetch={false}
          className="relative mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-gold px-10 text-lg font-bold text-ink shadow-lg shadow-black/20 transition-colors hover:bg-gold-light"
        >
          سجّل الآن
        </Link>
      </div>
    </section>
  );
}
