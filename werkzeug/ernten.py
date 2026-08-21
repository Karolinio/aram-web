"""Einzelne Gegenstaende aus einem Freisteller herausloesen.

═══ Warum das der eigentliche Hebel ist ═══

Die Fotos zeigen fast nie EIN Gebaeck. Sie zeigen ein Blech voll, eine Platte,
eine Reihe. Als ganzes Motiv ist so ein Bild fuer eine Flugbahn unbrauchbar —
aber die einzelnen Stuecke DARIN sind genau das, was gebraucht wird.

Ein zusammenhaengendes Gebiet im Alphakanal ist ein Gegenstand. Wer sie zaehlt
und einzeln ausschneidet, verwandelt ein unbrauchbares Gruppenfoto in acht
brauchbare Freisteller.

Geerntet wird nur, was drei Bedingungen erfuellt: gross genug, um nicht Krümel
zu sein; nicht am Bildrand, sonst ist es angeschnitten; und kompakt genug, dass
es ein Gegenstand ist und nicht ein Schatten, der zwei verbindet.
"""
import sys, glob
import numpy as np
from PIL import Image
from scipy import ndimage

MIN_ANTEIL = 0.008   # kleiner ist Krümel
RAND = 3             # Pixel Abstand, den ein Stück zum Bildrand halten muss

for f in sorted(glob.glob('rohbilder/frei/[0-9][0-9].png')):
    nr = f.split('/')[-1][:2]
    if sys.argv[1:] and nr not in sys.argv[1:]: continue
    bild = Image.open(f).convert('RGBA')
    a = np.array(bild)[:, :, 3] > 48
    h, w = a.shape
    # Schliessen, damit ein Stück nicht an einer dunklen Naht zerfällt
    a = ndimage.binary_closing(a, structure=np.ones((7, 7)))
    marken, n = ndimage.label(a)
    print(f'\n── Bild {nr}: {n} zusammenhängende Gebiete')
    behalten = 0
    for i in range(1, n + 1):
        maske = marken == i
        anteil = maske.sum() / (h * w)
        if anteil < MIN_ANTEIL: continue
        ys, xs = np.where(maske)
        y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
        if y0 < RAND or x0 < RAND or y1 > h - 1 - RAND or x1 > w - 1 - RAND:
            print(f'   Gebiet {i}: {anteil*100:>5.1f} %  am Rand — verworfen')
            continue
        bh, bw = y1 - y0 + 1, x1 - x0 + 1
        # Fülle: wie viel des umschliessenden Rechtecks ist wirklich Motiv.
        # Unter 0,35 ist es meist ein Schatten oder eine Kette aus Krümeln.
        fuelle = maske.sum() / (bh * bw)
        if fuelle < 0.35:
            print(f'   Gebiet {i}: {anteil*100:>5.1f} %  zu locker ({fuelle:.2f}) — verworfen')
            continue
        stueck = np.array(bild).copy()
        stueck[:, :, 3] = np.where(maske, stueck[:, :, 3], 0)
        aus = Image.fromarray(stueck).crop((x0, y0, x1 + 1, y1 + 1))
        name = f'rohbilder/frei/stueck-{nr}-{i:02d}.png'
        aus.save(name)
        behalten += 1
        print(f'   Gebiet {i}: {anteil*100:>5.1f} %  {bw}x{bh}  Seitenverhältnis {bw/bh:.2f}  Fülle {fuelle:.2f}  -> {name.split("/")[-1]}')
    print(f'   geerntet: {behalten}')
