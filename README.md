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
| `WIND_STRENGTH` | `components/hero/windShader.ts` | أقصى إزاحة بالبكسل للأشجار القريبة (افتراضي `10`، البعيدة ≈ 3) |
| `WIND_SPEED` | `components/hero/windShader.ts` | سرعة الريح (افتراضي `1.0`) |
| `LEAF_COUNT_DESKTOP` | `components/hero/leaves.ts` | عدد الأوراق على الكمبيوتر (40) |
| `LEAF_COUNT_MOBILE` | `components/hero/leaves.ts` | عدد الأوراق على الهاتف، أقل من 768px (18) |
| `LEAF_COUNT_LOW_END` | `components/hero/leaves.ts` | عدد الأوراق على الأجهزة الضعيفة (8) |

### التشخيص
- `/?debug=mask`: يعرض قناع النباتات بالأبيض والأسود (الأبيض = يتحرك، الأسود = ثابت).
- `/?lowend=1`: يحاكي هاتف ضعيف (صورة ثابتة + 8 أوراق).
- في الـ Console: سطر `[hero] mode: ...` يقول واش راه يخدم (webgl ولا static-image) وعلاش.
- الأجهزة الضعيفة (أقل من 4 أنوية، ذاكرة أقل من 4GB، شبكة 2g/3g): بلا WebGL و 8 أوراق. مع Save-Data: صورة ثابتة بلا أوراق.

## بيانات تجريبية
- `data/events.ts`: الأحداث والدورات القادمة (تتبدل بـ Supabase من بعد).
- `data/site.ts`: معلومات التواصل وأرقام الإحصائيات.
