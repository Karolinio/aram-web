"""Die Galeriebilder aufbereiten.

KEINE Freisteller. Karol am 21.08.: „die ganzen Bilder, wo mehrere Stücke dran
sind, sind alle ungeeignet, ausser Nummer 19."

Er hat recht, und der Grund ist nicht die Qualitaet des Freistellens. Ein
Freisteller nimmt einem Foto den ORT. Bei einem einzelnen Gericht ist das ein
Gewinn — es schwebt dann. Bei einem Blech voller Gebaeck vor einem Kuppelofen
nimmt es dem Bild genau das, was es sehenswert macht: das Feuer dahinter, die
Steine, den Schieber. Uebrig bleibt eine Ansammlung brauner Formen.

Fuer eine Galerie gilt deshalb das Umgekehrte: das ganze Foto, gut
beschnitten.
"""
import json, os
from PIL import Image, ImageOps

# ═══ Keine Einzelprodukte in dieser Galerie ═══
# Karol am 13.09.: „ich will in der oberen Galerie kein einziges
# Einzelproduktfoto, weil dafuer haben wir die untere Galerie aufgestellt …
# es sind halt viele Kaeseschiff-Bilder." Raus sind deshalb 9 (Fata'er auf
# dem Schieber), 21 (ein Sesambrot), 41 (eine Zaatar-Platte), 51 (Sesambrote),
# 52 (ein Teller), 53 (ein Kaese-Quadrat) und 6 (Haende am Teig — dasselbe
# Foto traegt schon Bogen 02). Rein sind die Strasse, die Brueder vor der
# Tuer und zwei volle Bleche. Die Reihenfolge ist ein Morgen: Strasse, Tuer,
# Ofen, Bleche, Tisch.
#
# Nummern < 50: rohbilder/inventur.json (Lieferung 20.08.).
# Nummern >= 50: rohbilder/eingang/neu-2026-09/ (Lieferung 10.09.), Datei steht dabei.
AUSWAHL = [
    (54, 'Rochusstraße 246, von der Straße', 'hoch', 'neu-2026-09/F94B8E56-04FE-4CD5-86CA-E26C2A8C8EEF.JPG'),
    ( 5, 'Die Brüder vor der Tür', 'hoch', None),
    (10, 'Der Inhaber und seine Brüder', 'quer', None),
    (12, 'Manakisch, kurz vor dem Ofen', 'hoch', None),
    (50, 'Frisch vom Schieber, direkt vor dem Ofen', 'hoch', 'neu-2026-09/IMG_5804.JPG'),
    (40, 'Ein Blech Lahmacun, gerade aus dem Ofen', 'quer', None),
    (33, 'Ein Blech Käsegebäck', 'hoch', None),
    (38, 'Bleche voll, bevor der erste Gast kommt', 'quer', None),
    (19, 'Manakisch vom Blech', 'hoch', None),
    (35, 'Ein Brett für den Tisch', 'quer', None),
]
BREITEN = [520, 900]

inv = {z['nr']: z['datei'] for z in json.load(open('rohbilder/inventur.json'))}
os.makedirs('public/bilder/galerie', exist_ok=True)
liste = []
for nr, titel, lage, quelle in AUSWAHL:
    pfad = 'rohbilder/eingang/' + (quelle or inv[nr])
    # exif_transpose: die Handyfotos tragen ihre Drehung im EXIF, nicht in
    # den Pixeln — ohne das liegt ein Hochkantfoto quer.
    im = ImageOps.exif_transpose(Image.open(pfad)).convert('RGB')
    w, h = im.size
    # Auf ein festes Verhaeltnis beschneiden, mittig — eine Galerie mit sieben
    # verschiedenen Verhaeltnissen ist keine Galerie, sondern ein Stapel.
    ziel = 3/4 if lage == 'hoch' else 4/3
    if w/h > ziel:
        neu = int(h*ziel); im = im.crop(((w-neu)//2, 0, (w-neu)//2+neu, h))
    else:
        neu = int(w/ziel); im = im.crop((0, (h-neu)//2, w, (h-neu)//2+neu))
    for b in BREITEN:
        k = im.copy(); k.thumbnail((b, b*3), Image.LANCZOS)
        name = f'public/bilder/galerie/{nr:02d}{"" if b==BREITEN[-1] else "-klein"}.webp'
        k.save(name, 'WEBP', quality=80, method=6)
    gross = Image.open(f'public/bilder/galerie/{nr:02d}.webp')
    liste.append(dict(nr=nr, titel=titel, lage=lage, breite=gross.width, hoehe=gross.height,
                      kb=os.path.getsize(f'public/bilder/galerie/{nr:02d}.webp')//1024))
    print(f'  {nr:>2}  {lage:5}  {gross.width}x{gross.height}  {liste[-1]["kb"]:>3} kB  {titel}')
json.dump(liste, open('inhalt/galerie.json','w'), ensure_ascii=False, indent=1)
print(f'\nGesamt {sum(l["kb"] for l in liste)} kB in der grossen Fassung')
