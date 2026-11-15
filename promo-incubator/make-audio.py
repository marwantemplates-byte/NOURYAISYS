"""Original soundtrack for the incubator film (38 s): calm, inspiring 100 BPM bed + a sound on every landing.
Everything is synthesized here (royalty-free by construction). Usage: python3 make-audio.py out.wav"""
import sys, wave
import numpy as np

SR, DUR, BEAT = 48000, 38.0, 0.6
N = int(SR * DUR)
rng = np.random.default_rng(7)
music = np.zeros((2, N)); sfx = np.zeros((2, N))
mid = lambda m: 440 * 2 ** ((m - 69) / 12)


def add(buf, sig, t, pan=0.0, gain=1.0):
    i0 = int(round(t * SR))
    if i0 >= N: return
    sig = sig[: N - i0] if i0 >= 0 else sig[-i0:]
    i0 = max(i0, 0)
    l, r = np.sqrt(.5 * (1 - pan)), np.sqrt(.5 * (1 + pan))
    buf[0, i0:i0 + len(sig)] += sig * gain * l
    buf[1, i0:i0 + len(sig)] += sig * gain * r


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def lp(x, fc):                      # one-pole low-pass (vectorised via lfilter-like recursion in chunks)
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); acc = 0.0
    for i in range(len(x)): acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y


def noise(d): return rng.normal(0, 1, int(d * SR))


def tone(f, d, a=.004, dec=.4, harm=(1, .35, .12, .05)):
    n = int(d * SR); t = np.arange(n) / SR
    return sum(h * np.sin(2 * np.pi * f * (k + 1) * t) for k, h in enumerate(harm)) * env(n, a, dec)


# ---------------- music bed ----------------
# I – vi – IV – V in D major, one chord per bar (4 beats = 2.4 s)
CH = [[50, 62, 66, 69, 73], [47, 59, 62, 66, 69], [43, 59, 62, 67, 71], [45, 57, 61, 64, 69]]
bars = int(DUR / (4 * BEAT)) + 1
for b in range(bars):
    t0 = b * 4 * BEAT; ch = CH[b % 4]
    lvl = np.interp(t0, [0, 5, 7.6, 18, 32, 34, 38], [.35, .5, .8, .9, 1.0, 1.15, .8])
    n = int((4 * BEAT + 1.4) * SR); tt = np.arange(n) / SR
    sw = np.minimum(1, tt / .9) * np.clip((4 * BEAT + 1.4 - tt) / 1.2, 0, 1)
    for k, m in enumerate(ch[1:]):       # warm pad
        f = mid(m)
        s = (np.sin(2 * np.pi * f * tt) + .22 * np.sin(2 * np.pi * 2.004 * f * tt) + .07 * np.sin(2 * np.pi * 3 * f * tt)) * sw
        add(music, s, t0 - .2, pan=(-.5, -.17, .17, .5)[k], gain=.04 * lvl)
    if t0 >= 7.0:                        # bass enters with the platform
        nb = int(4 * BEAT * SR); tb = np.arange(nb) / SR
        add(music, np.sin(2 * np.pi * mid(ch[0] - 12) * tb) * np.minimum(1, tb / .04) * np.exp(-tb / 1.8), t0, gain=.15 * lvl)
    arp = [ch[1] + 12, ch[3] + 12, ch[2] + 12, ch[4] + 12, ch[3] + 12, ch[2] + 24, ch[4] + 12, ch[3] + 12]
    for i, m in enumerate(arp):          # gentle piano-like arpeggio on 8ths
        add(music, tone(mid(m), 1.2, .003, .35), t0 + i * BEAT / 2, pan=(-.3 if i % 2 else .3), gain=.045 * lvl)
# soft kick + shaker from the platform onwards, out before the logo
kn = int(.4 * SR); kt = np.arange(kn) / SR
kick = np.sin(2 * np.pi * (48 + 60 * np.exp(-kt / .03)) * kt) * np.exp(-kt / .12)
sh = noise(.07); sh = (sh - lp(sh, 4500)) * env(len(sh), .002, .02)
for i in range(int(DUR / BEAT)):
    t = i * BEAT
    if 7.6 <= t < 32.0:
        if i % 2 == 0: add(music, kick, t, gain=.28)
        add(music, sh, t + BEAT / 2, pan=.25, gain=.06)

