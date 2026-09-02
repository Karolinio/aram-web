"""Die Freisteller haben Scherenkanten und farbige Säume. Beides ist messbar.

═══ Der Befund ═══

Karol am 02.09.: „die einzelnen Gebäcke müssen noch gefixt werden … nicht so
halb schief ausgeschnitten. Das sieht nicht gut aus für die Präsentation."

Gemessen über die acht Freisteller im Schwarm, zwei Werte je Bild:

    KANTE HART   Anteil der Alphawerte zwischen 20 und 235, also der weiche
                 Übergang, gemessen gegen die Fläche des Motivs.
    SAUM         Wie weit die Farbe der halbdurchsichtigen Randpixel von der
                 Farbe des Inneren abweicht.

                 ACHTUNG, das misst NICHT nur den Saum. Ein Zaatar-Fladen ist
                 in der Mitte dunkelgrün und am Rand blasser Teig — dort ist
                 ein grosser Abstand richtig und kein Fehler. Nach dem Glätten
                 stiegen `zaatar` auf 56 und `zaatar-2` auf 87, und beide sind
                 im vierfach vergrösserten Bild einwandfrei. Die Zahl taugt,
                 um VOR der Bearbeitung Verdacht zu schöpfen; das Urteil
                 fällt am vergrösserten Rand über ihrem Orange.

                        Kante hart    Saum
        fatayer-frei         1,3 %      10
        rolle                5,4 %      72
        lahmacun             0,0 %       0
        zaatar               0,0 %       0
        zaatar-2             0,0 %       0
        sesam                0,0 %       0
        gebacken             0,0 %       0
        kaese                2,3 %      75

Fünf Stücke haben NULL weichen Übergang. Ihre Kante ist binär — Pixel für
Pixel entweder ganz da oder ganz weg. Genau so sieht „mit der Schere
ausgeschnitten" aus: eine Treppe statt einer Kante. Und zwei Stücke tragen
einen Saum von über siebzig Stufen, also Reste des alten Hintergrunds im
durchsichtigen Rand — auf ihrem Orange liest sich das als Heiligenschein.

═══ Was hier passiert, und was nicht ═══

Nichts wird erfunden und nichts umgefärbt. Zwei Griffe, beide am RAND:

  1  Die Alphakante bekommt eine Rampe von ein bis zwei Pixeln. Ein einfacher
     Weichzeichner allein würde das Motiv schrumpfen lassen; deshalb wird die
     weichgezeichnete Kante anschliessend wieder um ihre Mitte gedehnt. Die
     50-Prozent-Linie bleibt damit da, wo sie war — das Gebäck wird nicht
     kleiner, seine Kante wird nur nicht mehr getreppt.

  2  Der Saum wird durch die Farbe von INNEN ersetzt. Gerechnet wird der
     alphagewichtete Mittelwert der Nachbarschaft: `weich(rgb * alpha) /
     weich(alpha)`. Weil durchsichtige Pixel dabei kaum zählen, gewinnt die
     Farbe des undurchsichtigen Inneren, und der Rest des alten Grundes
     verschwindet.

Angefasst wird nur, was durchfällt: Griff 1 unter 2 % weicher Kante, Griff 2
über 30 Stufen Saum.
"""
import pathlib

import numpy as np
from PIL import Image, ImageFilter

Z = pathlib.Path('public/bilder/echt')

GRENZE_KANTE = 2.0    # Prozent weicher Übergang, darunter wird gerampt
GRENZE_SAUM = 30.0    # Farbabstand des Randes, darüber wird ersetzt
RAMPE = 1.2           # Radius des Weichzeichners auf dem Alphakanal
# 1,25 statt 2,1: bei 2,1 war die Rampe nach dem Dehnen wieder fast binaer
# (gemessen 0,4 % weicher Uebergang statt 0,0 % — also praktisch nichts
# gewonnen). Die Dehnung soll die Kante scharf HALTEN, nicht wiederherstellen.
DEHNUNG = 1.25        # wie stark die weiche Kante um ihre Mitte gedehnt wird
SAUMWEITE = 2.4       # Radius, aus dem die Farbe von innen geholt wird


def messen(a: np.ndarray) -> tuple[float, float]:
    al = a[..., 3]
    flaeche = max(1, (al > 128).sum())
    weich = ((al > 20) & (al < 235)).sum() / flaeche * 100
    rand = (al > 40) & (al < 200)
    innen = al > 240
    saum = (abs(a[..., :3][rand].mean() - a[..., :3][innen].mean())
            if rand.sum() > 50 and innen.sum() > 50 else 0.0)
    return float(weich), float(saum)


