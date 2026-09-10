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

═══ Quadratisch, weil der Platz quadratisch ist ═══

`.zeile__bild` hat `aspect-ratio: 1`. Ein quadratischer Zuschnitt aus der Mitte
trifft bei seinen Aufnahmen das Produkt, weil er es beim Fotografieren mittig
gelegt hat — nachgemessen an allen sechs.

700 px, nicht 1400: der Platz ist 54 bis 74 px breit, und dasselbe Bild dient
der Grossansicht beim Antippen. 700 traegt beides und wiegt rund 70 kB.
"""
import json
import subprocess
from pathlib import Path

from PIL import Image

WURZEL = Path(__file__).parent.parent
ROH = WURZEL / 'rohbilder' / 'eingang' / 'neu-2026-09' / 'rest'
ZIEL = WURZEL / 'public' / 'bilder' / 'karte'
KANTE = 700

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


def quadrat(quelle: Path, ziel: Path) -> tuple[int, int]:
    zwischen = Path('/tmp') / (quelle.stem + '.jpg')
    subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '95',
                    str(quelle), '--out', str(zwischen)], capture_output=True, check=True)
    im = Image.open(zwischen).convert('RGB')
    k = min(im.size)
    x, y = (im.width - k) // 2, (im.height - k) // 2
    im.crop((x, y, x + k, y + k)).resize((KANTE, KANTE), Image.LANCZOS) \
      .save(ziel, 'WEBP', quality=80, method=6)
    return KANTE, KANTE


if __name__ == '__main__':
    ZIEL.mkdir(parents=True, exist_ok=True)
    karte = json.loads((WURZEL / 'inhalt' / 'speisekarte.json').read_text())
    gesetzt = 0
    for gruppe in karte:
        for g in gruppe['gerichte']:
            eintrag = ZUORDNUNG.get(g['name'])
            if not eintrag:
                continue
            datei, alt, sicherheit = eintrag
            name = g['name'].lower().replace('ß','ss').replace(', ','-').replace(' ','-') + '.webp'
            w, h = quadrat(ROH / datei, ZIEL / name)
            g['bild'] = {'quelle': f'/bilder/karte/{name}', 'alt': alt, 'breite': w, 'hoehe': h}
            kb = (ZIEL / name).stat().st_size // 1024
            print(f"{str(g.get('nr','—')):>3} {g['name']:<22} {datei:<18} {kb:>3} kB  ({sicherheit})")
            gesetzt += 1
    (WURZEL / 'inhalt' / 'speisekarte.json').write_text(
        json.dumps(karte, ensure_ascii=False, indent=1) + '\n')
    print(f'\n{gesetzt} von 22 Gerichten haben jetzt ein Bild.')
