"""
Kartenbilder — seine Aufnahmen als Vorschaubilder in der Speisekarte.

Karol am 10.09.: „gucke wie wir die einzel bilder in die speisekarte mit
einbauen können sodass kunden direkt sehen können was sie bestellen wollen."

═══ Warum nur einige Gerichte ein Bild bekommen ═══

Bei DoorDash (Mobbin) hat NICHT jede Zeile ein Foto, und die Zeile ohne sieht
nicht kaputt aus. Genau so ist die Karte hier schon gebaut: `bild` ist
optional, und ohne wird kein Platz reserviert.

Das ist hier keine Stilfrage, sondern eine Wahrheitsfrage. Karol am 10.09.: „Versuch mal, logisch alles abzuleiten: ueberall ein
Produktbild daneben." Und dazu: „wir gucken noch mal mit dem Chef nachher
drueber."

Das aendert die Rechnung. Eine gefuellte Karte, die der Inhaber korrigiert, ist
mehr wert als eine leere mit Fragen daneben — an einem Bild sieht er in einer
Sekunde, ob es stimmt. Zugeordnet wird deshalb ALLES, was sich begruenden
laesst, mit der Sicherheit dabei:

    sicher          Merkmal und Beschreibung decken sich eindeutig
    wahrscheinlich  ein starkes Merkmal passt, der Rest ist Schluss
    vermutet        muss er bestaetigen

Sechs Gerichte bleiben ohne Bild, weil es zu ihnen keine eigene Aufnahme gibt
(Beirut, Spinat, Mexicano Roll, Sucuk, Sucuk mit Kaese, Gemuese Kaese). Zwei
Namen dasselbe Foto zu geben waere kein Fuellen, sondern eine Falschaussage.

═══ QUER, nicht quadratisch ═══

Hier wurde quadratisch aus der Mitte geschnitten, weil `.zeile__bild` quadratisch
ist. Das war ein Fehlschluss: das Vorschaubild ist 54 bis 74 px klein, aber
dieselbe Datei wird beim Antippen GROSS gezeigt — und dort fehlte dann, was der
quadratische Zuschnitt weggenommen hatte.

Karol am 10.09.: „man sieht leider nicht das gesamte Bild beziehungsweise das
gesamte Produkt … am besten auch nicht hochkant, sondern von links nach rechts
die Produkte."

Jetzt 4:3 quer, und das Produkt liegt ganz darin. Seine Aufnahmen sind hochkant
mit dem Gebäck in der Mitte; ein waagerechtes Band ueber die volle Breite
erwischt es vollstaendig. Der quadratische Ausschnitt fuer die Zeile macht
danach das Stilblatt (`object-fit: cover`) — dort schadet er nicht, weil dort
niemand das ganze Produkt sucht.

1000 x 750: das Vorschaubild braucht davon 150 px, die Grossansicht die vollen
1000. Rund 90 kB.
"""
import json
import subprocess
from pathlib import Path

from PIL import Image

WURZEL = Path(__file__).parent.parent
ROH = WURZEL / 'rohbilder' / 'eingang' / 'neu-2026-09' / 'rest'
ZIEL = WURZEL / 'public' / 'bilder' / 'karte'
BREIT, HOCH = 1000, 750

# Gebaecke, die in seiner Aufnahme senkrecht liegen: um 90 Grad drehen,
# damit sie im Querformat der Laenge nach liegen.
DREHUNG = {
    'Groß Käse, scharf': 90,
    'Frischkäse': -90,
    'Lange Käse': 90,
    # Karol am 12.09., am Mac: „nichts soll auf dem Kopf sein, alles logisch
    # von links nach rechts liegen." An vier Drehungen je Bild probiert:
    'Hackfleisch': 90,             # das Schiff stand senkrecht
    'Schaorma Roll': 90,           # die Rolle stand senkrecht; +90 legt die Schnitte nach oben
    'Lahmacun mit Zwiebeln': -90,  # hing rechts aus dem Bild; -90 bringt die ganze Scheibe rein
}

