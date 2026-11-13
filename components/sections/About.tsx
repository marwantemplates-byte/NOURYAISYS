import SectionHeading from "./SectionHeading";

export const OFFERS = [
  {
    title: "المرافقة",
    text: "مؤطرون يتابعونك خطوة بخطوة: صياغة الفكرة، دراسة السوق، وبناء نموذج العمل.",
    icon: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0",
  },
  {
    title: "التكوين",
    text: "دورات وورشات حضورية وأونلاين في ريادة الأعمال، التسويق، والجوانب القانونية.",
    icon: "M4 6l8-3 8 3-8 3-8-3zm3 2v5c0 1.5 2.5 3 5 3s5-1.5 5-3V8",
  },
  {
    title: "التوجيه نحو التمويل",
    text: "نعرّفك بآليات التمويل المتاحة للمؤسسات الناشئة ونساعدك على تحضير ملفك.",
    icon: "M12 3v18M16 7H10a3 3 0 000 6h4a3 3 0 010 6H7",
  },
  {
    title: "مسار «شهادة — مؤسسة ناشئة»",
    text: "مرافقة الطلبة في مسار القرار الوزاري 1275 لتحويل مذكرة التخرج إلى مشروع مؤسسة ناشئة.",
    icon: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  },
];

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-20 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          id="about-title"
          eyebrow="من نحن"
          title="حاضنة أعمال في قلب الجامعة"
          intro="حاضنة الأعمال بجامعة الأمير عبد القادر للعلوم الإسلامية فضاء يرافق الطلبة أصحاب الأفكار، من أول خطوة حتى إطلاق نموذج أولي ومؤسسة ناشئة، في إطار يجمع بين قيم الجامعة وروح الابتكار."
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {OFFERS.map((o) => (
            <li
              key={o.title}
              className="rounded-2xl border border-olive/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-olive text-gold-light">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={o.icon} />
                </svg>
              </span>
              <h3 className="mb-2 text-xl font-bold text-olive">{o.title}</h3>
              <p className="leading-relaxed text-ink/75">{o.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
