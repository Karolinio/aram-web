# Bildwerkzeug

Vier kleine Programme, die aus den Fotos des Inhabers brauchbare Freisteller
machen. Sie laufen in `.venv-bild` (Python 3.11 — für 3.14 gibt es kein
`onnxruntime`, und ohne das läuft rembg nicht).

```bash
python3.11 -m venv .venv-bild
.venv-bild/bin/pip install "rembg[cpu]" pillow numpy scipy
.venv-bild/bin/python werkzeug/freistellen.py 21 15 33   # Bildnummern aus rohbilder/inventur.json
.venv-bild/bin/python werkzeug/kanten.py
.venv-bild/bin/python werkzeug/ernten.py
.venv-bild/bin/python werkzeug/schaufenster.py
```

## Warum sie MESSEN und nicht nur schneiden

Weil ein Freisteller auf den ersten Blick immer gut aussieht. Erst die Zahlen
sagen, ob er trägt:

**Randkontakt.** Berührt das Motiv den Bildrand, ist es angeschnitten — dann ist
es ein Zuschnitt und kein Freisteller. `fatayer-frei.webp` heisst „frei", das
Blech berührt aber x=0 und x=999. Das ist erst aufgefallen, als der geplante
3D-Effekt daran gescheitert ist.

**Welche Kante.** Zusammengezählt ist die Zahl unbrauchbar. Ein Gebäck, das
UNTEN aus dem Bild läuft, kann fliegen — es taucht von unten auf, und niemand
vermisst, was nie zu sehen war. Links und rechts angeschnitten ist echter
Substanzverlust, und jede Drehung zeigt es.

**Füllgrad.** Wieviel des umschliessenden Rechtecks wirklich Motiv ist. Unter
0,35 ist es meist ein Schatten, der zwei Stücke verbindet, oder eine Kette aus
Krümeln.

## Der eigentliche Hebel: `ernten.py`

Die Fotos zeigen fast nie EIN Gebäck, sondern ein Blech voll. Als Ganzes ist so
ein Bild für eine Flugbahn unbrauchbar — die einzelnen Stücke darin sind genau
das, was gebraucht wird. Zusammenhängende Gebiete im Alphakanal sind
Gegenstände. Aus einem unbrauchbaren Gruppenfoto werden so acht brauchbare
Freisteller.

## `schaufenster.py`

Legt alle Freisteller auf eine Seite, jeden auf ein Schachbrett. Auf einer
einfarbigen Fläche sieht man einen grauen Saum nicht; auf dem Schachbrett fällt
jeder Rest vom Hintergrund sofort auf. Gedacht zum Prüfen durch einen Menschen —
und als Ausweg, wenn die Bildübertragung mal keine Bilder durchlässt.
