import { CONTACT } from "@/data/site";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="contact" aria-labelledby="contact-title" className="scroll-mt-20 bg-olive text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-3">
        <div>
          <p className="font-heading text-2xl font-bold text-gold-light">حاضنة الأعمال</p>
          <p className="mt-2 leading-relaxed text-white/80">
            جامعة الأمير عبد القادر للعلوم الإسلامية — قسنطينة
          </p>
        </div>
        <div className="md:col-span-2">
          <h2 id="contact-title" className="mb-4 text-xl font-bold">
            تواصل معنا
          </h2>
          <ul className="grid gap-2 sm:grid-cols-3">
            <li>
              <a href={`mailto:${CONTACT.email}`} className="inline-flex min-h-11 items-center gap-2 text-white/90 hover:text-gold-light">
                <span className="text-gold-light">البريد:</span>
                <span dir="ltr">{CONTACT.email}</span>
              </a>
            </li>
            <li>
              <a href={CONTACT.phoneHref} className="inline-flex min-h-11 items-center gap-2 text-white/90 hover:text-gold-light">
                <span className="text-gold-light">الهاتف:</span>
                <span dir="ltr">{CONTACT.phone}</span>
              </a>
            </li>
            <li>
              <a
                href={CONTACT.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 text-white/90 hover:text-gold-light"
              >
                <span className="text-gold-light">فيسبوك</span>
                <span className="sr-only">(يفتح في نافذة جديدة)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-5 py-5 text-sm text-white/70 sm:px-8">
          © {year} حاضنة الأعمال — جامعة الأمير عبد القادر للعلوم الإسلامية. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
