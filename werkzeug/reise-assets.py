"""Die Gegenstaende fuer die Reise — und der Bruch.

═══ Warum das Schiff hier zerschnitten wird und nicht im Browser ═══

Ein Gebaeck, das aufbricht, braucht eine BRUCHKANTE. Zwei Haelften, die an
einer geraden Linie getrennt sind, sehen aus wie zerschnitten — und
zerschnittenes Gebaeck ist etwas anderes als gebrochenes. Der Unterschied ist
die Kante: eine gebrochene laeuft unregelmaessig, mit kleinen Ausbruechen.

Im Browser ginge das nur ueber `clip-path` mit einer handgeschriebenen
Polygonkette, die bei jeder Bildgroesse anders aussieht. Hier entsteht sie
einmal, im Bild, mit dem Alphakanal — und ist damit auf jeder Groesse dieselbe.

Die Kante wird aus einer gedaempften Zufallsfolge gebaut: jeder Schritt haengt
vom vorigen ab. Reiner Zufall je Zeile ergaebe eine Saege, kein Bruch.
"""
import numpy as np
from PIL import Image
import os, json

AUS = 'public/bilder/reise'
os.makedirs(AUS, exist_ok=True)

def sichern(im, name, breite):
    k = im.copy()
    k.thumbnail((breite, breite * 3), Image.LANCZOS)
    p = f'{AUS}/{name}.webp'
    k.save(p, 'WEBP', quality=84, method=6)
    return p, k.size, os.path.getsize(p) // 1024

def zuschneiden(im):
    a = np.array(im)[:, :, 3] > 40
    ys, xs = np.where(a)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

def brechen(im, streuung=0.05, glaette=0.82):
    """Zwei Haelften mit gemeinsamer, unregelmaessiger Bruchkante."""
    w, h = im.size
    rng = np.random.default_rng(4711)          # fest, damit der Bruch reproduzierbar ist
    schritt = rng.normal(0, w * streuung * 0.35, h)
    kante = np.zeros(h); lauf = 0.0
    for y in range(h):
        lauf = glaette * lauf + (1 - glaette) * schritt[y] * 6
        kante[y] = w / 2 + lauf
    xs = np.arange(w)[None, :]
    links_maske = xs < kante[:, None]
    a = np.array(im)
    li = a.copy(); li[:, :, 3] = np.where(links_maske, li[:, :, 3], 0)
    re = a.copy(); re[:, :, 3] = np.where(~links_maske, re[:, :, 3], 0)
    return zuschneiden(Image.fromarray(li)), zuschneiden(Image.fromarray(re))

liste = {}
for name, quelle, breite in [
    ('scheibe', 'stueck-27-01.png', 620),
    ('fatayer', 'stueck-21-01.png', 700),
]:
    im = zuschneiden(Image.open('rohbilder/frei/' + quelle).convert('RGBA'))
    p, groesse, kb = sichern(im, name, breite)
    liste[name] = dict(breite=groesse[0], hoehe=groesse[1])
    print(f'  {name:16} {groesse[0]:>4}x{groesse[1]:<4} {kb:>3} kB   aus {quelle}')

schiff = zuschneiden(Image.open('rohbilder/frei/stueck-20-01.png').convert('RGBA'))
p, g, kb = sichern(schiff, 'schiff', 860)
liste['schiff'] = dict(breite=g[0], hoehe=g[1])
print(f'  {"schiff":16} {g[0]:>4}x{g[1]:<4} {kb:>3} kB   aus stueck-20-01.png')

li, re = brechen(schiff)
for teil, bild in (('schiff-links', li), ('schiff-rechts', re)):
    p, g, kb = sichern(bild, teil, 520)
    liste[teil] = dict(breite=g[0], hoehe=g[1])
    print(f'  {teil:16} {g[0]:>4}x{g[1]:<4} {kb:>3} kB')

# Probe: zusammen muessen die Haelften so viel Deckung haben wie das Ganze
gz = (np.array(schiff)[:, :, 3] > 40).sum()
hz = sum((np.array(b)[:, :, 3] > 40).sum() for b in (li, re))
print(f'\nDeckungsprobe: ganz {gz}, beide Hälften {hz} — Abweichung {abs(gz-hz)/gz*100:.2f} %')
json.dump(liste, open('inhalt/reise.json', 'w'), indent=1)
