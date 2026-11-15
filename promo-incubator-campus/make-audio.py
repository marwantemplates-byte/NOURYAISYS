"""Original soundtrack for the campus-model film (45.5 s).
Calm, inspiring 100 BPM bed (soft pads, felt-piano arpeggio, light brushed pulse) mixed low,
plus soft paper / card / coin / landing sounds synced to script.js.
Everything is synthesized here, so it is royalty-free by construction.
Usage: python3 make-audio.py out.wav"""
import sys, wave
import numpy as np

SR, DUR, BEAT = 48000, 45.5, 0.6          # 100 BPM
N = int(SR * DUR)
rng = np.random.default_rng(11)
music = np.zeros((2, N)); sfx = np.zeros((2, N))
mid = lambda m: 440 * 2 ** ((m - 69) / 12)


def add(buf, sig, t, pan=0.0, gain=1.0):
    i0 = int(round(t * SR))
    if i0 >= N: return
    if i0 < 0: sig, i0 = sig[-i0:], 0
    sig = sig[: N - i0]
    l, r = np.sqrt(.5 * (1 - pan)), np.sqrt(.5 * (1 + pan))
    buf[0, i0:i0 + len(sig)] += sig * gain * l
    buf[1, i0:i0 + len(sig)] += sig * gain * r


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def band(x, lo=0, hi=SR / 2):              # FFT band-pass (soft edges)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    g = np.ones_like(f)
    if lo > 0: g *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi < SR / 2: g *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * g, len(x))


def noise(d): return rng.normal(0, 1, int(d * SR))


def tone(f, d, a=.004, dec=.4, harm=(1, .35, .12, .05)):
    n = int(d * SR); t = np.arange(n) / SR
    return sum(h * np.sin(2 * np.pi * f * (k + 1) * t) for k, h in enumerate(harm)) * env(n, a, dec)


# ---------------- music bed: D – A – Bm – G, one chord per bar (2.4 s) ----------------
CH = [[50, 62, 66, 69, 74], [45, 61, 64, 69, 73], [47, 62, 66, 71, 74], [43, 62, 67, 71, 74]]
bars = int(DUR / (4 * BEAT)) + 1
for b in range(bars):
    t0 = b * 4 * BEAT; ch = CH[b % 4]
    if t0 > 41.5: break                           # the final chord takes over at the logo
    lvl = np.interp(t0, [0, 4, 9, 20, 30, 38, 41], [.45, .6, .8, .9, .95, 1.0, .9])
    n = int((4 * BEAT + 1.6) * SR); tt = np.arange(n) / SR
    sw = np.minimum(1, tt / 1.0) * np.clip((4 * BEAT + 1.6 - tt) / 1.4, 0, 1)
    for k, m in enumerate(ch[1:]):                # warm pad
        f = mid(m)
        s = (np.sin(2 * np.pi * f * tt) + .2 * np.sin(2 * np.pi * 2.003 * f * tt) + .06 * np.sin(2 * np.pi * 3 * f * tt)) * sw
        add(music, s, t0 - .2, pan=(-.5, -.17, .17, .5)[k], gain=.035 * lvl)
    if t0 >= 4.8:                                 # soft bass from the take-off
        nb = int(4 * BEAT * SR); tb = np.arange(nb) / SR
        add(music, np.sin(2 * np.pi * mid(ch[0] - 12) * tb) * np.minimum(1, tb / .05) * np.exp(-tb / 1.9), t0, gain=.12 * lvl)
    arp = [ch[1] + 12, ch[3] + 12, ch[2] + 12, ch[4] + 12, ch[3] + 12, ch[2] + 24, ch[4] + 12, ch[3] + 12]
    for i, m in enumerate(arp):                   # felt-piano arpeggio on 8ths
        if t0 + i * BEAT / 2 < 1.2: continue
        add(music, tone(mid(m), 1.3, .004, .38, (1, .25, .06)), t0 + i * BEAT / 2, pan=(-.3 if i % 2 else .3), gain=.04 * lvl)
# brushed pulse (very light) through the station tour
kn = int(.4 * SR); kt = np.arange(kn) / SR
kick = np.sin(2 * np.pi * (46 + 40 * np.exp(-kt / .03)) * kt) * np.exp(-kt / .11)
brush = band(noise(.12), 3000, 9000) * env(int(.12 * SR), .01, .04)
for i in range(int(DUR / BEAT)):
    t = i * BEAT
    if 9.0 <= t < 41.0:
        if i % 4 == 0: add(music, kick, t, gain=.18)
        add(music, brush, t + BEAT / 2, pan=.2, gain=.03)
# final chord swell under the logo
tt = np.arange(int(4.2 * SR)) / SR
sw = np.minimum(1, tt / .8) * np.exp(-np.maximum(0, tt - 1.6) / 1.6)
for k, m in enumerate([50, 57, 62, 66, 69, 74, 78]):
    add(music, (np.sin(2 * np.pi * mid(m) * tt) + .15 * np.sin(2 * np.pi * 2 * mid(m) * tt)) * sw, 42.4, pan=(k - 3) / 5, gain=.045)

# ---------------- sound design ----------------
def paper(d=.3, lo=1500):                     # page fold / card flap
    x = band(noise(d), lo, 9000); return x * env(len(x), .012, d / 4)
