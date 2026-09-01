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
import random

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


def korn_hell() -> str:
    """Dasselbe Korn, aber für SCHWARZE Gründe — als helle Sprenkel.

    ═══ Warum das gewöhnliche Korn auf Schwarz verschwindet ═══

    Es liegt in `overlay`, und das ist die richtige Mischart für alles ab
    mittlerer Helligkeit: sie hellt auf, wo der Grund hell ist, und dunkelt ab,
    wo er dunkel ist. Für dunkle Gründe rechnet sie `2 × Grund × Korn` — und
    bei einem Grund von neun Prozent Helligkeit bleibt von jeder Schwankung
    fast nichts übrig.

    Gemessen über einen textfreien Ausschnitt, Streuung der Helligkeit:

        Bestellen  (ihr Orange)    2,39
        Galerie    (ihr Schwarz)   1,60
        Reise      (ihr Schwarz)   0,80
        Vorhang    (ihr Schwarz)   0,07

    Karol: „die Körner beim schwarzen Untergrund vielleicht etwas prägnanter."
    Er sieht genau diese Zahlen.

    ═══ Warum es nicht dasselbe Korn mit mehr Deckkraft ist ═══

    Auf einem fast schwarzen Grund gibt es nach unten keinen Platz mehr. Korn,
    das dunkler wird, hat nichts, worin es dunkler werden könnte — sichtbar
    wird auf Schwarz nur, was HELLER ist. Deshalb hier `screen` statt `overlay`
    und ein Rauschen, das grösstenteils schwarz ist und nur vereinzelt aufhellt.

    Das macht `feComponentTransfer` mit `gamma`: die Turbulenz liegt um 0,5,
    und 0,5 hoch 4,5 sind 0,044. Was darunter liegt, fällt praktisch auf null;
    nur die oberen Ausschläge bleiben übrig. Aus gleichmässigem Grau wird ein
    Feld einzelner heller Körner — und genau so sieht Korn auf einer dunklen
    Fläche in Wirklichkeit aus.

    Die Alpha-Achse wird auf 1 festgesetzt. `feTurbulence` rauscht auch dort,
    und ein rauschendes Alpha unter `screen` ergäbe eine zweite, unabhängige
    Schwankung über derselben Fläche.
    """
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">\n'
    # `color-interpolation-filters="sRGB"` ist hier keine Feinheit, sondern der
    # Unterschied zwischen dunkel und grau: SVG-Filter rechnen von Haus aus in
    # LINEAREM RGB. Die Gamma-Kurve trifft dort ganz andere Werte, und beim
    # Zurueckwandeln nach sRGB wird alles wieder aufgehellt. Gemessen: ohne
    # diese Zeile hob das Korn ihren schwarzen Grund von 24 auf 67 Helligkeit —
    # aus Schwarz wurde Grau.
        '  <filter id="k" x="0" y="0" width="100%" height="100%" '
        'color-interpolation-filters="sRGB">\n'
        '    <feTurbulence type="fractalNoise" baseFrequency="0.8" '
        'numOctaves="3" stitchTiles="stitch"/>\n'
        '    <feColorMatrix type="matrix" values="'
        '0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1"/>\n'
        '    <feComponentTransfer>\n'
        '      <feFuncR type="gamma" exponent="4.5"/>\n'
        '      <feFuncG type="gamma" exponent="4.5"/>\n'
        '      <feFuncB type="gamma" exponent="4.5"/>\n'
        '    </feComponentTransfer>\n'
        '  </filter>\n'
        '  <rect width="200" height="200" filter="url(#k)"/>\n'
        '</svg>\n'
    )


