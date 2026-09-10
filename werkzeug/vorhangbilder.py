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
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from aramlicht import graduiere

WURZEL = Path(__file__).parent.parent
ZIEL = WURZEL / 'public' / 'bilder' / 'vorhang'
QUELLE = '/tmp/roh-schwarm-lahmacun.png'
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
    rahmen = graduiere(rahmen)

    masse = {}
    for name, kasten in (('scheibe',        (0, 0, BREIT, HOCH)),
                         ('scheibe-links',  (0, 0, BREIT // 2, HOCH)),
                         ('scheibe-rechts', (BREIT // 2, 0, BREIT, HOCH))):
        h = Image.new('RGBA', (BREIT, HOCH), (0, 0, 0, 0))
        h.paste(rahmen.crop(kasten), (kasten[0], 0))
        h.save(ZIEL / f'{name}.webp', 'WEBP', quality=88, method=6)
        masse[name] = {'breite': BREIT, 'hoehe': HOCH}
        print(f'{name:<16} {BREIT} x {HOCH}  {(ZIEL / f"{name}.webp").stat().st_size // 1024} kB')

    (WURZEL / 'inhalt' / 'vorhang.json').write_text(
        json.dumps(masse, ensure_ascii=False, indent=1) + '\n')
    print('inhalt/vorhang.json auf die echten Masse gesetzt')
