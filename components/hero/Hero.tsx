import Link from "next/link";
import HeroScene from "./HeroScene";

export default function Hero() {
  return (
    <>
      {/* Curtain reveal: the background is pinned (sticky) and takes no space in the flow
          (negative margin = its own height). The next section slides up over it. */}
      <div className="hero-bg sticky top-0 z-0 bg-olive">
        <HeroScene coverTargetId="top" />
      </div>

      {/* In-flow hero content: text and buttons scroll normally */}
      <section
        id="top"
        aria-labelledby="hero-title"
        className="hero-h relative z-10 flex items-end text-white"
      >

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-28 sm:px-8 sm:pb-32 md:pb-36">
        <div className="max-w-3xl">
          <p
            className="hero-fade mb-4 inline-flex items-center gap-2 rounded-2xl border border-gold-light/40 sm:rounded-full bg-black/25 px-4 py-1.5 text-sm text-gold-light backdrop-blur-sm sm:text-base"
            style={{ animationDelay: "100ms" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
            جامعة الأمير عبد القادر للعلوم الإسلامية — قسنطينة
          </p>
          <h1
            id="hero-title"
            className="hero-fade text-5xl font-bold leading-[1.15] drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-6xl md:text-7xl"
            style={{ animationDelay: "250ms" }}
          >
            حاضنة الأعمال
          </h1>
          <p
            className="hero-fade mt-5 max-w-2xl text-lg leading-relaxed text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] sm:text-xl"
            style={{ animationDelay: "400ms" }}
          >
            من فكرة إلى مؤسسة: نرافق الطلبة في تحويل مشاريعهم إلى نماذج أولية ومؤسسات ناشئة
          </p>
          <div
            className="hero-fade mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4"
            style={{ animationDelay: "550ms" }}
          >
            <Link
              href="/register"
              prefetch={false}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gold px-8 text-lg font-bold text-ink shadow-lg shadow-black/20 transition-colors hover:bg-gold-light"
            >
              سجّل الآن
            </Link>
            <a
              href="#events"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-white/80 px-8 text-lg font-medium text-white backdrop-blur-[2px] transition-colors hover:bg-white/10"
            >
              الأحداث والدورات
            </a>
          </div>
        </div>
      </div>

      {/* Scroll-down indicator */}
      <a
        href="#about"
        aria-label="انزل إلى القسم التالي"
        className="absolute bottom-6 left-1/2 z-10 flex h-11 w-11 -translate-x-1/2 items-center justify-center"
      >
        <span className="flex h-10 w-6 justify-center rounded-full border-2 border-white/70 pt-2">
          <span className="scroll-dot h-2 w-1 rounded-full bg-gold-light" />
        </span>
      </a>
      </section>
    </>
  );
}
