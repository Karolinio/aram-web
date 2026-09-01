"""Freigestellte Gebäcke auf EIN Licht bringen.

═══ Der Befund ═══

Die neun Gebäcke im fliegenden Schwarm stammen aus neun verschiedenen
Aufnahmen: manche am Fenster, manche unter Neonlicht, manche im Ofenschatten.
Gemessen über die undurchsichtigen Pixel:

    Helligkeit   90 bis 171     fast das Doppelte
    Kontrast     23 bis 65      fast das Dreifache
    Farbstich    25 bis 123     Faktor fünf

Nebeneinander gelegt liest sich das als Sammlung, nicht als Sortiment. Karol:
„die echten Dinge sollen halt fertig sein und auch so aussehen wie in echt."

═══ Warum das KEIN Nachbauen ist ═══

Der naheliegende Weg wäre, die Gebäcke schöner erzeugen zu lassen. Genau das
hat der Inhaber abgelehnt, und zu Recht: ein schöner nachgebautes Manakisch
ist ein ANDERES Manakisch.

Hier wird nichts erfunden. Es wird belichtet — dasselbe, was jeder Fotograf
nach dem Auslösen macht. Das Gebäck bleibt Pixel für Pixel ihres, es bekommt
nur dasselbe Licht wie seine Nachbarn.

═══ Warum nur teilweise angeglichen wird ═══

Voll angeglichen sähen alle neun gleich aus, und dann wäre der rohe Teig so
goldbraun wie das gebackene Gebäck. Roher Teig IST blass und kontrastarm —
das ist kein Fehler der Aufnahme, sondern die Sache selbst.

Deshalb zwei Zielwerte statt einem, und die Korrektur geht nur zu 70 % des
Weges. Was bleibt, ist der Unterschied zwischen den Gebäcken; was verschwindet,
ist der Unterschied zwischen den Küchen, in denen fotografiert wurde.
"""
import pathlib

import numpy as np
from PIL import Image

Z = pathlib.Path('public/bilder/echt')

# Zielwerte, gemessen als Median der GEBACKENEN Stücke — sie sind die Mehrheit
# und das, wonach der Rest aussehen soll.
ZIEL_GEBACKEN = {'hell': 112.0, 'kontrast': 60.0, 'stich': 100.0, 'gruen': 4.8}
# Roher Teig hat sein eigenes Ziel: blass und kühl, weil er das IST.
ZIEL_TEIG = {'hell': 158.0, 'kontrast': 32.0, 'stich': 30.0, 'gruen': 4.8}

ANTEIL = 0.7   # wie weit in Richtung Ziel korrigiert wird


def messen(px):
    return {'hell': float(px.mean()),
            'kontrast': float(px.std()),
            'stich': float(px[:, 0].mean() - px[:, 2].mean()),
            'gruen': float((px[:, 1] - (px[:, 0] + px[:, 2]) / 2).mean())}


def angleichen(pfad: pathlib.Path, ziel: dict) -> tuple:
    im = Image.open(pfad).convert('RGBA')
    a = np.array(im).astype(np.float64)
    maske = a[:, :, 3] > 200
    if maske.sum() < 500:
        return None
    px = a[maske][:, :3]
    ist = messen(px)

    # 1 Kontrast um den eigenen Mittelwert dehnen oder stauchen
    faktor = 1 + ANTEIL * (ziel['kontrast'] / max(ist['kontrast'], 1) - 1)
    mitte = px.mean()
    neu = (px - mitte) * faktor + mitte

    # 2 Helligkeit verschieben
    neu += ANTEIL * (ziel['hell'] - messen(neu)['hell'])

    # 3 Farbstich über die Rot- und Blauachse, nicht über den Grünkanal:
    #    Grün trägt den grössten Teil der Helligkeit, und daran zu drehen
    #    verschiebt die Belichtung gleich mit.
    fehlt = ANTEIL * (ziel['stich'] - messen(neu)['stich'])
    neu[:, 0] += fehlt / 2
    neu[:, 2] -= fehlt / 2

    # 4 Grünüberschuss — die vierte Achse, und bis zum 01.09. hat sie niemand
    #   gemessen. Sie lag zwischen −5,7 und +23,1, eine Spanne von 29 Stufen.
    #
    #   Grünstichiges Gelb liest sich als ALT. Eine frische Kruste ist rot-gelb;
    #   dieselbe Kruste mit zuviel Grün wirkt wie Brot von gestern, ganz ohne
    #   dass Helligkeit oder Sättigung sich ändern. Die drei Stücke mit dem
    #   höchsten Überschuss (Sesam +17, Gebacken +23, Käse +19) waren genau die,
    #   die blass aussahen.
    #
    #   Schritt 3 lässt Grün bewusst in Ruhe, weil es die Helligkeit trägt.
    #   Genau deshalb wird hier nachgeschoben, was Grün an Helligkeit
    #   mitnimmt — sonst macht diese Korrektur Schritt 2 wieder kaputt.
    ueber = neu[:, 1] - (neu[:, 0] + neu[:, 2]) / 2
    weg = ANTEIL * (float(ueber.mean()) - ziel['gruen'])
    neu[:, 1] -= weg
    neu += weg * 0.7152

    a[maske, 0:3] = np.clip(neu, 0, 255)
    Image.fromarray(a.astype('uint8'), 'RGBA').save(
        pfad, 'WEBP', quality=86, method=6)
    return ist, messen(np.clip(neu, 0, 255))


# Roher Teig steht seit dem 01.09. nicht mehr im Schwarm — siehe appetit.py.
# Das eigene Ziel bleibt stehen: sobald wieder ein rohes Stück auftaucht, hat es
# blass zu bleiben, statt sich goldbraun angleichen zu lassen.
TEIG: set[str] = set()
ALLE = ['fatayer-frei', 'schwarm-sesam', 'schwarm-gebacken', 'schwarm-zaatar',
        'schwarm-zaatar-2', 'schwarm-lahmacun', 'manakisch-belegt-frei',
        'schwarm-kaese', 'schwarm-rolle']

if __name__ == '__main__':
    print(f'{"Gebaeck":22}{"vorher":>26}{"nachher":>26}')
    for n in ALLE:
        for endung in ('', '-500'):
            p = Z / f'{n}{endung}.webp'
            if not p.exists():
                continue
            e = angleichen(p, ZIEL_TEIG if n in TEIG else ZIEL_GEBACKEN)
            if e and not endung:
                v, na = e
                print(f'{n:22}'
                      f'{v["hell"]:8.0f}{v["kontrast"]:6.0f}{v["stich"]:6.0f}   ->'
                      f'{na["hell"]:8.0f}{na["kontrast"]:6.0f}{na["stich"]:6.0f}')