def whoosh(d, lo=200, hi=1200):
    x = band(noise(d), lo, hi) * 2.5; t = np.arange(len(x)) / SR
    return x * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
def tap(f=180):                               # soft wooden / card tap
    n = int(.25 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * (1 + .4 * np.exp(-t / .015)) * t) * np.exp(-t / .05) + .25 * band(noise(.25), 200, 1500) * np.exp(-t / .02)
def clink(f):                                 # small coin landing
    n = int(.5 * SR); t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d) for r, a, d in ((1, 1, .12), (2.76, .5, .07), (5.4, .3, .04)))
    return s * np.minimum(1, t / .0008)
def chime(ms, d=1.0): return sum(tone(mid(m), 2.4, .003, d, (1, .12, .04)) for m in ms) / len(ms)
def shimmer(d):
    t = np.arange(int(d * SR)) / SR
    return sum(np.sin(2 * np.pi * mid(m) * t) for m in (86, 90, 93, 98)) / 4 * np.minimum(1, t / (d * .6)) * np.exp(-np.maximum(0, t - d * .6) / .4)
def pencil(d):
    x = band(noise(d), 2000, 8000); t = np.arange(len(x)) / SR
    return x * (.6 + .4 * np.abs(np.sin(2 * np.pi * 7 * t))) * np.minimum(1, t / .05) * np.minimum(1, (d - t) / .1)

# 1. desk: the sheet folds itself, the plane takes off
add(sfx, paper(.45), 2.5, -.15, .16); add(sfx, paper(.4), 2.62, .15, .12)
add(sfx, paper(.5, 1000), 3.2, 0, .16)
add(sfx, paper(.35), 3.85, -.1, .12); add(sfx, paper(.35), 3.95, .1, .1)
add(sfx, whoosh(2.2, 150, 900), 4.3, 0, .10)
# 2. main building: the sign rises, the caption strip swings down
add(sfx, paper(.35, 900), 8.55, 0, .12); add(sfx, tap(160), 9.05, 0, .22)
add(sfx, paper(.3), 9.6, 0, .09); add(sfx, tap(260), 10.05, 0, .08)
# 3–4. stations
add(sfx, whoosh(2.0, 150, 700), 12.0, -.2, .05)
add(sfx, paper(.35, 900), 13.65, -.2, .12); add(sfx, tap(170), 14.15, -.2, .2)
add(sfx, whoosh(2.0, 150, 700), 16.6, .1, .05)
add(sfx, whoosh(1.3, 120, 500), 18.35, 0, .1); add(sfx, tap(120), 19.25, 0, .12)   # the roof lifts like a lid
add(sfx, paper(.35, 900), 19.2, .2, .12); add(sfx, tap(170), 19.7, .2, .18)
# 5. whip pan, coins, phone flip
add(sfx, whoosh(.95, 300, 2400), 21.8, -.3, .16)
add(sfx, paper(.35, 900), 22.85, -.2, .1); add(sfx, tap(170), 23.35, -.2, .16)
coin_t = 23.05; stacks = [3, 5, 7]; k = 0
for s_i, n in enumerate(stacks):
    for i in range(n):
        add(sfx, clink(2300 + 140 * ((k * 7) % 5)), coin_t + .34, (s_i - 1) * .3, .05); coin_t += .105; k += 1
add(sfx, whoosh(.9, 300, 1600), 24.45, .3, .1); add(sfx, tap(220), 25.45, .3, .18)
add(sfx, chime([81, 88], .8), 26.95, .2, .06); add(sfx, chime([83, 90], .8), 27.85, .2, .06)
# 6. overhead flat-lay: dotted path, station rings, tags; pop-up chart
add(sfx, whoosh(2.2, 120, 600), 28.75, 0, .06)
add(sfx, pencil(1.9), 30.75, 0, .05)
for i in range(5): add(sfx, tap(300 + 40 * i), 30.95 + i * .38, (i - 2) * .2, .05)
for i in range(4): add(sfx, paper(.25), 31.0 + i * .35, (i - 1.5) * .25, .06)
for i in range(3): add(sfx, paper(.4, 800), 33.55 + i * .28, (1 - i) * .3, .15); add(sfx, tap(150 + 30 * i), 33.95 + i * .28, (1 - i) * .3, .12)
add(sfx, paper(.5, 800), 37.0, 0, .14)
# 7. landing on the diploma, flare and logo
add(sfx, whoosh(1.6, 150, 800), 37.4, .2, .06)
add(sfx, paper(.25), 39.2, .1, .12); add(sfx, tap(200), 39.25, .1, .14)
add(sfx, paper(.35, 900), 39.35, 0, .1); add(sfx, tap(170), 39.85, 0, .14)
add(sfx, shimmer(1.6), 42.0, 0, .07)
add(sfx, chime([74, 78, 81, 86], 2.0), 42.85, 0, .12)
add(sfx, tap(240), 44.05, 0, .08)

mix = music * .5 + sfx
t = np.arange(N) / SR
mix *= np.minimum(1, t / .5) * np.clip((DUR - t) / 1.4, 0, 1)
mix /= np.max(np.abs(mix)) / .8
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype(np.int16).tobytes())
print('ok', sys.argv[1])
