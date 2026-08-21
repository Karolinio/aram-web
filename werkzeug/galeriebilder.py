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
from PIL import Image

# Nummern aus rohbilder/inventur.json, Reihenfolge = Reihenfolge in der Galerie.
AUSWAHL = [
    (19, 'Manakisch vom Blech', 'hoch'),
    ( 9, 'Fata’er, direkt aus der Glut', 'hoch'),
    ( 6, 'Der Teig kommt auf den Schieber', 'quer'),
    (12, 'Manakisch, kurz vor dem Ofen', 'hoch'),
    (35, 'Ein Brett für den Tisch', 'quer'),
    (21, 'Sesam und Schwarzkümmel', 'quer'),
    (10, 'Der Inhaber und seine Brüder', 'quer'),
]
BREITEN = [520, 900]

inv = {z['nr']: z['datei'] for z in json.load(open('rohbilder/inventur.json'))}
os.makedirs('public/bilder/galerie', exist_ok=True)
liste = []
for nr, titel, lage in AUSWAHL:
    im = Image.open('rohbilder/eingang/' + inv[nr]).convert('RGB')
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
