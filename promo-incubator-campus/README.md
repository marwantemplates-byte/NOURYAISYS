# حاضنة الأعمال — campus-model introduction film (45.5 s, 16:9, 1920×1080, 60 fps)

Same engine as `promo-v3/film31.html` + `script31.js` + `render.js` (branch `claude/fervent-noether-5unrxn`):
one CSS-3D world with real perspective, one camera driven by keyframes (`CAM`), every pixel computed
inside `render(t)` (no CSS transitions, no timers), frame-exact Playwright render.

- `film.html` — stage, tilt-shift bands, label layer, flare and brand card.
- `script.js` — the architect's model (board, buildings, trees, figures, diploma, coins, phone, pop-up chart),
  the paper sheet that folds into a plane, the plane path, the camera keys and all animation.
- `render.js` — renderer: `node render.js stills <dir> t…` or `node render.js video <out.mp4> <start> <end>`.
- `make-audio.py` — original synthesized soundtrack (100 BPM bed + paper / coin / landing sounds), royalty-free by construction.
- `make-film.sh` — renders the chunks in parallel, adds the audio, writes the final MP4.
- `stills/` — one still per station.

Look: white card, balsa, cork paths, felt lawns, foam trees; warm sun from the left with long soft shadows baked
into the board; tilt-shift blur bands at the top and bottom of the frame (the label layer sits above them and is
never blurred); light grain. Brand colours (olive `#1f3d2b`, gold `#c9a24b`, from the platform's `app/globals.css`)
appear only in the final reveal. Fonts: Reem Kufi + Tajawal (platform), Cairo (numbers), Aref Ruqaa (the handwritten note).

Camera: moves between stations last 2.0–2.2 s with sine/cubic in-out easing (the whip pan is 0.9 s, motion blur
on the model layer only); each rest lasts ≥ 2.4 s with a very slow drift. Springs have one small overshoot.

## Beat map (100 BPM)

| time (s) | scene | camera | magic moment / text |
|---:|---|---|---|
| 0.0–2.5 | student's desk | slow push-in on the sheet | «عندي فكرة مشروع» readable 2.5 s |
| 2.5–4.4 | the sheet folds itself | gentle pull-back and rise | **fold**: corners → half → wings → paper plane |
| 4.4–9.0 | take-off | chase camera follows the plane over the desk edge and down onto the model (like the van) | — |
| 8.55–12.0 | main building | rest, slow drift | sign rises: «حاضنة الأعمال — جامعة الأمير عبد القادر للعلوم الإسلامية»; strip swings down: «من فكرة إلى مؤسسة» |
| 12.0–14.15 | → المرافقة | 2.1 s move | — |
| 13.65–16.65 | المرافقة pavilion | rest | tag «المرافقة / مؤطرون يتابعونك خطوة بخطوة»; two faceless figures at a table |
| 16.65–18.75 | → التكوين | 2.1 s move | — |
| 18.35–21.85 | التكوين hall | rest | **roof lifts like a lid** → rows of chairs and a board; tag «التكوين / دورات وورشات حضورية وأونلاين» |
| 21.85–22.75 | → التمويل | **gentle whip pan** 0.9 s | — |
| 22.75–24.0 | التمويل kiosk | rest | tag «التمويل»; coins stack up |
| 24.0–25.95 | phone | 1.95 s move down | **phone flips** from its back to its screen |
| 25.65–28.75 | phone screen | rest | «تمويل يصل إلى 80 مليون سنتيم… وحتى 200 مليون سنتيم», numbers count up |
| 28.75–30.95 | → overhead | 2.2 s crane up | — |
| 30.75–32.95 | overhead flat-lay | rest | the plane's path drawn as a dotted line through all stations; station tags |
| 32.95–35.0 | → pop-up chart | 2.05 s tilt down | **pop-up chart** rises: «فكرة ← نموذج أولي ← مؤسسة ناشئة» |
| 35.0–37.25 | chart | rest | read; folds back flat at 37.0 |
| 37.25–39.3 | → diploma | 2.05 s move | the plane lands on the rolled diploma |
| 39.35–41.65 | diploma | rest | tag «تخرّج بمشروعك: شهادة – مؤسسة ناشئة» |
| 41.65–44.2 | pull-up | 2.55 s slow crane | **soft light flare** |
| 42.85–45.5 | brand | hold | «حاضنة الأعمال» (olive + gold), «جامعة الأمير عبد القادر للعلوم الإسلامية — قسنطينة», pill «سجّل الآن على المنصة» |

## Rebuild

```bash
cd promo-incubator-campus
./make-film.sh            # → out/incubator-campus-45s-1080p60.mp4
```
Requires Node + Playwright (Chromium), ffmpeg, Python 3 + NumPy.
