# منصة حاضنة الأعمال — جامعة الأمير عبد القادر

مشروع منفصل عن NOURYS (فرع `incubator-platform`).

- **SPEC.md**: المواصفات الكاملة. أي أداة AI تقراه قبل ما تكتب كود.
- **public/hero/hero-desktop.jpg**: صورة الواجهة (16:9). **public/hero/hero-mobile.jpg**: صورة الهاتف (9:16).

## التشغيل
```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # بناء الإنتاج
```

## ضبط الـ Hero
| الثابت | الملف | الدور |
|---|---|---|
| `LEAF_COUNT_DESKTOP` | `components/hero/leaves.ts` | عدد الأوراق على الكمبيوتر (40) |
| `LEAF_COUNT_MOBILE` | `components/hero/leaves.ts` | عدد الأوراق على الهاتف، أقل من 768px (18) |

## بيانات تجريبية
- `data/events.ts`: الأحداث والدورات القادمة (تتبدل بـ Supabase من بعد).
- `data/site.ts`: معلومات التواصل وأرقام الإحصائيات.
