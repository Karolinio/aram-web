"""Das Ofenmaul — aus IHREM Foto, nicht erzeugt.

Karol wollte fuer die Ofenanimation Higgsfield einsetzen. Fuer die Teigstufen
war das richtig: die gibt es nicht als Aufnahme, und Mehl und Teig sind
Material ohne erkennbaren Ort.

Fuer den Ofen waere es falsch. Der Ofen IST ihr Laden — und dafuer steht die
Regel, die seit Beginn dieses Auftrags gilt: niemals ihr Laden aus dem
Modell. Es braucht ihn auch nicht: Galeriefoto 09 zeigt genau, was gesucht ist
— ein gemauerter Bogen, fast frontal, dahinter blau-rosa Flammen.

Beschnitten wird auf den Bogen; das Blech mit den Fata'er unten faellt weg, es
wuerde im Vordergrund einer Animation nur stoeren. Unten laeuft eine weiche
Blende in die Nachtfarbe der Sektion, damit das Rechteck nicht als Rechteck
endet.
"""
import numpy as np
from PIL import Image
import os, json

QUELLE = 'public/bilder/galerie/09.webp'
AUS = 'public/bilder/reise'
os.makedirs(AUS, exist_ok=True)

im = Image.open(QUELLE).convert('RGB')
print(f'Quelle {im.size}')

# Der Bogen sitzt im oberen Bilddrittel. Unterhalb 610 beginnt das Blech.
BIS = 600
k = im.crop((0, 0, im.width, BIS))

# ═══ Weiche Blende an ALLEN vier Kanten ═══
#
# Der erste Anlauf blendete nur nach unten aus. Sichtbar war dadurch ein Foto
# mit drei harten Kanten auf schwarzem Grund — ein aufgeklebtes Rechteck, kein
# Ofen. Ein Bild, das in einer Flaeche verschwinden soll, muss an jeder Seite
# verschwinden, an der es die Flaeche beruehrt.
#
# Die Blende ist nicht ueberall gleich: oben faellt sie kurz (dort steht der
# Bogen, und der soll als Bogen lesbar bleiben), unten lang (dort geht das Bild
# in die Sektion ueber), seitlich mittel.
k = k.convert('RGBA')
a = np.array(k).astype(np.float32)
h, w = a.shape[:2]

def blende(n, vorn, hinten, haerte=1.3):
    """1 in der Mitte, 0 an den Raendern — `vorn`/`hinten` als Anteil."""
    v = np.ones(n, dtype=np.float32)
    kv, kh = int(n * vorn), int(n * hinten)
    if kv: v[:kv] = np.linspace(0, 1, kv) ** haerte
    if kh: v[n - kh:] = np.linspace(1, 0, kh) ** haerte
    return v

a[:, :, 3] *= blende(h, 0.09, 0.26)[:, None]
a[:, :, 3] *= blende(w, 0.16, 0.16)[None, :]
k = Image.fromarray(a.clip(0, 255).astype(np.uint8))

# Eine Spur dunkler und kuehler: das Foto ist mit Blitz aufgenommen und im
# Ziegel deutlich waermer als der Rest der Seite. Ungedaempft leuchtet der
# Bogen staerker als das Feuer darin, und das Feuer ist der Punkt.
d = np.array(k).astype(np.float32)
d[:, :, :3] *= 0.82
k = Image.fromarray(d.clip(0, 255).astype(np.uint8))

k.thumbnail((1100, 1100), Image.LANCZOS)
p = f'{AUS}/ofen-maul.webp'
k.save(p, 'WEBP', quality=82, method=6)
print(f'  ofen-maul  {k.size}  {os.path.getsize(p)//1024} kB')

# Wo im Bild liegt das Maul? Die Animation muss wissen, wohin das Schiff faellt.
# Gesucht ist der dunkelste zusammenhaengende Bereich im oberen Zweidrittel.
g = np.array(k.convert('L')).astype(np.float32)
oben = g[: int(g.shape[0] * 0.66)]
dunkel = oben < np.percentile(oben, 26)
ys, xs = np.where(dunkel)
mitte_x = xs.mean() / k.width
mitte_y = ys.mean() / k.height
print(f'  Maulmitte  x {mitte_x*100:.1f} %   y {mitte_y*100:.1f} %  der Bildhöhe')

masse = json.load(open('inhalt/reise.json'))
masse['ofen-maul'] = dict(breite=k.width, hoehe=k.height,
                          maulX=round(mitte_x, 3), maulY=round(mitte_y, 3))
json.dump(masse, open('inhalt/reise.json', 'w'), indent=1)
