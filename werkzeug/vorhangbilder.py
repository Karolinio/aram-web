"""
Vorhangbilder — die Scheibe, die beim Scrollen aufgeht, aus SEINEM Lahmacun.

Karol am 10.09.: „auf der ganzen website gibt es nun nur noch produkte oder
produkt animationen die aus diesen neuen 50 bildern/videos stammen."

Hier lag der erzeugte Lahmacun — mit Zitronenspalte und Petersilienblatt
obendrauf, die Karol schon am 08.09. rausgebeten hatte („nur ohne zitrone").
Kurios: die beiden HAELFTEN trugen die Zitrone nicht, nur das ganze Bild. Die
drei Dateien waren also nie derselbe Gegenstand.

Jetzt sind sie es: eine Vorlage, ein Zuschnitt, ein gerader Schnitt durch die
Mitte. Der Schnitt ist gerade und nicht gerissen, weil die beiden Haelften in
der Sektion wie ein Vorhang auseinanderfahren — eine gerissene Kante liefe
dabei sichtbar auseinander.
"""
import json
from pathlib import Path

import sys
import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from aramlicht import graduiere

WURZEL = Path(__file__).parent.parent
ZIEL = WURZEL / 'public' / 'bilder' / 'vorhang'
QUELLE = '/tmp/roh-schwarm-lahmacun.png'
QUELLE_RISS = '/tmp/lahmacun-riss.png'
# Karol am 10.09.: heller und appetitlicher — er ist die erste Sektion
# nach dem Video und traegt dort allein.
STAERKE, AUFHELLEN = 1.5, 0.09
BREIT, HOCH = 1200, 844          # dasselbe Seitenverhaeltnis wie bisher (1,42)

def bruchlinie(hoehe: int, mitte: int, breite: int, saat: int = 7) -> np.ndarray:
    """Eine Bruchkante als x-Wert je Bildzeile.

    ═══ Warum eine LINIE und nicht das gerissene Bild ═══

    Der erste Versuch nahm die erzeugte, auseinandergerissene Aufnahme und
    schnitt sie in der Mitte durch. Karol am 10.09.: „das ist nicht mal
    zusammen zu Beginn der Sektion." Er hat recht, und der Fehler ist
    grundsaetzlich: in dem Bild klafft der Spalt schon, also klafft er auch,
    solange die Haelften uebereinanderliegen. Ein Vorhang, der beim Aufgehen
    schon offen ist, ist kein Vorhang.

    Also umgekehrt: das HEILE Gebaeck wird geteilt, aber nicht gerade. Jeder
    Bildpunkt gehoert genau einer Haelfte, sie passen bei translateX(0) also
    lueckenlos zusammen — und sobald sie auseinanderfahren, zeigt sich eine
    zackige Kante statt eines Messerschnitts.

    Die Linie ist die Summe dreier Wellen plus etwas Zittern: die lange Welle
    gibt den groben Verlauf, die kurze das Ausfransen, das Zittern die
    Kruemel. Feste Saat, damit derselbe Lauf dieselbe Kante ergibt.
    """
    rng = np.random.default_rng(saat)
    y = np.arange(hoehe)
    a = breite * 0.030
    linie = (a * np.sin(y / hoehe * 3.1 + 0.7)
             + a * 0.55 * np.sin(y / hoehe * 11.0 + 2.1)
             + a * 0.30 * np.sin(y / hoehe * 27.0 + 4.3)
             + rng.normal(0, a * 0.14, hoehe))
    # Dreifach gleitendes Mittel: nimmt dem Zittern die Zacken, die kein Teig
    # macht, laesst die groberen Ausbrueche stehen.
    for _ in range(3):
        linie = np.convolve(linie, np.ones(5) / 5, mode='same')
    return (mitte + linie).astype(int)


if __name__ == '__main__':
    im = Image.open(QUELLE).convert('RGBA')
    bb = im.getbbox()
    im = im.crop(bb) if bb else im
    f = (HOCH * 0.94) / max(im.size)
    k = im.resize((round(im.width * f), round(im.height * f)), Image.LANCZOS)
    rahmen = Image.new('RGBA', (BREIT, HOCH), (0, 0, 0, 0))
    x0, y0 = (BREIT - k.width) // 2, (HOCH - k.height) // 2
    rahmen.paste(k, (x0, y0))
    rahmen = graduiere(rahmen, STAERKE, AUFHELLEN)

    linie = bruchlinie(HOCH, BREIT // 2, BREIT)
    spalten = np.arange(BREIT)[None, :]
    linksmaske = spalten < linie[:, None]
    print(f'Bruchkante schwankt um {linie.max() - linie.min()} Bildpunkte '
          f'({(linie.max() - linie.min()) / BREIT * 100:.1f} % der Breite)')

    masse = {}
    voll = np.array(rahmen)
    for name, maske in (('scheibe', None), ('scheibe-links', linksmaske), ('scheibe-rechts', ~linksmaske)):
        a = voll.copy()
        if maske is not None:
            a[..., 3] = np.where(maske, a[..., 3], 0)
        h = Image.fromarray(a, 'RGBA')
        h.save(ZIEL / f'{name}.webp', 'WEBP', quality=88, method=6)
        masse[name] = {'breite': BREIT, 'hoehe': HOCH}
        print(f'{name:<16} {BREIT} x {HOCH}  {(ZIEL / f"{name}.webp").stat().st_size // 1024} kB')

    (WURZEL / 'inhalt' / 'vorhang.json').write_text(
        json.dumps(masse, ensure_ascii=False, indent=1) + '\n')
    print('inhalt/vorhang.json auf die echten Masse gesetzt')
