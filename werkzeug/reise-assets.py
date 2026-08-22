"""Die Gegenstaende fuer die Reise — und der Bruch.

═══ Warum das Schiff hier zerschnitten wird und nicht im Browser ═══

Ein Gebaeck, das aufbricht, braucht eine BRUCHKANTE. Zwei Haelften, die an
einer geraden Linie getrennt sind, sehen aus wie zerschnitten — und
zerschnittenes Gebaeck ist etwas anderes als gebrochenes. Der Unterschied ist
die Kante: eine gebrochene laeuft unregelmaessig, mit kleinen Ausbruechen.

Im Browser ginge das nur ueber `clip-path` mit einer handgeschriebenen
Polygonkette, die bei jeder Bildgroesse anders aussieht. Hier entsteht sie
einmal, im Bild, mit dem Alphakanal — und ist damit auf jeder Groesse dieselbe.

Die Kante wird aus einer gedaempften Zufallsfolge gebaut: jeder Schritt haengt
vom vorigen ab. Reiner Zufall je Zeile ergaebe eine Saege, kein Bruch.
"""
import numpy as np
from PIL import Image
import os, json

AUS = 'public/bilder/reise'
os.makedirs(AUS, exist_ok=True)

def sichern(im, name, breite):
    k = im.copy()
    k.thumbnail((breite, breite * 3), Image.LANCZOS)
    p = f'{AUS}/{name}.webp'
    k.save(p, 'WEBP', quality=84, method=6)
    return p, k.size, os.path.getsize(p) // 1024

def zuschneiden(im):
    a = np.array(im)[:, :, 3] > 40
    ys, xs = np.where(a)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

def brechen(im, streuung=0.05, glaette=0.82):
    """Zwei Haelften mit gemeinsamer, unregelmaessiger Bruchkante."""
    w, h = im.size
    rng = np.random.default_rng(4711)          # fest, damit der Bruch reproduzierbar ist
    schritt = rng.normal(0, w * streuung * 0.35, h)
    kante = np.zeros(h); lauf = 0.0
    for y in range(h):
        lauf = glaette * lauf + (1 - glaette) * schritt[y] * 6
        kante[y] = w / 2 + lauf
    xs = np.arange(w)[None, :]
    links_maske = xs < kante[:, None]
    a = np.array(im)
    li = a.copy(); li[:, :, 3] = np.where(links_maske, li[:, :, 3], 0)
    re = a.copy(); re[:, :, 3] = np.where(~links_maske, re[:, :, 3], 0)
    return zuschneiden(Image.fromarray(li)), zuschneiden(Image.fromarray(re))

# EIN Gegenstand, nicht drei. Karol nach dem Ansehen der Freisteller: „nichts
# davon geeignet ... das Käseschiff sollte XL grossflächig als EINZELNE
# Animation eingesetzt werden." Die Scheibe und der Fatayer sind deshalb raus.
#
# QUELLE HIER TAUSCHEN, sobald das Foto aus ABLICHTUNG.md da ist. Sonst ändert
# sich nichts — die Zeitleiste in Reise.tsx bleibt, wie sie ist.
# Am 22.08. getauscht: nicht mehr der Freisteller aus einem WhatsApp-Foto,
# sondern ein erzeugtes Bild — auf Karols ausdrückliche Anweisung („nutze
# higgsfield mcp um das riesen käseschiff teilbare animation").
#
# Es ist gegen DIESELBEN fünf Bedingungen geprüft worden, die ABLICHTUNG.md vom
# Inhaber verlangt (werkzeug/kandidat-pruefen.py). Ergebnis für diesen
# Kandidaten: Randkontakt 0,00 %, ein zusammenhängendes Teil, Trennung 64,
# Grundruhe 30,0, Schärfe 1709 — der schärfste von drei.
#
# Es bleibt erzeugtes Essen. Sobald das echte Foto aus ABLICHTUNG.md da ist,
# wird hier eine Zeile getauscht und sonst nichts.
QUELLE = '../erzeugt/schiff-b-frei.png'

liste = {}
schiff = zuschneiden(Image.open('rohbilder/frei/' + QUELLE).convert('RGBA'))
p, g, kb = sichern(schiff, 'schiff', 1100)
liste['schiff'] = dict(breite=g[0], hoehe=g[1])
print(f'  {"schiff":16} {g[0]:>4}x{g[1]:<4} {kb:>3} kB   aus {QUELLE}')

li, re = brechen(schiff)
for teil, bild in (('schiff-links', li), ('schiff-rechts', re)):
    p, g, kb = sichern(bild, teil, 700)
    liste[teil] = dict(breite=g[0], hoehe=g[1])
    print(f'  {teil:16} {g[0]:>4}x{g[1]:<4} {kb:>3} kB')

# Probe: zusammen muessen die Haelften so viel Deckung haben wie das Ganze
gz = (np.array(schiff)[:, :, 3] > 40).sum()
hz = sum((np.array(b)[:, :, 3] > 40).sum() for b in (li, re))
print(f'\nDeckungsprobe: ganz {gz}, beide Hälften {hz} — Abweichung {abs(gz-hz)/gz*100:.2f} %')
json.dump(liste, open('inhalt/reise.json', 'w'), indent=1)
