# حاضنة الأعمال — introduction film (38 s, 16:9, 1920×1080, 60 fps)

Same engine as `promo-v3/film31.html` + `script31.js` (branch `claude/fervent-noether-5unrxn`):
one CSS-3D world with real perspective, one camera driven by keyframes (`CAM`, monotone Hermite),
every pixel computed inside `render(t)` — no CSS transitions, no timers.

- `film.html` — the world (notebook, pencil, paper plane, silver laptop with the real platform home,
  four pillar objects, flat-lay journey, pop-up chart, final brand card).
- `script.js` — camera, beat map, all animation.
- `render.js` — Playwright renderer, frame-exact (stills / video chunks).
- `make-audio.py` — original synthesized music bed (100 BPM) + landing sounds.

Texts come from the platform (`components/sections/About.tsx`, `HowItWorks.tsx`, hero) and the brief.
Natural colours during the story; the incubator's olive `#1f3d2b` / gold `#c9a24b` (from `app/globals.css`)
appear only at the brand reveal. Fonts: Reem Kufi + Tajawal (platform), Cairo (captions), Aref Ruqaa (handwriting).

## Beat map (100 BPM, 1 beat = 0.6 s)

| time | scene | what happens |
|---:|---|---|
| 0.0–2.2 | Hook | night → morning light slides over a warm oak desk; an open notebook |
| 0.6–2.3 | Hook | a pencil sketches a lightbulb, rays pop |
| 2.55–3.55 | Hook | the pencil writes «عندي فكرة…» |
| 3.7–4.45 | Hook | the left page turns by itself onto the right page |
| 4.45–5.3 | Hook | «…لكن» / «من أين أبدأ؟» written on the new page |
| 5.3–6.0 | Who we are | the page lifts off the notebook and folds in half |
| 6.0–7.55 | Who we are | it becomes a paper plane gliding across the desk; the camera follows it |
| 7.55 | Who we are | the plane dives into the silver laptop — the screen wakes on the platform home (university photo, trees swaying, leaves) |
| 7.9–11 | Who we are | caption «حاضنة الأعمال بجامعة الأمير عبد القادر للعلوم الإسلامية» (per-word mask reveal) |
| 11.2 | Pillars | a mentor badge pops out of the screen, lands → «المرافقة — مؤطرون يتابعونك خطوة بخطوة» |
| 12.8 | Pillars | a training booklet → «التكوين — دورات وورشات حضورية وأونلاين» |
| 14.4 | Pillars | a calculator + coins → «التوجيه نحو التمويل — نعرّفك بآليات التمويل المتاحة» |
| 16.0 | Pillars | a kraft folder → «القرار الوزاري 1275 — مسار «شهادة — مؤسسة ناشئة»» |
| 17.0 | Pillars | a rubber stamp slams «شهادة — مؤسسة ناشئة» onto the folder |
| 18.0–19.0 | Journey | camera rises to an overhead flat-lay of the desk |
| 19.2 | Journey | an ink path starts drawing itself across the paper |
| 19.8–21.9 | Journey | station 1 lights: «1. سجّل وعرّف بمشروعك» — the registration card fills itself, ✓ |
| 22.2–23.4 | Journey | station 2: «2. تابع الدورات والأحداث» — the calendar flips its pages, the course ticket gets «✓ مسجّل» |
| 24.6–25.4 | Journey | whip pan; the phone flips from its back to its screen |
| 25.3–27 | Journey | the prototype app boots on the phone: «3. حوّل فكرتك إلى نموذج أولي» |
| 27.0–28.2 | Growth | camera tilts back up; a card pops up from the paper like a pop-up book: «من فكرة إلى مؤسسة» |
| 28.2 / 28.8 / 29.4 | Growth | bars grow one per beat: فكرة → نموذج أولي → مؤسسة ناشئة, the trend line draws |
| 31.2–31.8 | Growth | the card folds back flat |
| 32.2–33.1 | Reveal | white light flare sweeps the frame |
| 32.5–34.6 | Reveal | «ح» badge + «حاضنة الأعمال» in olive, gold rule, «جامعة الأمير عبد القادر للعلوم الإسلامية — قسنطينة» |
| 34.2–35.5 | CTA | gold pill «سجّل الآن على المنصة», URL types itself: incubator-platform-beryl.vercel.app |
| 35.4–38 | CTA | shine sweeps the pill, slow push-in, end |

No statistics, partner names, faces or student data are shown (the registration card shows initials «أ. ب.»).

## Render

```bash
node render.js stills stills 3.62 9.6 17.25 23.9 36.5
node render.js video chunks/c0.mp4 0 9.5 1     # ×4 chunks in parallel, then concat + mux audio
python3 make-audio.py out/soundtrack.wav
```

Rendering uses Chromium's SwiftShader GL (`--use-angle=swiftshader`): the default headless GPU path drops
some desk polygons in this many-plane 3D scene; SwiftShader composites every plane correctly.
