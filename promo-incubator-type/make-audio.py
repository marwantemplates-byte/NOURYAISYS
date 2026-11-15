"""Original soundtrack (35 s): calm, inspiring 100 BPM bed + very soft paper taps on sticker landings and ticks
on the funding numbers. Fully synthesized here (royalty-free by construction). Usage: python3 make-audio.py out.wav"""
import sys, wave
import numpy as np

SR, DUR, BEAT = 48000, 35.0, 0.6
N = int(SR * DUR)
rng = np.random.default_rng(11)
music = np.zeros((2, N)); sfx = np.zeros((2, N))
mid = lambda m: 440 * 2 ** ((m - 69) / 12)


def add(buf, sig, t, pan=0.0, gain=1.0):
    i0 = int(round(t * SR))
    if i0 >= N: return
    if i0 < 0: sig = sig[-i0:]; i0 = 0
    sig = sig[: N - i0]
    l, r = np.sqrt(.5 * (1 - pan)), np.sqrt(.5 * (1 + pan))
    buf[0, i0:i0 + len(sig)] += sig * gain * l
    buf[1, i0:i0 + len(sig)] += sig * gain * r


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y


def tone(f, d, a=.004, dec=.45, harm=(1, .3, .1, .04)):
    n = int(d * SR); t = np.arange(n) / SR
    return sum(h * np.sin(2 * np.pi * f * (k + 1) * t) for k, h in enumerate(harm)) * env(n, a, dec)


# ---------------- music: I – V – vi – IV in G major, one chord per bar ----------------
CH = [[43, 59, 62, 67, 71], [50, 57, 62, 66, 69], [52, 59, 64, 67, 71], [48, 55, 60, 64, 67]]
bar = 4 * BEAT
for b in range(int(DUR / bar) + 1):
    t0 = b * bar; ch = CH[b % 4]
    lvl = np.interp(t0, [0, 4, 12, 26, 30, 32, 35], [.55, .75, .9, 1.0, .8, 1.1, .9])
    n = int((bar + 1.4) * SR); tt = np.arange(n) / SR
    sw = np.minimum(1, tt / .9) * np.clip((bar + 1.4 - tt) / 1.2, 0, 1)
    for k, m in enumerate(ch[1:]):
        f = mid(m)
        s = (np.sin(2 * np.pi * f * tt) + .2 * np.sin(2 * np.pi * 2.003 * f * tt) + .06 * np.sin(2 * np.pi * 3 * f * tt)) * sw
        add(music, s, t0 - .2, pan=(-.5, -.17, .17, .5)[k], gain=.038 * lvl)
    nb = int(bar * SR); tb = np.arange(nb) / SR
    add(music, np.sin(2 * np.pi * mid(ch[0] - 12) * tb) * np.minimum(1, tb / .04) * np.exp(-tb / 1.9), t0, gain=.13 * lvl)
    arp = [ch[2] + 12, ch[3] + 12, ch[4] + 12, ch[3] + 12, ch[2] + 24, ch[4] + 12, ch[3] + 12, ch[1] + 24]
    for i, m in enumerate(arp):
        add(music, tone(mid(m), 1.3, .003, .38), t0 + i * BEAT / 2, pan=(-.3 if i % 2 else .3), gain=.042 * lvl)
kn = int(.4 * SR); kt = np.arange(kn) / SR
kick = np.sin(2 * np.pi * (48 + 55 * np.exp(-kt / .03)) * kt) * np.exp(-kt / .12)
for i in range(int(DUR / BEAT)):
    t = i * BEAT
    if 4.8 <= t < 30.0 and i % 2 == 0: add(music, kick, t, gain=.2)

# ---------------- very soft sound design ----------------
def tap():                          # paper sticker landing
    n = int(.12 * SR); x = rng.normal(0, 1, n); x = x - lp(x, 1500)
    t = np.arange(n) / SR
    return x * np.exp(-t / .018) * .6 + np.sin(2 * np.pi * 180 * t) * np.exp(-t / .03) * .5
def tick(f=2400):
    return tone(f, .05, .0005, .012, (1,))
def whoosh(d, fc=900):
    x = lp(rng.normal(0, 1, int(d * SR)), fc) * 3; t = np.arange(len(x)) / SR
    return x * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
def chime(ms, d=1.0): return sum(tone(mid(m), 2.0, .002, d, (1, .15, .05)) for m in ms) / len(ms)
def shimmer(d):
    t = np.arange(int(d * SR)) / SR
    return sum(np.sin(2 * np.pi * mid(m) * t) for m in (83, 86, 91, 95)) / 4 * np.minimum(1, t / (d * .6)) * np.exp(-np.maximum(0, t - d * .6) / .4)

DROPS = [1.2, 5.4, 10.2, 14.4, 18.6, 23.4, 27.6]          # sticker drop starts (contact at +0.375 s)
for i, d in enumerate(DROPS): add(sfx, tap(), d + .375, (-.3, .3)[i % 2], .16)
for t0 in (3.6, 12.8, 17.0, 21.2, 26.2): add(sfx, whoosh(1.0, 500), t0, 0, .05)       # gentle dolly air
add(sfx, whoosh(.8, 1400), 8.6, -.2, .14)                                            # whip pan
for t0, n, dur in ((22.8, 80, 1.3), (23.3, 200, 1.5)):                               # number ticks, slowing down
    ks = sorted(set(int(round(n * (1 - 2 ** (-10 * u)))) for u in np.linspace(0, 1, 120)))
    for v in ks[1::max(1, len(ks) // 14)]:
        u = -np.log2(max(1e-6, 1 - v / n)) / 10 if v < n else 1
        add(sfx, tick(2600 if n == 80 else 2200), t0 + u * dur, .2, .035)
add(sfx, whoosh(1.4, 450), 30.0, 0, .08)                                             # pull-back
add(sfx, shimmer(1.2), 31.6, 0, .08)                                                 # light sweep
add(sfx, chime([55, 62, 67, 71, 74], 2.4), 32.1, 0, .2)                              # logo
add(sfx, tap(), 33.85, 0, .12)                                                       # pill lands

mix = music * .5 + sfx
t = np.arange(N) / SR
mix *= np.minimum(1, t / .5) * np.clip((DUR - t) / 1.5, 0, 1)
mix /= np.max(np.abs(mix)) / .8
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype(np.int16).tobytes())
print('ok', sys.argv[1])
