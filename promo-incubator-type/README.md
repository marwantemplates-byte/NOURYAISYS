# حاضنة الأعمال — kinetic typography in 3D (35 s, 16:9, 1920×1080, 60 fps)

Same engine as `promo-v3/film31.html` + `script31.js` + `render.js` (branch `claude/fervent-noether-5unrxn`):
one CSS-3D world, one keyframed camera (`CAM`, monotone Hermite), every frame computed in `render(t)`.
The sentences and stickers never move once placed — the camera travels between them (dolly / truck / slight tilt),
so they drift past with real parallax. ±2 px slow handheld drift, light film grain, soft daylight, gentle depth of field
(far sentences slightly soft, the current one always sharp).

- Texts: exactly the brief. Fonts: Cairo (sentences), Tajawal, Reem Kufi (logo) — from the platform.
- Accents during the story: muted olive `#2F4A37` and warm gold `#8A6A24`. Full brand green `#1f3d2b` + gold `#c9a24b`
  (from `app/globals.css`) only on the final logo.
- Stickers: hand-made SVG (bulb, the university's mosque silhouette, handshake, notebook & pen, businessman silhouette,
  banknotes & coins, graduation cap on a diploma), matte paper style: white cut border + soft shadow, tilted 6–8°.

## Beat map (100 BPM, 1 beat = 0.6 s)

| time | kind | what happens |
|---:|---|---|
| 0.25–1.4 | MAGIC | «عندك فكرة مشروع؟» — the words slide in on depth and lock in place |
| 1.2 | MAGIC | the lightbulb sticker drops (one small overshoot, shadow tightens) |
| 0–3.4 | REAL | slow push-in, sentence readable ≥ 3 s |
| 3.4–4.6 | REAL | dolly + truck right to sentence 2 (parallax) |
| 4.5–5.3 | REAL | «حاضنة الأعمال… / معك من الفكرة إلى المؤسسة» — word-by-word mask reveal; university sticker lands at 5.4 |
| 8.6–9.4 | MAGIC | light whip pan to the left (background softens, the sentence it lands on stays sharp) |
| 9.3–12.6 | REAL | «المرافقة والمتابعة / خطوة بخطوة» + handshake sticker (10.2) |
| 12.6–13.8 | REAL | dolly right |
| 13.7–16.8 | REAL | «تكوين وورشات / في ريادة الأعمال» + notebook & pen (14.4) |
| 16.8–17.8 | REAL | dolly left |
| 17.7–18.9 | MAGIC | «من طالب… / إلى مقاول» assembles from depth; businessman silhouette lands (18.6) and walks a few steps |
| 21.0–22.2 | REAL | dolly right |
| 22.1–26.0 | MAGIC | «تمويل يصل إلى 80 مليون سنتيم… / وحتى 200 مليون سنتيم» — the numbers count up (22.8 / 23.3); money sticker (23.4) |
| 26.0–27.0 | REAL | dolly left |
| 26.9–30.0 | REAL | «تتخرج بمشروعك: / شهادة – مؤسسة ناشئة» + graduation cap on a diploma (27.6) |
| 30.0–31.7 | REAL | the camera rises and pulls back: all seven sentences and stickers together in one world |
| 31.7–32.8 | MAGIC | soft light sweep; the world dissolves into light |
| 32.1–33.2 | — | «حاضنة الأعمال» + «ح» badge in brand green, gold rule |
| 32.9 | — | «جامعة الأمير عبد القادر للعلوم الإسلامية — قسنطينة» |
| 33.6–35 | — | gold pill «سجّل الآن على المنصة» (one small overshoot), shine, end |

## Render

```bash
node render.js stills stills 2.6 20.2 25.0 31.4
node render.js video chunks/c0.mp4 0 8.75 1      # ×4 chunks in parallel → concat + mux
python3 make-audio.py out/soundtrack.wav
```

Rendering uses Chromium's SwiftShader GL (`--use-angle=swiftshader`). Lessons kept in the code:
each word is its own plane (inline 3D words are not composited reliably), word planes get a 1.5 px depth offset
(coplanar overlapping planes get dropped), and there is no floor geometry (large floor planes exhaust the
compositor's tile budget and make words disappear) — the room is the warm background gradient + contact shadows.
