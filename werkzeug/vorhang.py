"""Der Manakisch-Vorhang: eine Scheibe, zwei Haelften, ein gemeinsamer Rahmen.

═══ Warum der Bruch hier ANDERS laeuft als beim Kaeseschiff ═══

Beim Schiff reisst es: die Kante laeuft unregelmaessig, mit Ausbruechen, und
zwischen den Haelften stehen Kaesefaeden. Das ist ein Gebaeck, das aufbricht.

Hier geht ein VORHANG auf. Die beiden Haelften fahren zur Seite aus dem Bild und
geben den Blick frei — das ist eine andere Bewegung mit einer anderen Aussage,
und sie braucht deshalb auch eine andere Kante: ruhiger, gerader, mit weniger
Streuung. Eine zerfranste Kante an einem Vorhang liest sich als Zufall.

Zwei Effekte, die gleich aussehen, sind eine Wiederholung. Zwei, die sich
unterscheiden, sind zwei Effekte.
"""
import numpy as np
from PIL import Image
import os, json

QUELLE = 'public/bilder/erzeugt/lahmacun.webp'
AUS = 'public/bilder/vorhang'
os.makedirs(AUS, exist_ok=True)


def zuschneiden(im):
    a = np.array(im)[:, :, 3] > 40
    ys, xs = np.where(a)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def brechen(im, streuung=0.018, glaette=0.9):
    """Zwei Haelften auf der VOLLEN Leinwand — sonst passen sie im Browser nicht.

    `streuung` ist ein Drittel des Werts vom Kaeseschiff: der Vorhang soll
    aufgehen, nicht zerreissen.
    """
    w, h = im.size
    rng = np.random.default_rng(8123)
    schritt = rng.normal(0, w * streuung * 0.35, h)
    kante = np.zeros(h)
    lauf = 0.0
    for y in range(h):
        lauf = glaette * lauf + (1 - glaette) * schritt[y] * 6
        kante[y] = w / 2 + lauf
    xs = np.arange(w)[None, :]
    maske = xs < kante[:, None]
    a = np.array(im)
    li = a.copy(); li[:, :, 3] = np.where(maske, li[:, :, 3], 0)
    re = a.copy(); re[:, :, 3] = np.where(~maske, re[:, :, 3], 0)
    return Image.fromarray(li), Image.fromarray(re)


scheibe = zuschneiden(Image.open(QUELLE).convert('RGBA'))
scheibe.thumbnail((1200, 1200), Image.LANCZOS)
liste = {}

for name, bild in (('scheibe', scheibe), *zip(('scheibe-links', 'scheibe-rechts'), brechen(scheibe))):
    p = f'{AUS}/{name}.webp'
    bild.save(p, 'WEBP', quality=86, method=4)
    liste[name] = dict(breite=bild.width, hoehe=bild.height)
    print(f'  {name:16} {bild.width}x{bild.height}  {os.path.getsize(p)//1024:>3} kB')

li, re = brechen(scheibe)
gz = (np.array(scheibe)[:, :, 3] > 40).sum()
hz = sum((np.array(b)[:, :, 3] > 40).sum() for b in (li, re))
print(f'\nDeckungsprobe: ganz {gz}, beide Hälften {hz} — Abweichung {abs(gz-hz)/gz*100:.2f} %')
json.dump(liste, open('inhalt/vorhang.json', 'w'), indent=1)
