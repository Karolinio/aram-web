# Bewegung — die Regeln, nach denen sich auf dieser Seite etwas bewegt

Diese Datei ist entstanden, weil Karol am 24.08.2026 gesagt hat, das Design sei
„nicht konsistent". Beim Nachmessen war das keine Geschmacksfrage, sondern
zählbar: fünf Schattenrezepte, vier Fluchtpunkte, vier Nachlaufwerte. Jede
Zahl für sich vertretbar, zusammen kein Raum.

Wer hier etwas hinzufügt, hält sich an diese fünf Regeln oder ändert sie hier.

---

## 1. Ein Licht

Alles Freigestellte wirft **denselben** Schatten: `--schatten-speise`, definiert
in `tokens.css`. Das Licht kommt von links oben, der Wurf fällt nach unten.

Der Massstab kommt vom Gegenstand, nicht vom Rezept:

| Gegenstand | `--wurf` |
|---|---|
| Gebäck im Schwarm | 1 |
| Ladenfoto (liegt flach) | 0,75 |
| Käseschiff | 1,6 (Handy 1,05) |
| Vorhang-Scheibe | 2,4 |

Auf dunklem Grund vertieft `.sektion--nacht` den **Ton**, nicht das Rezept —
ein Schatten in Clay-Braun ist auf Schwarz unsichtbar. Das ist Physik, keine
Ausnahme.

**Die eine echte Ausnahme:** das Ladenschild im Hero trägt zehn gestapelte
`drop-shadow`-Durchgänge. Das ist kein Wurf, sondern eine Prägung — ein
Aufkleber-Effekt am Logo, kein Gegenstand im Raum.

## 2. Ein Fluchtpunkt

`--flucht: 1500px`, `--flucht-punkt: 50% 44%`. Vier Sektionen teilen ihn:
Handarbeit, Galerie, Schiffbahn, Vorhang.

Der Ursprung liegt über der Mitte, weil der Blick auf einer Seite dort ruht.

**Ausnahme:** `.schild-neigung` im Hero steht auf 900 px. Das Logo ist ein
NAHES Objekt direkt unter dem Zeiger; derselbe Fluchtpunkt wie für ein Gebäck
drei Meter weiter wäre falsch.

## 3. Zwei Nachlaufwerte, jeder mit einer Regel

| | Wert | Wofür |
|---|---|---|
| `SCRUB_FLAECHE` | `true` | Bilder und Gründe. Sie sind Grund, kein Gegenstand — ein Nachlauf macht sie zu etwas, das hinterherrutscht. |
| `SCRUB_KOERPER` | `0.4` | Freigestellte Dinge im Raum. Masse heisst Trägheit. |

Gemessen: bei 0,35 kommen 52 % der Bewegung in den ersten 100 ms an, bei 1,0
nur 16 %. Beides steht in `bewegung.ts`.

## 4. Zwei Arten von Bewegung, nie vermischt

**Ereignis** — läuft einmal ab, hat eine Kurve (`expo.out`), gehört
Überschriften. Siehe `Auftritt.tsx`.

**Zustand** — hängt am Scroll, `ease: 'none'`, läuft rückwärts mit. Alles
andere. Eine Kurve auf einer gescrubbten Leiste kämpft gegen den Daumen und
liest sich als Verzögerung.

## 5. Gerechnet nur dort, wo es kein Foto geben kann

Dampf, Mehl und Funken sind gerechnet, weil es von ihnen keine brauchbare
Aufnahme gibt — und weil sie keine Form haben, die man wiedererkennt.

Käse hat eine. Die Käsefäden waren gerechnet: gefüllte Bänder mit
Einschnürung, Durchhang und gestaffelten Reisspunkten, physikalisch richtig
und trotzdem als Zeichnung erkennbar — weil daneben ein FOTOGRAFIERTES Gebäck
lag. Dasselbe galt für die Käsetropfen, die ich dreimal nachgebessert habe,
jedes Mal messbar besser und keinmal gut.

Beide sind durch Fotografien ersetzt (`werkzeug/kaesriss.py`). Die Regel für
alles Weitere:

> Eine gerechnete Zeichnung neben einem fotografierten Gegenstand verliert
> immer. Wenn es das Ding fotografieren lässt, wird es fotografiert.

`Kaesefaeden.tsx` und `Kaesetropfen.tsx` bleiben liegen — über einer Fläche
ohne Foto wären sie richtig.

## 6. Überlagerung: komponiert ja, zufällig nein

Bei **Eat Hungry Tiger** (Mobbin) verdeckt das Produkt einen Buchstaben der
Schlagzeile. Genau das macht aus einem Bild in einem Kasten einen Gegenstand im
Raum — und es ist der Grund, warum der Vorhang seine Schlagzeile HINTER der
Scheibe trägt.

Es gilt aber nur, wo die Lage **feststeht**. Das fliegende Käseschiff überlagert
zufällig — was gerade darunter liegt, entscheidet der Scrollstand. Deshalb ist
seine Bahn ausdrücklich so gewählt, dass sie Überschriften MEIDET
(`Kaeseschiff.tsx`, die Fenster im Kopf der Datei).

Komponierte Überlagerung ist Tiefe. Zufällige ist ein Fehler.

---

## Woran man merkt, dass es reisst

Wenn jemand sagt „irgendwas stimmt nicht, ich weiss nicht was" — dann ist meist
eine dieser fünf Regeln an einer Stelle gebrochen. Zuerst zählen, dann urteilen:

```bash
grep -n "drop-shadow(0 [0-9]" src/stile/*.css   # sollte nur das Ladenschild finden
grep -n "perspective:" src/stile/*.css          # sollte nur var(--flucht) und 900px finden
grep -rn "scrub:" src/                          # sollte nur SCRUB_* finden
```
