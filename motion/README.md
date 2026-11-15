# حاضنة الأعمال — motion film

35 s, 1920×1080, 60 fps product film of the incubator platform (plus a 9:16 re-frame).
Everything is **one deterministic HTML file** (`film.html`): every pixel is computed from `t` inside `seek(t)`
— no CSS transitions, timers or carried state, so any frame renders on its own.

- Design tokens come straight from `app/globals.css`: olive `#1f3d2b`, emerald `#2e6b4a`, gold `#c9a24b`,
  gold-light `#e8d5a3`, gold-dark `#8a6a24`, ivory `#faf7f0`, admin panel `#f3f1ea`; Reem Kufi (headings) + Tajawal (body),
  radii 12/16 px, the hero gradients, the hero leaf shapes/colours from `components/hero/leaves.ts`.
- Screens are rebuilt in HTML/CSS from the real components (Hero, AuthShell + RegisterForm, StudentShell + ItemCard,
  AdminShell, admin overview, ItemForm, AttendanceList, StudentsTable + StudentNotes, EmailComposer).
  Only the university photos (`public/hero/*`) are reused as images.
- All people and data are invented; no data from the real database.

## Preview / render

```bash
# live preview (real-time playback) – open in Chromium
open film.html            # or film.html?t=14.4 to freeze a frame, film.html?v=9x16 for vertical
node render-stills.js stills 2.36 15.5 19.17 33.4
```

## Beat map  (102.86 BPM → 1 beat = 0.583 s, 60 beats = 35.000 s, the music loops with the film)

| beat | time  | where | what happens |
|---:|---:|---|---|
| 0  | 0.00 | laptop · hero | Inside the laptop: university photo, trees swaying, leaves drifting, golden guide leaf floating near the CTA, cursor resting |
| 2  | 1.17 | hero | cursor glides toward «سجّل الآن» |
| 3  | 1.75 | hero | hover — button warms to gold-light |
| 4  | 2.33 | hero | **CLICK** (press + ring) |
| 5  | 2.92 | → | the golden leaf detaches and flies out of the screen; camera pulls back (both devices seen in one world) and follows it to the phone |
| 9  | 5.25 | phone · register | leaf touches **الاسم واللقب** → «أمينة بن صالح» types |
| 10 | 5.83 | register | **البريد الإلكتروني** → amina.bensalah@gmail.com |
| 11 | 6.42 | register | **رقم الهاتف** → 0661 24 58 13, passwords fill |
| 12 | 7.00 | register | «التالي» → progress bar slides «1. الحساب» → «2. المشروع», step 2 slides in, selects fill |
| 14 | 8.17 | register | **فكرة المشروع** types «منصة لتسويق المنتجات المحلية» |
| 17 | 9.92 | register | «إنشاء الحساب» pressed |
| 18 | 10.50 | register | green check pops — «مرحبا بك في الحاضنة» |
| 19 | 11.08 | phone · feed | register slides away, student feed underneath |
| 20–22 | 11.67–12.83 | feed | three cards arrive, one per beat (badges دورة تكوينية / حدث, حضوري / أونلاين, date, place, trainer) |
| 24 | 14.00 | feed | leaf lands on «تأكيد الحضور» → fills emerald «تم تأكيد حضورك ✓» |
| 26 | 15.17 | world | email card slides out: «وصلك تأكيد في الإيميل»; leaf touches it |
| 27–29 | 15.75–16.92 | → laptop | leaf flies back to the laptop; admin panel slides up over the hero like the site's curtain |
| 29–32 | 16.92–18.67 | admin · overview | leaf taps each tile on its beat: 63 مسجل · 41 مشروع · 12 دورة وحدث · 86% حضور; monthly bars grow (جوان→نوفمبر = 63) |
| 33 | 19.25 | overview | «+ إضافة دورة» → form |
| 34–38 | 19.83–22.17 | form | title «ريادة الأعمال الرقمية», trainer «د. سمية حمادي», date, **أونلاين** toggle reveals the Google Meet field, link types |
| 39 | 22.75 | form | «حفظ ونشر» |
| 40 | 23.33 | wide | the new course appears instantly at the top of the phone feed beside it (gold ring) |
| 41 | 23.92 | admin | sidebar «الدورات والأحداث» → attendance of «التسويق الرقمي للمشاريع الناشئة» |
| 42–45 | 24.50–26.25 | attendance | four «حاضر ✓» checks, one per beat; نسبة الحضور 82→83→84→85→86% live |
| 46 | 26.83 | admin | sidebar «الطلبة» → students table |
| 47 | 27.42 | students | «تفاصيل» on أمينة → file opens (project idea, faculty) |
| 48–49 | 28.00–28.58 | students | director's note typed, «إضافة الملاحظة» → saved |
| 50 | 29.17 | admin | sidebar «الإيميل الجماعي» |
| 51 | 29.75 | email | leaf taps «إرسال إيميل للجميع» → one envelope pops |
| 52–54 | 30.33–31.5 | email | it multiplies into a fan and leaves in one clean arc; «تم الإرسال إلى 63 طالب» counts up |
| 55 | 32.08 | world | camera pulls back: laptop + phone + logo «حاضنة الأعمال» and «جامعة الأمير عبد القادر للعلوم الإسلامية — قسنطينة»; admin curtain lifts, hero returns |
| 57–60 | 33.45–35.00 | → hero | leaf arcs back into the hero and merges into its drift path; camera pushes into the laptop; cursor fades in at its rest spot → **frame 35.000 = frame 0** |

Loop guarantees: leaf drift `drift(τ)` is shared by the start and the end (τ = t or t−35), hero leaves and tree sway
are 35 s-periodic, cursor/CTA/camera states are identical at both ends, the phone is reset to register only while off camera.
