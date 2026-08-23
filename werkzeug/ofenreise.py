"""Die Ofenreise: vier Teigstufen, ein gebackenes Schiff, zwei Haelften — auf EINER Leinwand.

═══ Warum alles auf dieselbe Leinwand muss ═══

Die Stufen werden im Browser uebereinandergelegt und ueberblendet. Haben sie
verschiedene Masse oder verschiedene Bildmitten, springt der Gegenstand bei
jedem Wechsel. Genau daran ist der erste Bau des Risses gescheitert: drei
Bilder mit drei Bezugsrahmen.

Hier bekommen deshalb ALLE Stufen dieselbe Leinwand, und jede wird darin so
skaliert, dass ihr Umriss dieselbe Breite hat wie das gebackene Schiff. Die
Teigkugel ist die Ausnahme — sie ist rund und wuerde auf Schiffsbreite gezogen
zu einem Pfannkuchen; sie bekommt einen eigenen Faktor.

═══ Quellen ═══

k15/k13/k14  erzeugt mit nano_banana_pro, MIT dem gebackenen Schiff als
             Referenz — deshalb stimmen Umriss, Blickwinkel und Licht ueberein.
schiff-b     die gebackene Stufe, schon vorher erzeugt.

Es bleibt erzeugtes Essen. Sobald die echten Aufnahmen aus ABLICHTUNG.md
kommen, werden hier Zeilen getauscht und sonst nichts.
"""
import numpy as np
from PIL import Image
import os, json

AUS = 'public/bilder/reise'
os.makedirs(AUS, exist_ok=True)

# Gemeinsame Leinwand. Breiter und hoeher als das Schiff selbst, damit die
# gewalzte Scheibe (flacher, aber breiter) und die Kugel hineinpassen.
LW, LH = 1200, 540
ZIEL = 1080          # Umrissbreite des Schiffs auf dieser Leinwand

def zuschneiden(im):
    a = np.array(im)[:, :, 3] > 40
    ys, xs = np.where(a)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

def setzen(im, zielbreite):
    """Auf Zielbreite skalieren und mittig auf die gemeinsame Leinwand legen."""
    k = zuschneiden(im)
    f = zielbreite / k.width
    k = k.resize((round(k.width * f), round(k.height * f)), Image.LANCZOS)
    leinwand = Image.new('RGBA', (LW, LH), (0, 0, 0, 0))
    leinwand.paste(k, ((LW - k.width) // 2, (LH - k.height) // 2), k)
    return leinwand

def sichern(im, name):
    p = f'{AUS}/{name}.webp'
    im.save(p, 'WEBP', quality=84, method=6)
    return os.path.getsize(p) // 1024

def brechen(im, streuung=0.05, glaette=0.82):
    """Zwei Haelften mit gemeinsamer, unregelmaessiger Bruchkante.

    Beide behalten die VOLLE Leinwand — siehe reise-assets.py, dort steht der
    Grund ausfuehrlich. Kurz: zugeschnittene Haelften haben eigene Bezugsrahmen
    und passen im Browser nicht zusammen.
    """
    w, h = im.size
    rng = np.random.default_rng(4711)
    schritt = rng.normal(0, w * streuung * 0.35, h)
    kante = np.zeros(h); lauf = 0.0
    for y in range(h):
        lauf = glaette * lauf + (1 - glaette) * schritt[y] * 6
        kante[y] = w / 2 + lauf
    xs = np.arange(w)[None, :]
    maske = xs < kante[:, None]
    a = np.array(im)
    li = a.copy(); li[:, :, 3] = np.where(maske, li[:, :, 3], 0)
    re = a.copy(); re[:, :, 3] = np.where(~maske, re[:, :, 3], 0)
    return Image.fromarray(li), Image.fromarray(re)

# Reihenfolge = Reihenfolge der Reise. Der Faktor sagt, wie breit die Stufe im
# Verhaeltnis zum fertigen Schiff steht — Teig wird beim Walzen breiter, nicht
# gleich breit.
STUFEN = [
    ('stufe-1-kugel',   'rohbilder/ofen/k15-frei.png',            0.46),
    ('stufe-2-gewalzt', 'rohbilder/ofen/k13-frei.png',            1.00),
    ('stufe-3-belegt',  'rohbilder/ofen/k14-frei.png',            0.98),
    ('schiff',          'rohbilder/frei/../erzeugt/schiff-b-frei.png', 0.98),
]

liste = {}
gebacken = None
for name, quelle, faktor in STUFEN:
    bild = setzen(Image.open(quelle).convert('RGBA'), round(ZIEL * faktor))
    kb = sichern(bild, name)
    liste[name] = dict(breite=LW, hoehe=LH)
    print(f'  {name:16} {LW}x{LH}  {kb:>3} kB   aus {os.path.basename(quelle)}')
    if name == 'schiff':
        gebacken = bild

li, re = brechen(gebacken)
for teil, bild in (('schiff-links', li), ('schiff-rechts', re)):
    kb = sichern(bild, teil)
    liste[teil] = dict(breite=LW, hoehe=LH)
    print(f'  {teil:16} {LW}x{LH}  {kb:>3} kB')

gz = (np.array(gebacken)[:, :, 3] > 40).sum()
hz = sum((np.array(b)[:, :, 3] > 40).sum() for b in (li, re))
print(f'\nDeckungsprobe: ganz {gz}, beide Hälften {hz} — Abweichung {abs(gz-hz)/gz*100:.2f} %')
json.dump(liste, open('inhalt/reise.json', 'w'), indent=1)
