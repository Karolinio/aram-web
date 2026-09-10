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

    # Die HAELFTEN kommen aus dem gerissenen Bild, nicht aus dem heilen: ein
    # gerader Schnitt durch eine Scheibe sieht aus wie ein Messer, und Karol
    # will „wie das Gebaeck knickt und voneinander abreisst".
    riss = Image.open(QUELLE_RISS).convert('RGBA')
    bb2 = riss.getbbox()
    riss = riss.crop(bb2) if bb2 else riss
    f2 = (HOCH * 0.94) / max(riss.size)
    k2 = riss.resize((round(riss.width * f2), round(riss.height * f2)), Image.LANCZOS)
    rissrahmen = Image.new('RGBA', (BREIT, HOCH), (0, 0, 0, 0))
    rissrahmen.paste(k2, ((BREIT - k2.width) // 2, (HOCH - k2.height) // 2))
    rissrahmen = graduiere(rissrahmen, STAERKE, AUFHELLEN)
    sp = (np.array(rissrahmen)[..., 3] > 60).sum(0)
    fenster = slice(int(BREIT * 0.35), int(BREIT * 0.65))
    trenn = fenster.start + int(np.argmin(sp[fenster]))
    print(f'Bruchlinie bei Spalte {trenn} von {BREIT} ({sp[trenn]} Bildpunkte dick)')

    masse = {}
    for name, quelle, kasten in (('scheibe',        rahmen,     (0, 0, BREIT, HOCH)),
                                 ('scheibe-links',  rissrahmen, (0, 0, trenn, HOCH)),
                                 ('scheibe-rechts', rissrahmen, (trenn, 0, BREIT, HOCH))):
        h = Image.new('RGBA', (BREIT, HOCH), (0, 0, 0, 0))
        h.paste(quelle.crop(kasten), (kasten[0], 0))
        h.save(ZIEL / f'{name}.webp', 'WEBP', quality=88, method=6)
        masse[name] = {'breite': BREIT, 'hoehe': HOCH}
        print(f'{name:<16} {BREIT} x {HOCH}  {(ZIEL / f"{name}.webp").stat().st_size // 1024} kB')

    (WURZEL / 'inhalt' / 'vorhang.json').write_text(
        json.dumps(masse, ensure_ascii=False, indent=1) + '\n')
    print('inhalt/vorhang.json auf die echten Masse gesetzt')