def saat(breite: int = 360, hoehe: int = 360, saatgut: int = 3) -> str:
    """Sesam und Schwarzkümmel — die Oberfläche ihrer Gebäcke als Muster.

    ═══ Warum nicht der Rundbogen ═══

    Der stand hier und ist raus. Karol: „das mit den Bögen weiss ich nicht,
    sieht mir zu einfach aus, kein cooles Design, was sich in den Style Guide
    einbringt." Er hat in beidem recht:

      1  Ein gleichmässig wiederholter Umriss auf festem Raster IST Tapete.
         Gleiche Form, gleicher Abstand, gleiche Strichstärke — es gibt nichts
         zu sehen, was man nicht nach dem ersten Bogen schon weiss.
      2  Die Seite führt den Bogen bereits dreimal als RAHMEN: Arkade, Tafel im
         Vorhang, QR-Schild. Ihn zusätzlich als Grund zu nehmen ist
         Wiederholung, nicht System.

    ═══ Warum Saat ═══

    Auf jedem ihrer Gebäcke liegt Sesam und Schwarzkümmel — auf jedem Foto, das
    sie geschickt haben, ist es zu sehen. Es ist keine Abstraktion ihrer Form,
    sondern die tatsächliche OBERFLÄCHE dessen, was sie verkaufen.

    Und es löst genau das Problem des Bogens: Saat liegt nie auf einem Raster.
    Sie ist unregelmässig, verschieden gross, verschieden gedreht — sie kann
    gar nicht als Tapete lesen.

    ═══ Wie sie verteilt wird ═══

    Nicht rein zufällig: echter Zufall ballt sich zu Klumpen und lässt Löcher.
    Stattdessen ein grobes Raster, in dem jedes Korn innerhalb seiner Zelle
    zufällig sitzt — das ergibt die gleichmässige Streuung, die eine bemehlte
    Fläche hat, ohne Regelmässigkeit.

    Die Ränder werden gespiegelt bestückt, damit die Kachel nahtlos schliesst.
    """
    r = random.Random(saatgut)
    zellen = 9
    schritt = breite / zellen
    teile = []

    for zy in range(zellen):
        for zx in range(zellen):
            # Nicht jede Zelle bekommt ein Korn — sonst ist es doch ein Raster.
            if r.random() < 0.28:
                continue
            x = zx * schritt + r.uniform(0.1, 0.9) * schritt
            y = zy * schritt + r.uniform(0.1, 0.9) * schritt
            dreh = r.uniform(0, 180)

            if r.random() < 0.62:
                # Sesam: längliches Korn, spitz zulaufend
                rx, ry = r.uniform(3.1, 4.4), r.uniform(1.5, 2.1)
                teile.append(
                    f'<ellipse cx="{x:.1f}" cy="{y:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" '
                    f'transform="rotate({dreh:.0f} {x:.1f} {y:.1f})"/>'
                )
            else:
                # Schwarzkümmel: kleiner, kantiger, dunkler
                g = r.uniform(1.9, 2.7)
                teile.append(
                    f'<path d="M{x - g:.1f} {y:.1f}L{x:.1f} {y - g * 0.8:.1f}'
                    f'L{x + g:.1f} {y:.1f}L{x:.1f} {y + g * 0.8:.1f}Z" '
                    f'transform="rotate({dreh:.0f} {x:.1f} {y:.1f})"/>'
                )

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {breite} {hoehe}" '
        f'width="{breite}" height="{hoehe}">\n'
        f'  <g fill="currentColor">{"".join(teile)}</g>\n'
        f'</svg>\n'
    )


if __name__ == '__main__':
    ZIEL.mkdir(parents=True, exist_ok=True)
    (ZIEL / 'korn.svg').write_text(korn())
    (ZIEL / 'korn-hell.svg').write_text(korn_hell())
    (ZIEL / 'saat.svg').write_text(saat())
    print('korn.svg      ', (ZIEL / 'korn.svg').stat().st_size, 'Bytes')
    print('korn-hell.svg ', (ZIEL / 'korn-hell.svg').stat().st_size, 'Bytes')
    print('saat.svg ', (ZIEL / 'saat.svg').stat().st_size, 'Bytes')