def saum_ersetzen(a: np.ndarray) -> np.ndarray:
    """Die Farbe der Randpixel durch die Farbe von INNEN ersetzen.

    Die Quelle ist eine HARTE Maske (Alpha über 0,9), nicht der Alphakanal
    selbst. Das ist der Unterschied, an dem der erste Versuch gescheitert ist:
    mit dem weichen Alpha als Gewicht zählen die Randpixel sich selbst mit, und
    der Saum reproduziert sich. Mit einer harten Maske stammt jede Farbe aus
    dem undurchsichtigen Inneren.

    Dreimal nacheinander, weil ein Durchgang nur so weit trägt, wie der
    Weichzeichner reicht — bei breiteren Säumen bleibt sonst die äusserste
    Reihe stehen.
    """
    for _ in range(3):
        hart = (a[..., 3] > 230).astype(np.float64)
        vor = np.stack([a[..., k] * hart for k in range(3)], -1)
        weich_farbe = np.stack([
            np.asarray(Image.fromarray(np.clip(vor[..., k], 0, 255).astype('uint8'))
                       .filter(ImageFilter.GaussianBlur(SAUMWEITE))).astype(np.float64)
            for k in range(3)], -1)
        weich_hart = np.asarray(
            Image.fromarray((hart * 255).astype('uint8'))
            .filter(ImageFilter.GaussianBlur(SAUMWEITE))).astype(np.float64) / 255.0
        genug = weich_hart > 0.02
        innen = weich_farbe / np.maximum(weich_hart, 0.02)[..., None]
        rand = (a[..., 3] > 0) & (a[..., 3] < 230) & genug
        a[..., :3] = np.where(rand[..., None], np.clip(innen, 0, 255), a[..., :3])
    return a


def glaetten(pfad: pathlib.Path) -> dict:
    im = Image.open(pfad).convert('RGBA')
    a = np.asarray(im).astype(np.float64)
    vorher = messen(a)
    getan = []

    # ── 1 ZUERST die Kante ─────────────────────────────────────────────────
    #    Erst danach gibt es überhaupt halbdurchsichtige Pixel, in denen ein
    #    Saum stecken kann. Im ersten Versuch lief es andersherum, und genau
    #    deshalb wuchs der Saum der fünf getreppten Stücke von 0 auf bis zu 60:
    #    die frisch erzeugte Rampe trug die alte Randfarbe, und niemand hat sie
    #    danach noch angefasst.
    if vorher[0] < GRENZE_KANTE:
        al = np.asarray(
            Image.fromarray(a[..., 3].astype('uint8'))
            .filter(ImageFilter.GaussianBlur(RAMPE))).astype(np.float64)
        # Um die Mitte dehnen: die 50-Prozent-Linie bleibt, wo sie war.
        a[..., 3] = np.clip((al - 127.5) * DEHNUNG + 127.5, 0, 255)
        getan.append('Kante')

    # ── 2 DANN der Saum ────────────────────────────────────────────────────
    if getan or vorher[1] > GRENZE_SAUM:
        a = saum_ersetzen(a)
        getan.append('Saum')

    if not getan:
        return {'name': pfad.stem, 'getan': '—', 'vorher': vorher, 'nachher': vorher}

    fertig = Image.fromarray(a.astype('uint8'), 'RGBA')
    fertig.save(pfad, 'WEBP', quality=88, method=6)
    klein = fertig.copy()
    klein.thumbnail((500, 500), Image.LANCZOS)
    klein.save(pfad.with_name(pfad.stem + '-500.webp'), 'WEBP', quality=84, method=6)
    return {'name': pfad.stem, 'getan': '+'.join(getan), 'vorher': vorher,
            'nachher': messen(np.asarray(fertig).astype(np.float64))}


ALLE = ['fatayer-frei', 'schwarm-rolle', 'schwarm-lahmacun', 'schwarm-zaatar',
        'schwarm-zaatar-2', 'schwarm-sesam', 'schwarm-gebacken', 'schwarm-kaese',
        'manakisch-belegt-frei']

if __name__ == '__main__':
    print(f'{"Gebaeck":22}{"getan":12}{"Kante vor":>10}{"nach":>7}'
          f'{"Saum vor":>10}{"nach":>7}')
    for n in ALLE:
        p = Z / f'{n}.webp'
        if not p.exists():
            continue
        e = glaetten(p)
        print(f'{e["name"]:22}{e["getan"]:12}'
              f'{e["vorher"][0]:9.1f} %{e["nachher"][0]:6.1f} %'
              f'{e["vorher"][1]:10.0f}{e["nachher"][1]:7.0f}')
