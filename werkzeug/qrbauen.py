"""Einen QR-Code als SVG erzeugen — scharf in jeder Groesse, in ihren Farben.

Warum SVG und kein Bild: ein QR ist ein Raster aus Quadraten. Als PNG muss man
sich fuer eine Groesse entscheiden und verliert bei jeder anderen Kanten; als
Pfad ist er bei 32 px und auf einem Plakat gleich scharf und kostet 2 kB.

Warum Fehlerkorrektur H (30 %): damit spaeter ein Zeichen in die Mitte gesetzt
werden kann, ohne dass der Code aufhoert zu funktionieren. Ohne das waere jede
Verzierung ein Risiko.

`currentColor` statt eines festen Werts — derselbe Code traegt auf ihrem
Schwarz wie auf ihrem Orange.

Aufruf:
  python3 werkzeug/qrbauen.py <ziel-url> > public/bilder/marke/qr-karte.svg
"""
import sys
import qrcode


def bauen(ziel: str) -> str:
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=1,
        border=2,   # Ruhezone. Weniger als 2 Module und Scanner geben auf.
    )
    qr.add_data(ziel)
    qr.make(fit=True)
    m = qr.get_matrix()
    n = len(m)

    # Ein einziger Pfad aus allen dunklen Modulen. Ein Rechteck je Modul waere
    # dasselbe Bild und das Zehnfache an Bytes.
    teile = []
    for y, zeile in enumerate(m):
        for x, an in enumerate(zeile):
            if an:
                teile.append(f'M{x} {y}h1v1h-1z')

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {n} {n}" '
        f'shape-rendering="crispEdges" aria-hidden="true">\n'
        f'  <path fill="currentColor" d="{"".join(teile)}"/>\n'
        f'</svg>\n'
    )


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('Aufruf: python3 werkzeug/qrbauen.py <ziel-url>')
    sys.stdout.write(bauen(sys.argv[1]))
