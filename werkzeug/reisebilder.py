"""
Reisebilder — die Kaeseschiff-Reise aus SEINEM Kaeseschiff.

═══ Warum die alte Reise falsch war ═══

Auf der Seite lag ein Adscharuli Chatschapuri: ein offenes Boot mit rohem
Eigelb in der Mitte. Das ist georgisch. Aram macht etwas anderes — Karol am
10.09.: „das käseschiff von aram ist von außen zu. man sieht den typischen
käse nur in der mitte leicht. das ist normal bei denen."

Dazu kommt: auf ihrer Speisekarte steht ueberhaupt kein „Kaeseschiff". Die
22 Gerichte heissen „Lange Kaese", „Doppelt Kaese", „Gross Kaese scharf".
Die Reise fuehrte also ein Gericht vor, das es bei ihm nicht gibt.

Kurios: werkzeug/kaesriss.py traegt seit Wochen den Absatz „Kein Ei — Karol:
Spiegelei habe ich nie was von gesagt". Das Werkzeug wusste es, die Bilder
nicht. Sie sind nie neu erzeugt worden.

═══ Die neue Folge ═══

Sie ist aus IMG_1533 abgeleitet, seinem echten Schiff, ueber Higgsfield mit
dem fertigen Freisteller als Vorlage. Und sie ist eine ANDERE Folge als vorher,
weil sein Schiff anders entsteht: ein geschlossenes Schiffchen wird nicht flach
gewalzt, es wird geformt und zugedrueckt.

    1 Kugel      roher Teig
    2 geformt    Schiffchen geschlossen, noch blass          (vorher: „gewalzt")
    3 bestreut   mit Sesam und Schwarzkuemmel, noch roh      (vorher: „belegt")
    4 gebacken   sein Freisteller
    5 gerissen   in zwei Haelften, echte Kaesefaeden dazwischen

═══ Ein Rahmen fuer alle ═══

Fuenf Zustaende desselben Gegenstands duerfen beim Ueberblenden nicht springen.
Es wird deshalb EIN Rechteck gebildet, das alle umschliesst, und alle werden
darauf gelegt — dieselbe Regel wie im Vorbau, an der der erste Bau damals
gescheitert ist.
"""
from pathlib import Path
import numpy as np
from PIL import Image
import json, sys

sys.path.insert(0, str(Path(__file__).parent))
from aramlicht import graduiere

BREIT, HOCH = 1500, 603
ZIEL = Path(__file__).parent.parent / 'public' / 'bilder' / 'riss'

QUELLEN = {
    'stufe-1-kugel':    '/tmp/reise-stufe1.png',
    'stufe-2-geformt':  '/tmp/reise-stufe2.png',
    'stufe-3-bestreut': '/tmp/reise-stufe3.png',
    'stufe-4-gebacken': '/tmp/roh-fatayer-frei.png',
}
RISS = '/tmp/reise-riss.png'


def zuschnitt(p):
    im = Image.open(p).convert('RGBA')
    bb = im.getbbox()
    return im.crop(bb) if bb else im


def in_rahmen(im, mass):
    """Auf `mass` der langen Kante bringen und mittig in den Rahmen legen."""
    f = mass / max(im.size)
    k = im.resize((max(1, round(im.width * f)), max(1, round(im.height * f))), Image.LANCZOS)
    r = Image.new('RGBA', (BREIT, HOCH), (0, 0, 0, 0))
    r.paste(k, ((BREIT - k.width) // 2, (HOCH - k.height) // 2))
    return r


def sichern(im, name):
    g = graduiere(im)
    g.save(ZIEL / f'{name}.webp', 'WEBP', quality=88, method=6)
    return name, g.size


if __name__ == '__main__':
    ZIEL.mkdir(parents=True, exist_ok=True)
    # Der gebackene Zustand gibt das Mass vor — er ist der Bezug der Reise.
    stuecke = {n: zuschnitt(p) for n, p in QUELLEN.items()}
    MASS = int(BREIT * 0.86)

    for n, im in stuecke.items():
        # Teig ist beim Formen etwas kleiner als das gebackene Schiff.
        anteil = {'stufe-1-kugel': 0.42, 'stufe-2-geformt': 0.94, 'stufe-3-bestreut': 0.97}.get(n, 1.0)
        print(*sichern(in_rahmen(im, int(MASS * anteil)), n))

    # riss-3 ist der EINZIGE Rissstand, den die Sektion liest — riss-1, -2
    # und -4 lagen im Ordner, werden aber von niemandem angefordert.
    print(*sichern(in_rahmen(zuschnitt(RISS), MASS), 'riss-3'))

    json.dump({n: {'breite': BREIT, 'hoehe': HOCH} for n in
               ['stufe-1-kugel', 'stufe-2-geformt', 'stufe-3-bestreut',
                'stufe-4-gebacken', 'riss-3']},
              open(Path(__file__).parent.parent / 'inhalt' / 'riss.json', 'w'), indent=1)
