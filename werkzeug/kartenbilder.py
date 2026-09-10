"""
Kartenbilder — seine Aufnahmen als Vorschaubilder in der Speisekarte.

Karol am 10.09.: „gucke wie wir die einzel bilder in die speisekarte mit
einbauen können sodass kunden direkt sehen können was sie bestellen wollen."

═══ Warum nur einige Gerichte ein Bild bekommen ═══

Bei DoorDash (Mobbin) hat NICHT jede Zeile ein Foto, und die Zeile ohne sieht
nicht kaputt aus. Genau so ist die Karte hier schon gebaut: `bild` ist
optional, und ohne wird kein Platz reserviert.

Das ist hier keine Stilfrage, sondern eine Wahrheitsfrage. Von seinen 38
Aufnahmen lassen sich nur einige EINDEUTIG einem Gericht zuordnen. Ein Foto
neben dem falschen Namen ist schlimmer als gar keins: der Gast bestellt danach.
Zugeordnet wird deshalb nur, was sich belegen laesst; der Rest steht in
rohbilder/eingang/neu-2026-09/KATALOG.md und wartet auf den Inhaber.

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
    'Zaatar':  ('IMG_1507 2.HEIC', 'Ein runder Fladen, dunkel mit Zaatar bestrichen und dicht mit Sesam bestreut', 'sicher'),
    'Toschka': ('IMG_1527 2.HEIC', 'Ein runder Fladen mit Hackfleisch und vier Wuerfeln Hirtenkaese', 'sicher'),
    'Groß Käse, scharf': ('IMG_1509 2.HEIC', 'Ein geschlossenes Schiffchen aus Teig mit Sesam und Schwarzkuemmel', 'sicher'),
    'Groß Käse, Gemüse': ('IMG_1529 2.HEIC', 'Ein runder Fladen mit gruenen Oliven, Tomatenwuerfeln und Scheiben Hirtenkaese', 'wahrscheinlich'),
    'Lahmacun': ('IMG_1535 2.HEIC', 'Ein Lahmacun, duenn ausgerollt und flaechig mit Hackfleisch belegt', 'sicher'),
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