# Name auf ihrer Karte -> (Datei, Bildbeschreibung, wie sicher)
#
# Ueber den NAMEN und nicht ueber die Nummer: auf ihrer Karte steht die 22
# zweimal — „Lahmacun" und „Lahmacun mit Zwiebeln". Ueber die Nummer bekam die
# Zwiebelvariante das Foto der einfachen, und das ist ein anderes Gericht.
ZUORDNUNG = {
    # sicher — Merkmal und Beschreibung decken sich eindeutig
    'Zaatar':              ('IMG_1507 2.HEIC', 'Ein runder Fladen, dunkel mit Zaatar bestrichen und dicht mit Sesam bestreut', 'sicher'),
    'Toschka':             ('IMG_1527 2.HEIC', 'Ein runder Fladen mit Hackfleisch und vier Wuerfeln Hirtenkaese', 'sicher'),
    'Groß Käse, scharf':   ('IMG_1509 2.HEIC', 'Ein geschlossenes Schiffchen aus Teig mit Sesam und Schwarzkuemmel', 'seine Angabe'),
    'Lahmacun':            ('IMG_1535 2.HEIC', 'Ein Lahmacun, duenn ausgerollt und flaechig mit Hackfleisch belegt', 'sicher'),
    'Lahmacun mit Zwiebeln': ('IMG_1536 2.HEIC', 'Ein Lahmacun mit Hackfleisch, aus einem anderen Blickwinkel', 'sicher'),

    # wahrscheinlich — ein starkes Merkmal passt, der Rest ist Schluss
    'Muhammara':           ('IMG_1508 2.HEIC', 'Ein runder Fladen mit roter Paprikapaste und Sesam in der Mitte', 'wahrscheinlich'),
    'Lange Käse':          ('IMG_1511 2.HEIC', 'Eine lange schmale Teigrolle, mit Sesam bestreut', 'wahrscheinlich'),
    'Oliven':              ('IMG_1529 2.HEIC', 'Ein runder Fladen mit gruenen Oliven, Tomatenwuerfeln und Hirtenkaese', 'wahrscheinlich'),
    'Hackfleisch':         ('IMG_1515 2.HEIC', 'Ein offenes Schiffchen aus Teig, mit Hackfleisch gefuellt', 'wahrscheinlich'),
    'Groß Käse, Gemüse':   ('IMG_1531 2.HEIC', 'Ein runder Fladen mit Kaese, Oliven, Paprika und Tomate', 'wahrscheinlich'),

    # vermutet — muss der Inhaber bestaetigen
    'Doppelt Käse':        ('IMG_1523 2.HEIC', 'Ein quadratisch gefaltetes Gebaeck mit Kaese und Gemuese', 'vermutet'),
    'Schamiyeh':           ('IMG_1519 2.HEIC', 'Ein quadratisch gefaltetes Gebaeck mit Kaese und gruenen Kraeutern', 'vermutet'),
    'Frischkäse':          ('IMG_1513 2.HEIC', 'Eine geschlossene halbmondfoermige Teigtasche', 'vermutet'),
    'Schaorma Roll':       ('IMG_1505 2.HEIC', 'Eine gefuellte Teigrolle mit drei Einschnitten', 'vermutet'),
    'Fahita':              ('IMG_1525 2.HEIC', 'Ein runder Fladen mit Kartoffelwuerfeln, Paprika und Tomate', 'vermutet'),
    'Hackfleisch & Gemüse': ('IMG_1521 2.HEIC', 'Ein offenes Schiffchen mit Hackfleisch, aus einem anderen Blickwinkel', 'vermutet'),
}


def schluessel(name: str) -> str:
    """Ein Dateiname ohne Umlaute, ohne Ampersand, ohne Leerzeichen.

    ═══ Was ohne diese Funktion passiert ═══

    Erst hiessen die Dateien `lange-käse.webp` und `hackfleisch-&-gemüse.webp`.
    Lokal lief das; auf der Live-Adresse standen sie als
    `lange-k%C3%A4se.webp` in der Anfrage und kamen als 404 zurueck.

    Ein Dateiname, der ueber HTTP geht, haelt sich an ASCII. Das ist keine
    Vorsicht, sondern die Erfahrung, dass Umlaute irgendwo auf dem Weg
    zwischen Dateisystem, Git, Bau und Server einmal anders kodiert werden —
    und dann ist es still kaputt, weil ein 404 auf einem Bild keine
    Fehlermeldung erzeugt.
    """
    ersatz = {'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss', '&': 'und'}
    aus = ''.join(ersatz.get(z, z) for z in name.lower())
    aus = ''.join(z if z.isalnum() else '-' for z in aus)
    while '--' in aus:
        aus = aus.replace('--', '-')
    return aus.strip('-')


