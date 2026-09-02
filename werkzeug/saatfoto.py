"""Die gezeichnete Saat wird durch die FOTOGRAFIERTE ersetzt.

═══ Der Befund ═══

Karol am 02.09.: „tausche diese komischen, komplett im Hintergrund schwebenden
zwei-D-Koerner gegen diese drei-D-Koerner, die ein bisschen weiter vorne sind."

Er meint zwei Systeme, die seit Wochen nebeneinander liefen, ohne dass es
jemandem aufgefallen waere:

  .untergrund__saat   gezeichnete Ellipsen und Rauten aus einer SVG-Datei. Flach,
                      zwei Farbwerte, kein Licht. Auf JEDER Sektion.
  .korn               vierzehn Teilchen, die Ausschnitte aus einem FOTO zeigen
                      (bilder/textur/koerner.webp): echte Sesam- und
                      Schwarzkuemmelkoerner mit Schattierung und Glanzlicht.
                      Nur in der Prozess-Sektion.

Das „Knaeuel" unter Schritt 03, das Karol im Bild gefunden hat, ist eines
dieser vierzehn Teilchen. Es sieht besser aus als das Muster ringsum, weil es
ein Foto ist und kein Zeichen — und deshalb soll es das Muster ersetzen.

═══ Warum eine Kachel und nicht vierzehn Teilchen ═══

Die vierzehn sind von Hand gesetzt und tragen je einen eigenen Parallaxwert.
Auf sieben Sektionen ausgeweitet waeren das rund hundert Knoten mit hundert
ScrollTriggern — genau die Rechnung, die auf einem Handy als Ruckeln ankommt.

Stattdessen werden die Koerner EINMAL aus dem Foto geschnitten und zu einer
nahtlosen Kachel gestreut. Eine Datei, eine Ebene je Sektion, und das Rieseln
und die Zeigerreaktion bleiben, wie sie sind.

═══ Wie die Kachel nahtlos wird ═══

Jedes Korn wird zusaetzlich um eine Kachelbreite versetzt gesetzt, wenn es
ueber den Rand ragt. Was rechts hinauslaeuft, kommt links wieder herein — und
weil beide Kopien vom selben Zufallswert stammen, passen sie exakt aufeinander.

═══ Warum EINE Datei fuer beide Gruende ═══

Die gezeichnete Saat brauchte zwei Faerbungen, weil ihr Schwarzkuemmel auf
ihrem Schwarz unsichtbar war. Ein fotografiertes Korn hat ein Glanzlicht: es
bleibt auch auf dunklem Grund als Form lesbar. Eine Datei genuegt, und die
Farben sind die echten.
"""
import pathlib
import random

import numpy as np
from PIL import Image

QUELLE = pathlib.Path('public/bilder/textur/koerner.webp')
ZIEL = pathlib.Path('public/bilder/muster-grund/saat-foto.webp')

KACHEL = 560       # Kantenlaenge der Kachel
ZELLEN = 9         # grobes Raster, in dem gestreut wird
LEER = 0.10        # Anteil der Zellen ohne Korn
KORN_MIN = 26      # kleinste Kantenlaenge eines gesetzten Korns
KORN_MAX = 44


def koerner_schneiden(bild: Image.Image) -> list[Image.Image]:
    """Die Einzelkoerner aus dem Blatt holen.

    Ueber die Alphamaske, mit einer Flutfuellung je zusammenhaengendem Fleck.
    Beruehrende Koerner bleiben dabei ein Stueck — das ist kein Fehler, sondern
    genau das „Knaeuel", das Karol gefallen hat.
    """
    from collections import deque
    a = np.asarray(bild)
    m = a[..., 3] > 60
    h, w = m.shape
    gesehen = np.zeros_like(m)
    raus = []
    for sy in range(0, h, 2):
        for sx in range(0, w, 2):
            if not m[sy, sx] or gesehen[sy, sx]:
                continue
            q = deque([(sy, sx)])
            gesehen[sy, sx] = True
            xs, ys = [sx], [sy]
            while q:
                y, x = q.popleft()
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and m[ny, nx] and not gesehen[ny, nx]:
                        gesehen[ny, nx] = True
                        q.append((ny, nx))
                        xs.append(nx); ys.append(ny)
            if len(xs) < 120:          # Staub, kein Korn
                continue
            k = bild.crop((min(xs), min(ys), max(xs) + 1, max(ys) + 1))
            if max(k.size) < 12:
                continue
            raus.append(k)
    return raus


def kachel_bauen(koerner: list[Image.Image], saatgut: int = 7) -> Image.Image:
    r = random.Random(saatgut)
    blatt = Image.new('RGBA', (KACHEL, KACHEL), (0, 0, 0, 0))
    schritt = KACHEL / ZELLEN

    for zy in range(ZELLEN):
        for zx in range(ZELLEN):
            if r.random() < LEER:
                continue
            korn = r.choice(koerner).copy()
            kante = r.randint(KORN_MIN, KORN_MAX)
            korn.thumbnail((kante, kante), Image.LANCZOS)
            korn = korn.rotate(r.uniform(0, 360), Image.BICUBIC, expand=True)
            x = int(zx * schritt + r.uniform(0.05, 0.95) * schritt) - korn.width // 2
            y = int(zy * schritt + r.uniform(0.05, 0.95) * schritt) - korn.height // 2
            # Nahtlos: jede Kopie, die ueber den Rand ragt, kommt auf der
            # anderen Seite noch einmal.
            for dx in (-KACHEL, 0, KACHEL):
                for dy in (-KACHEL, 0, KACHEL):
                    px, py = x + dx, y + dy
                    if px > KACHEL or py > KACHEL:
                        continue
                    if px + korn.width < 0 or py + korn.height < 0:
                        continue
                    blatt.alpha_composite(korn, (max(px, 0) if px >= 0 else 0, 0)
                                          if False else (px, py))
    return blatt


if __name__ == '__main__':
    blatt = Image.open(QUELLE).convert('RGBA')
    koerner = koerner_schneiden(blatt)
    print(f'{len(koerner)} Koerner aus dem Blatt geschnitten')
    kachel = kachel_bauen(koerner)
    ZIEL.parent.mkdir(parents=True, exist_ok=True)
    kachel.save(ZIEL, 'WEBP', quality=84, method=6)
    print(f'{ZIEL} {kachel.size} {ZIEL.stat().st_size / 1024:.0f} kB')
