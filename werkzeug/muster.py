"""Zwei Gründe für die Seite: EIN Korn für alle, EIN Bogenmuster zum Wechseln.

═══ Warum nicht sechs Fototexturen ═══

Genau das stand hier: sechs Sektionen, sechs verschiedene Fotos, sechs
Deckkräfte. Karol: „ich will, dass das ein harmonisches Gesamtbild ergibt, bin
noch nicht 100 % zufrieden." Zu Recht — das ist Abwechslung ohne System.

Bei Koto nachgesehen (Mobbin): dort liegt über der flachen Fläche nur feines
KORN. Kein Motiv, kein Foto. Es macht aus einer CSS-Farbe eine gedruckte
Fläche und stört nie, weil es nichts darstellt.

Daraus wird hier ein System aus einer Konstanten und zwei Wechselnden:

  Korn     auf JEDER Sektion, identisch. Die Konstante, die alles verbindet.
  Bogen    ihr Ofenrundbogen als Reihe — das Muster, das die Seite schon führt
           (Arkade, Tafel im Vorhang, QR-Schild).
  Foto     nur noch dort, wo es etwas BEDEUTET: Mehl in der Handarbeit, ihr
           Laden im Bestellen.

═══ Warum gekachelt und nicht ein grosses Bild ═══

Ein Korn über eine 2000 px hohe Sektion als Bild wäre ein halbes Megabyte. Als
160er Kachel sind es vier Kilobyte, und der Browser wiederholt sie umsonst.

Aufruf:  python3 werkzeug/muster.py
"""
import pathlib

ZIEL = pathlib.Path('public/bilder/muster-grund')


def korn() -> str:
    """Korn als SVG-Turbulenz statt als Bilddatei.

    Der erste Versuch war eine 160er PNG-Kachel. Sie war 40 kB gross, und das
    ist kein Versehen: PNG komprimiert Wiederholungen, und Rauschen hat per
    Definition keine. Ein Korn als Bild zu speichern heisst, das Unkomprimierbare
    zu speichern.

    `feTurbulence` rechnet dasselbe Rauschen im Browser — 400 Bytes, in jeder
    Grösse scharf, ohne Kachelnaht. `fractalNoise` und nicht `turbulence`: das
    zweite erzeugt Wirbel mit sichtbaren Adern, das erste ein gleichmässiges
    Korn.

    `baseFrequency` bestimmt die Körnigkeit. 0,8 liegt bei etwa einem Korn je
    zwei Pixel — fein genug, um als Papier zu lesen, grob genug, um auf einem
    normalen Bildschirm überhaupt zu erscheinen.
    """
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">\n'
        '  <filter id="k" x="0" y="0" width="100%" height="100%">\n'
        '    <feTurbulence type="fractalNoise" baseFrequency="0.8" '
        'numOctaves="3" stitchTiles="stitch"/>\n'
        '    <feColorMatrix type="saturate" values="0"/>\n'
        '  </filter>\n'
        '  <rect width="200" height="200" filter="url(#k)"/>\n'
        '</svg>\n'
    )


def bogen(breite: int = 320, hoehe: int = 240) -> str:
    """Eine Reihe ihrer Ofenrundbögen, kachelbar.

    Dieselbe Form, die die Arkade, die Tafel im Vorhang und das QR-Schild
    tragen — nur klein, versetzt und als Umriss. Ein Muster aus der eigenen
    Formensprache liest sich als Zugehörigkeit; eines aus einem Musterbuch als
    Dekoration.
    """
    b, h = 80, 104          # ein Bogen
    teile = []
    for reihe in range(2):
        versatz = (b // 2) if reihe else 0
        y = reihe * (hoehe / 2)
        for i in range(-1, breite // b + 2):
            x = i * b + versatz
            # Oben Halbrund, unten gerade — der gemauerte Bogen
            teile.append(
                f'M{x:.0f} {y + h:.0f}'
                f'V{y + h * 0.46:.0f}'
                f'A{b / 2:.0f} {h * 0.46:.0f} 0 0 1 {x + b:.0f} {y + h * 0.46:.0f}'
                f'V{y + h:.0f}'
            )
    d = ''.join(teile)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {breite} {hoehe}" '
        f'width="{breite}" height="{hoehe}" fill="none">\n'
        f'  <path d="{d}" stroke="currentColor" stroke-width="2" '
        f'vector-effect="non-scaling-stroke"/>\n'
        f'</svg>\n'
    )


if __name__ == '__main__':
    ZIEL.mkdir(parents=True, exist_ok=True)
    (ZIEL / 'korn.svg').write_text(korn())
    (ZIEL / 'bogen.svg').write_text(bogen())
    print('korn.svg ', (ZIEL / 'korn.svg').stat().st_size, 'Bytes')
    print('bogen.svg', (ZIEL / 'bogen.svg').stat().st_size, 'Bytes')
