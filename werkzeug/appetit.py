"""Die Freisteller sehen aus wie Steine. Das ist messbar, und es ist behebbar.

═══ Der Befund ═══

Karol am 01.09.: „die Elemente von Aram sind scheisse, ich will wie bei
Lahmacun oder bei dem grossen Käseschiff, dass die Produkte dampfen und
zumindest richtig lecker aussehen. Das sieht aus wie unappetitliche Steine."

Gemessen über die undurchsichtigen Pixel der neun Freisteller:

    Gebaeck                Saettigung   Mikrokontrast
    schwarm-teig                 19,3            1,8
    schwarm-teig-paar            18,0            1,2
    schwarm-sesam                70,9            1,3
    ------------------------------------------------
    alle uebrigen           63 bis 67     5,8 bis 11,3

Der Schnitt liegt sauber: drei Stuecke unter 2, alle anderen ueber 5,8. Das
ist kein Geschmacksurteil, das ist eine Luecke um den Faktor drei.

Was einen Gegenstand appetitlich macht, sind genau zwei Dinge, und beide
fehlen den drei: OBERFLAECHE — Krume, Sesam, Blasen, Roestung — und GLANZ,
das Licht, das sich im Fett und im Eistrich spiegelt. Ohne beides bleibt eine
gleichmaessig gefaerbte Flaeche uebrig, und eine gleichmaessig gefaerbte
Flaeche in Beigegrau IST ein Stein.

═══ Warum das nichts erfindet ═══

Die drei Griffe hier sind Belichtung, kein Nachbau: lokaler Kontrast, Anhebung
der Lichter, Anhebung der Buntheit. Jeder davon steht in jedem Bildprogramm
und macht sichtbar, was im Bild schon liegt. Es kommt kein Sesamkorn dazu,
das nicht fotografiert wurde.

Was NICHT behebbar war: roher Teig. Er hat weder Roestung noch Glanz, weil er
weder gebacken noch bestrichen ist. Ein blasser grauer Klumpen ist nicht
schlecht fotografiert, er ist ein blasser grauer Klumpen. Die beiden rohen
Teigschiffchen sind deshalb aus dem Schwarm heraus und durch zwei fertige
Gebaecke aus demselben Materialstapel ersetzt.
"""
import pathlib
import numpy as np
from PIL import Image, ImageFilter

Z = pathlib.Path('public/bilder/echt')

KLARHEIT = 0.55   # wie stark die Oberflaeche herausgearbeitet wird
GLANZ = 0.14      # wie weit die obersten Lichter angehoben werden
BUNT = 1.16       # Faktor auf den Abstand zur eigenen Helligkeit


def veredeln(pfad: pathlib.Path) -> dict:
    im = Image.open(pfad).convert('RGBA')
    a = np.asarray(im).astype(np.float64)
    maske = a[..., 3] > 200
    if maske.sum() < 500:
        return {}
    rgb = a[..., :3]

    # 1 KLARHEIT — Unschaerfemaske auf der Helligkeit, nicht auf der Farbe.
    #   Auf der Farbe erzeugt sie Farbsaeume; auf der Helligkeit bringt sie
    #   Krume und Koerner zurueck. Der Radius haengt an der Bildgroesse, sonst
    #   wirkt derselbe Wert auf einem kleinen Bild wie ein Holzschnitt.
    lum = 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
    radius = max(1.5, min(im.size) * 0.012)
    weich = np.asarray(
        Image.fromarray(lum.astype('uint8')).filter(ImageFilter.GaussianBlur(radius))
    ).astype(np.float64)
    zuwachs = KLARHEIT * (lum - weich)
    rgb = rgb + zuwachs[..., None]

    # 2 GLANZ — nur die obersten Lichter, und die dritte Potenz sorgt dafuer,
    #   dass die Mitten unberuehrt bleiben. Frisch aus dem Ofen glaenzt die
    #   Kruste; ohne diese Spiegelung liest sie sich als Putz.
    l2 = np.clip((0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]) / 255, 0, 1)
    hebe = GLANZ * l2 ** 3 * 255
    rgb = rgb + hebe[..., None]
    # Der Glanz eines Backofens ist warm, nicht neutral.
    rgb[..., 0] += hebe * 0.25
    rgb[..., 2] -= hebe * 0.25

    # 3 BUNTHEIT — der Abstand zur eigenen Helligkeit wird gedehnt. Das hebt
    #   Tomate, Petersilie und Roestung, ohne den Teig einzufaerben: was
    #   farblos ist, hat keinen Abstand und bleibt farblos.
    l3 = 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]
    rgb = l3[..., None] + (rgb - l3[..., None]) * BUNT

    a[..., :3] = np.clip(rgb, 0, 255)
    Image.fromarray(a.astype('uint8'), 'RGBA').save(pfad, 'WEBP', quality=88, method=6)

    fertig = np.clip(rgb, 0, 255)[maske]
    mx, mn = fertig.max(1), fertig.min(1)
    g = Image.fromarray(np.clip(l3, 0, 255).astype('uint8'))
    mu = np.asarray(g.filter(ImageFilter.BoxBlur(3))).astype(np.float64)
    return {'saett': float(np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0).mean() * 100),
            'mikro': float(np.abs(np.clip(l3, 0, 255) - mu)[maske].mean())}
