"""Die ganze Kette als BILDFOLGE — acht Aufnahmen statt einer Simulation.

    Teigkugel -> gewalzt -> belegt (roh) -> gebacken -> angerissen
              -> gezogen -> weit gezogen -> getrennt

═══ Warum das die gerechneten Kaesefaeden ersetzt ═══

Die Faeden waren gerechnet: gefuellte Baender mit Einschnuerung, Durchhang und
gestaffelten Reisspunkten. Physikalisch richtig, und sie sahen trotzdem nach
Zeichnung aus — weil daneben ein FOTOGRAFIERTES Gebaeck lag. Karol:
„Das Kaeseschiff muss echter aussehen … so als waere es echter Kaese. Keine
Demo."

Die Regel dieser Seite lautet ab hier: gerechnete Effekte NUR dort, wo es kein
Foto geben kann — Dampf, Mehl, Funken. Kaese gibt es fotografiert. Daneben
verliert jede Zeichnung. Dasselbe gilt fuer die Kaesetropfen, die aus demselben
Grund geflogen sind.

═══ Warum ein Rahmen aus der VEREINIGUNG ═══

Acht Zustaende desselben Gegenstands duerfen beim Ueberblenden nicht springen.
Einzeln zugeschnitten haette jeder seinen eigenen Bezugsrahmen. Es wird deshalb
EIN Rechteck gebildet, das alle umschliesst, und alle werden darauf gelegt.

Genau daran ist der erste Bau gescheitert: drei Bilder, drei Rahmen, ein Spalt
dazwischen, den niemand bestellt hatte.

═══ Kein Ei ═══

Karol: „Spiegelei habe ich nie was von gesagt. Die haben kein Kaeseschiff mit
Spiegelei." Keine der acht Stufen traegt eins. Wer eine neunte erzeugt, prueft
das nach, bevor er sie eintraegt.
"""
import os, json
import numpy as np
from PIL import Image
from rembg import remove, new_session

# Reihenfolge = Reihenfolge der Reise. `mass` ist die Breite des Gegenstands
# im Verhaeltnis zum gebackenen Schiff — Teig wird beim Walzen breiter, und
# eine Kugel ist keine Scheibe.
STUFEN = [
    ('stufe-1-kugel',   'rohbilder/ofen/k15-frei.png', 0.46),
    ('stufe-2-gewalzt', 'rohbilder/ofen/k13-frei.png', 1.00),
    ('stufe-3-belegt',  'rohbilder/riss/k41.png',      None),   # gleiche Aufnahmefolge
    ('stufe-4-gebacken','rohbilder/riss/k20.png',      None),
    ('riss-1',          'rohbilder/riss/k31.png',      None),
    ('riss-2',          'rohbilder/riss/k32.png',      None),
    ('riss-3',          'rohbilder/riss/k33.png',      None),
    ('riss-4',          'rohbilder/riss/k34.png',      None),
]

AUS = 'public/bilder/riss'
os.makedirs(AUS, exist_ok=True)
sitzung = new_session('isnet-general-use')


def freistellen(pfad):
    im = Image.open(pfad).convert('RGBA')
    if im.getextrema()[3][0] < 255:          # traegt schon einen Alphakanal
        a = im
    else:
        a = remove(im, session=sitzung)
    d = np.array(a)[:, :, 3]
    fest = d > 40
    rand = np.concatenate([fest[0], fest[-1], fest[:, 0], fest[:, -1]])
    ys, xs = np.where(fest)
    kasten = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    return a, kasten, rand.mean() * 100


roh = {}
for name, pfad, mass in STUFEN:
    a, kasten, randkontakt = freistellen(pfad)
    roh[name] = (a, kasten, mass)
    print(f'  {name:18} Randkontakt {randkontakt:5.2f} %   Inhalt '
          f'{kasten[2]-kasten[0]}x{kasten[3]-kasten[1]}')

# Der gemeinsame Rahmen kommt aus den Aufnahmen DERSELBEN Folge (mass is None).
folge = [k for k, (_, _, m) in roh.items() if m is None]
x0 = min(roh[k][1][0] for k in folge); y0 = min(roh[k][1][1] for k in folge)
x1 = max(roh[k][1][2] for k in folge); y1 = max(roh[k][1][3] for k in folge)
RB, RH = x1 - x0, y1 - y0
# Etwas Luft, damit die Faeden am Rand nicht angeschnitten werden
luft = int(RB * 0.03)
print(f'\nGemeinsamer Rahmen: {RB} x {RH} (+{luft} Luft)')

# Breite des GEBACKENEN Schiffs in diesem Rahmen — daran richten sich die
# Teigstufen aus, die aus einer anderen Aufnahmefolge stammen.
gk = roh['stufe-4-gebacken'][1]
SCHIFFBREITE = gk[2] - gk[0]

liste = {}
for name, _, mass in STUFEN:
    a, kasten, _ = roh[name]
    leinwand = Image.new('RGBA', (RB + 2 * luft, RH + 2 * luft), (0, 0, 0, 0))
    if mass is None:
        leinwand.paste(a.crop((x0 - luft, y0 - luft, x1 + luft, y1 + luft)), (0, 0))
    else:
        k = a.crop(kasten)
        ziel = round(SCHIFFBREITE * mass)
        k = k.resize((ziel, round(k.height * ziel / k.width)), Image.LANCZOS)
        leinwand.paste(k, ((leinwand.width - k.width) // 2,
                           (leinwand.height - k.height) // 2), k)
    leinwand.thumbnail((1500, 1500), Image.LANCZOS)
    p = f'{AUS}/{name}.webp'
    leinwand.save(p, 'WEBP', quality=86, method=4)
    liste[name] = dict(breite=leinwand.width, hoehe=leinwand.height)
    print(f'  {name:18} {leinwand.width}x{leinwand.height}  {os.path.getsize(p)//1024:>3} kB')

masse = set((v['breite'], v['hoehe']) for v in liste.values())
print(f'\nRahmenprobe: {len(masse)} Mass — {"alle gleich" if len(masse)==1 else "ABWEICHUNG"}')
json.dump(liste, open('inhalt/riss.json', 'w'), indent=1)
