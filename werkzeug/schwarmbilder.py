"""
Schwarmbilder — aus seinen Handyfotos werden die fliegenden Produkte.

═══ Warum diese Kette und nicht der uebliche Higgsfield-Schoenheitslauf ═══

Karol am 10.09.: „ich will das die dampfenden produkte nun die echten werden …
auf der ganzen website gibt es nun nur noch produkte die aus diesen neuen
50 bildern stammen."

Erster Versuch: Higgsfield mit einem Schoenheits-Auftrag ("relight, deepen the
browns, wie ein guter Foodfotograf"). Gemessen kam ein anderes Gericht zurueck
— Farbabstand 44,8 zur Vorlage, mit Kaeseflecken und Kraeutern, die es auf
seinem Lahmacun nicht gibt. Zweiter Versuch, derselbe Input, aber ein Auftrag,
der NUR freistellt und jede Veraenderung ausdruecklich verbietet: Abstand 3,0.

Daraus die Arbeitsteilung, die diese Datei umsetzt:
    Higgsfield  schneidet aus            (kann es, erfindet sonst)
    Code        macht es schoen          (hat eine Obergrenze, ist messbar)

Vier Schritte:
  1  HAUPTTEIL   Alles wegwerfen, was nicht am groessten zusammenhaengenden
                 Stueck haengt. Beim Sesambrot hingen Fetzen der Nachbarbrote
                 mit dran — 6,6 % der Maske, drei getrennte Flecken.
  2  BESCHNITT   Auf den Inhalt, mit 2 % Luft. Ohne das klebt das Produkt am
                 Bildrand und der Schwarm zeigt abgeschnittene Kanten.
  3  GRADATION   siehe aramlicht.py
  4  MASSE       900 px lange Kante plus eine 500er Fassung, wie die Seite es
                 seit dem 07.09. erwartet.
"""
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from aramlicht import beschneiden, graduiere

LANG, KLEIN = 900, 500
ZIEL = Path(__file__).parent.parent / 'public' / 'bilder' / 'echt'


def hauptteil(maske: np.ndarray) -> tuple[np.ndarray, float]:
    """Groesstes zusammenhaengendes Stueck. Flutfuellung auf einer
    verkleinerten Maske — bei 2048 px waere Python-BFS zu langsam, und fuer
    „haengt das zusammen" reichen 400 px allemal."""
    H, W = maske.shape
    s = max(1, max(H, W) // 400)
    k = maske[::s, ::s]
    h, w = k.shape
    besucht = np.zeros((h, w), bool)
    bester, bestgr = [], 0
    for y0 in range(h):
        for x0 in range(w):
            if not k[y0, x0] or besucht[y0, x0]:
                continue
            q = deque([(y0, x0)])
            besucht[y0, x0] = True
            teil = []
            while q:
                y, x = q.popleft()
                teil.append((y, x))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and k[ny, nx] and not besucht[ny, nx]:
                        besucht[ny, nx] = True
                        q.append((ny, nx))
            if len(teil) > bestgr:
                bestgr, bester = len(teil), teil
    gross = np.zeros((h, w), bool)
    for y, x in bester:
        gross[y, x] = True
    hoch = np.array(Image.fromarray(gross.astype(np.uint8) * 255).resize((W, H), Image.NEAREST)) > 127
    return hoch, bestgr / max(1, int(k.sum()))


def bereite(pfad: Path, name: str) -> tuple[int, int, float]:
    im = Image.open(pfad).convert('RGBA')
    a = np.array(im)
    haupt, anteil = hauptteil(a[..., 3] > 120)
    a[..., 3] = np.where(haupt, a[..., 3], 0)
    im = beschneiden(Image.fromarray(a, 'RGBA'))
    im = graduiere(im)
    w, h = im.size
    f = LANG / max(w, h)
    gross = im.resize((round(w * f), round(h * f)), Image.LANCZOS)
    gross.save(ZIEL / f'{name}.webp', 'WEBP', quality=88, method=6)
    f2 = KLEIN / max(gross.size)
    gross.resize((round(gross.width * f2), round(gross.height * f2)), Image.LANCZOS) \
         .save(ZIEL / f'{name}-500.webp', 'WEBP', quality=86, method=6)
    return gross.width, gross.height, anteil


if __name__ == '__main__':
    print(f'{"Name":<18} {"Masse":>11}  Hauptteil')
    for p in sorted(Path('/tmp').glob('roh-*.png')):
        name = p.stem.removeprefix('roh-')
        w, h, anteil = bereite(p, name)
        warnung = '  <- Fetzen entfernt' if anteil < 0.99 else ''
        print(f'{name:<18} {w:>5} x {h:<5}  {anteil*100:5.1f}%{warnung}')