# ---------------- sound design ----------------
def scratch(d):                     # pencil on paper
    x = noise(d); x = x - lp(x, 2500); t = np.arange(len(x)) / SR
    return x * (.55 + .45 * np.abs(np.sin(2 * np.pi * 9 * t))) * np.minimum(1, t / .03) * np.minimum(1, (d - t) / .05)
def whoosh(d, fc=900):
    x = lp(noise(d), fc) * 3; t = np.arange(len(x)) / SR
    return x * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2
def paper(d=.35):                   # page flick / fold
    x = noise(d); x = x - lp(x, 1800); return x * env(len(x), .01, d / 4)
def pop(f=520):
    n = int(.25 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * (1 + .6 * np.exp(-t / .02)) * t) * np.exp(-t / .07)
def thud():
    n = int(.3 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (90 + 60 * np.exp(-t / .02)) * t) * np.exp(-t / .07) + .3 * lp(noise(.3), 600) * np.exp(-t / .03)
def click():
    n = int(.06 * SR); return noise(.06) * env(n, .0005, .006) * .6 + tone(2600, .06, .0005, .01) * .5
def chime(ms, d=.9): return sum(tone(mid(m), 1.8, .002, d, (1, .15, .05)) for m in ms) / len(ms)
def shimmer(d):
    t = np.arange(int(d * SR)) / SR
    return sum(np.sin(2 * np.pi * mid(m) * t) for m in (86, 90, 93, 98)) / 4 * np.minimum(1, t / (d * .6)) * np.exp(-np.maximum(0, t - d * .6) / .4)

# hook
add(sfx, shimmer(2.2), 0.0, gain=.05)
add(sfx, scratch(1.6), .6, -.2, .05); add(sfx, scratch(.3), 2.25, -.2, .04); add(sfx, scratch(1.0), 2.55, -.2, .05)
add(sfx, paper(.5), 3.7, .1, .16); add(sfx, scratch(.35), 4.45, -.2, .05); add(sfx, scratch(.55), 4.85, -.2, .05)
# fold → plane → screen
add(sfx, paper(.3), 5.3, 0, .14); add(sfx, paper(.25), 5.65, .1, .12)
add(sfx, whoosh(1.55, 700), 6.0, 0, .12)
add(sfx, click(), 7.55, 0, .3); add(sfx, chime([81, 88]), 7.6, 0, .14)
# pillars: launch pop + landing thud, stamp
for t0 in (11.2, 12.8, 14.4, 16.0):
    add(sfx, pop(620), t0, 0, .16); add(sfx, thud(), t0 + .75, 0, .35); add(sfx, paper(.2), t0 + .76, 0, .08)
add(sfx, thud(), 17.0, -.2, .6); add(sfx, click(), 17.0, -.2, .25)
# flat-lay journey
add(sfx, whoosh(1.0, 600), 18.0, 0, .1)
add(sfx, pop(700), 19.8, .3, .16)
for k in range(28): add(sfx, click(), 20.05 + k * .062, .3, .06)
add(sfx, click(), 21.75, .3, .25); add(sfx, chime([81, 85]), 21.85, .3, .13)
add(sfx, pop(700), 22.2, 0, .16)
for k in range(3): add(sfx, paper(.22), 22.45 + k * .3, 0, .14)
add(sfx, chime([79, 86]), 23.4, 0, .13)
add(sfx, whoosh(.55, 1500), 24.45, -.3, .2); add(sfx, click(), 25.15, -.3, .3); add(sfx, shimmer(.8), 25.3, -.3, .05)
# growth chart
add(sfx, whoosh(1.0, 600), 27.0, 0, .08); add(sfx, paper(.45), 27.6, 0, .16)
for k, m in enumerate((74, 78, 81)): add(sfx, tone(mid(m), .8, .003, .25), 28.2 + k * BEAT, 0, .09)
add(sfx, paper(.4), 31.2, 0, .14)
# flare + logo
add(sfx, shimmer(1.2), 31.6, 0, .1)
add(sfx, chime([62, 69, 74, 78, 81], 2.2), 32.5, 0, .2)
add(sfx, pop(560), 34.2, 0, .14)
for k in range(18): add(sfx, click(), 34.6 + k * .05, 0, .04)

mix = music * .55 + sfx
t = np.arange(N) / SR
mix *= np.minimum(1, t / .4) * np.clip((DUR - t) / 1.6, 0, 1)
mix /= np.max(np.abs(mix)) / .82
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype(np.int16).tobytes())
print('ok', sys.argv[1])