def querformat(quelle: Path, ziel: Path, dreh: int = 0) -> tuple[int, int]:
    zwischen = Path('/tmp') / (quelle.stem + '.jpg')
    subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '95',
                    str(quelle), '--out', str(zwischen)], capture_output=True, check=True)
    im = Image.open(zwischen).convert('RGB')
    # Ein paar Gebaecke liegen in seiner Aufnahme senkrecht im Bild. Karol:
    # „sonst kann man die leider nicht wegklicken, wenn die so nicht auf Kopf,
    # sondern auf links gedreht sind." Gedreht wird die QUELLE, nicht der
    # Zuschnitt — sonst schneidet das Band quer durch das Gebaeck.
    if dreh:
        im = im.rotate(dreh, expand=True)
    ziel_v = BREIT / HOCH
    if im.width / im.height > ziel_v:      # zu breit: an den Seiten beschneiden
        b = int(im.height * ziel_v)
        im = im.crop(((im.width - b) // 2, 0, (im.width - b) // 2 + b, im.height))
    else:                                   # zu hoch: ein Band aus der Mitte
        h = int(im.width / ziel_v)
        im = im.crop((0, (im.height - h) // 2, im.width, (im.height - h) // 2 + h))
    gross = im.resize((BREIT, HOCH), Image.LANCZOS)
    gross.save(ziel, 'WEBP', quality=80, method=6)
    # Kleine Fassung fuer die Produktgalerie und das Vorschaubild: dieselbe
    # Datei zweimal auszuliefern waere ein Megabyte fuer 150 px Anzeige.
    gross.resize((520, 390), Image.LANCZOS).save(
        ziel.with_name(ziel.stem + '-klein.webp'), 'WEBP', quality=78, method=6)
    return BREIT, HOCH


if __name__ == '__main__':
    ZIEL.mkdir(parents=True, exist_ok=True)
    karte = json.loads((WURZEL / 'inhalt' / 'speisekarte.json').read_text())
    gesetzt = 0
    galerie = []
    for gruppe in karte:
        for g in gruppe['gerichte']:
            eintrag = ZUORDNUNG.get(g['name'])
            if not eintrag:
                continue
            datei, alt, sicherheit = eintrag
            dreh = DREHUNG.get(g['name'], 0)
            name = schluessel(g['name']) + '.webp'
            w, h = querformat(ROH / datei, ZIEL / name, dreh)
            g['bild'] = {'quelle': f'/bilder/karte/{name}', 'alt': alt, 'breite': w, 'hoehe': h}
            kb = (ZIEL / name).stat().st_size // 1024
            print(f"{str(g.get('nr','—')):>3} {g['name']:<22} {datei:<18} {kb:>3} kB  ({sicherheit})")
            galerie.append({'datei': name.removesuffix('.webp'),
                            'titel': g['name'],
                            'nr': g.get('nr'),
                            'breite': w, 'hoehe': h})
            gesetzt += 1
    (WURZEL / 'inhalt' / 'speisekarte.json').write_text(
        json.dumps(karte, ensure_ascii=False, indent=1) + '\n')

    # ── Die Produktgalerie liest dieselben Dateien ──
    # Karol am 10.09.: „eine Galerie wäre auch, glaube ich, krass: nur mit
    # Produktbildern … so wie bei der Speisekarte, von links nach rechts."
    # Sie bekommt KEINE eigenen Dateien: dasselbe Bild zweimal auszuliefern
    # waere anderthalb Megabyte fuer nichts.
    (WURZEL / 'inhalt' / 'produktgalerie.json').write_text(
        json.dumps(galerie, ensure_ascii=False, indent=1) + '\n')
    print(f'\n{gesetzt} von 22 Gerichten haben jetzt ein Bild.')
    print(f'{len(galerie)} davon stehen auch in der Produktgalerie.')
