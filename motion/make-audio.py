"""Synthesize the film soundtrack (original, royalty-free): calm 102.86 BPM track + UI sounds on every beat event.
The track is exactly 35 s and wraps around (tails are added circularly), so the film loops seamlessly.
Usage: python3 make-audio.py audio-events.json out.wav"""
import json, sys, wave
import numpy as np

SR = 48000
DUR = 35.0
N = int(SR * DUR)
BEAT = 7 / 12
rng = np.random.default_rng(3)
ev = json.load(open(sys.argv[1]))
T, C = ev["T"], ev["C"]

music = np.zeros((2, N))
ui = np.zeros((2, N))


def add(buf, sig, t, pan=0.0, gain=1.0):
    """Add mono `sig` at time t, wrapping past the end (loop-safe)."""
    i0 = int(round(t * SR)) % N
    idx = (np.arange(len(sig)) + i0) % N
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    np.add.at(buf[0], idx, sig * gain * l)
    np.add.at(buf[1], idx, sig * gain * r)


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def tone(f, dur, a=0.005, d=0.3, harm=(1, .3, .1)):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(h * np.sin(2 * np.pi * f * (k + 1) * t) for k, h in enumerate(harm))
    return s * env(n, a, d)


def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)):
        acc = (1 - a) * x[i] + a * acc; y[i] = acc
    return y


mid = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------------- music ----------------
# 15 bars of 4 beats; 5-chord cycle ×3 (D major, warm & academic)
CH = [[50, 57, 61, 64, 66], [47, 54, 57, 62, 66], [43, 50, 54, 59, 62], [40, 47, 50, 55, 59], [45, 52, 55, 59, 62]]
bar = 4 * BEAT
for b in range(15):
    ch = CH[b % 5]; t0 = b * bar
    # pad: soft additive tones, slow swell, overlap into next bar
    n = int((bar + 1.2) * SR); tt = np.arange(n) / SR
    sw = np.minimum(1, tt / 0.8) * np.minimum(1, np.maximum(0, (bar + 1.2 - tt)) / 1.0)
    for k, m in enumerate(ch[1:]):
        f = mid(m + 12 if k > 1 else m)
        s = (np.sin(2 * np.pi * f * tt) + .25 * np.sin(2 * np.pi * 2.003 * f * tt) + .08 * np.sin(2 * np.pi * 3 * f * tt)) * sw
        add(music, s, t0 - .15, pan=(-.5, -.15, .15, .5)[k], gain=.045)
    # sub bass on the root
    n = int(bar * SR); tt = np.arange(n) / SR
    bass = np.sin(2 * np.pi * mid(ch[0] - 12) * tt) * np.minimum(1, tt / .05) * np.exp(-tt / 1.6)
    add(music, bass, t0, gain=.16)
    # pluck arpeggio on 8ths (gentle, panned)
    arp = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[4] + 12, ch[3] + 12, ch[2] + 12, ch[4] + 12, ch[1] + 24]
    for i, m in enumerate(arp):
        if b == 0 and i < 2: pass
        add(music, tone(mid(m), .9, .003, .22, (1, .35, .12, .05)), t0 + i * BEAT / 2, pan=(-.35 if i % 2 else .35), gain=.05)
# soft kick on 1 & 3, shaker on off-beats
kn = int(.35 * SR); kt = np.arange(kn) / SR
kick = np.sin(2 * np.pi * (50 + 70 * np.exp(-kt / .03)) * kt) * np.exp(-kt / .11)
shak = rng.normal(0, 1, int(.06 * SR)); shak = (shak - lowpass(shak, 5000)) * env(len(shak), .002, .02)
for i in range(60):
    if i % 2 == 0: add(music, kick, i * BEAT, gain=.32)
    add(music, shak, i * BEAT + BEAT / 2, pan=.25, gain=.07)

# ---------------- UI sounds ----------------
def tap(f=1500):  # soft wooden touch
    n = int(.12 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) * np.exp(-t / .018) + .6 * np.sin(2 * np.pi * 180 * t) * np.exp(-t / .03))

def click():
    n = int(.05 * SR); nz = rng.normal(0, 1, n) * env(n, .0005, .006)
    return nz * .6 + tap(2400)[:n] * .7

def chime(notes, d=.9):
    return sum(tone(mid(m), 1.6, .002, d, (1, .15, .05)) for m in notes) / len(notes)

def whoosh(dur):
    n = int(dur * SR); x = rng.normal(0, 1, n); t = np.arange(n) / SR
    x = lowpass(x, 900) * 3
    return x * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2

add(ui, click(), T["click"], gain=.55)
for i, (t, dep) in enumerate(C):
    add(ui, tap(1300 + 120 * (i % 5)), t, pan=((i % 3) - 1) * .2, gain=.32)
for a, b in [(T["leafOff"], T["name"]), (C[9][1], T["tile1"]), (C[20][1], T["navItems"]), (T["pull"], T["merge"])]:
    add(ui, whoosh(b - a), a, gain=.09)
add(ui, chime([81, 88]), T["check"], gain=.22)          # welcome
add(ui, chime([79, 86]), T["rsvp"] + .05, gain=.2)      # RSVP confirmed
add(ui, chime([86, 91], .5), T["mail"], gain=.12)       # email received
add(ui, chime([81, 85, 88]), T["publish"] + .03, gain=.18)
add(ui, chime([86]), T["newCard"], gain=.12)
for k in range(4): add(ui, tap(2000), T["att"][k] + .04, gain=.16)
for k, tt in enumerate(["tile1", "tile2", "tile3", "tile4"]):
    for j in range(6): add(ui, tap(2600 + 200 * j), T[tt] + j * .08, gain=.05)
add(ui, chime([74, 81]), T["send"] + .05, gain=.16)
for j in range(16): add(ui, whoosh(.35), T["burst"] + .34 + abs(j - 7.5) * .03, pan=(j - 7.5) / 9, gain=.03)
add(ui, chime([81, 86, 90], 1.2), T["burst"] + 1.6, gain=.15)
for k in ["card1", "card2", "card3"]: add(ui, tap(900), T[k], gain=.18)

mix = music * 0.55 + ui
mix /= np.max(np.abs(mix)) / 0.8
pcm = (mix.T * 32767).astype(np.int16)
with wave.open(sys.argv[2], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", sys.argv[2])
