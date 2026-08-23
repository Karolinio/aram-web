# Stand · Aram

Wiedereinstieg. Alles, was eine neue Sitzung braucht, um ohne Rückfragen
weiterzubauen.

**Letzter Stand:** `HEAD` · **Zweig:** `main` · **Notiz vom:** 23.08.2026

---

## Was am 23.08. umgebaut wurde

**Das Käseschiff wohnt nicht mehr in einer Sektion.** Es liegt fest im Fenster
(`src/komponenten/Kaeseschiff.tsx`, `position: fixed`) und wird allein vom
Scrollfortschritt geführt — von der Oberkante der Handarbeit bis zur Unterkante
der Riss-Sektion, also über drei Sektionen. Die Bahn ist eine
**Wegpunkttabelle** (`BAHN`), keine Formel: jede Zeile ist eine Stelle auf der
Seite, jede Spalte eine Bewegung. Wer die Bahn ändern will, ändert Zahlen in
dieser Tabelle und sonst nichts.

**Die Wegpunkte sind nach den ÜBERSCHRIFTEN gewählt, nicht nach der Kurve.** Es
gibt drei Fenster, in denen das Schiff tief oder rechts stehen MUSS, weil sonst
eine Überschrift darunter liegt — sie stehen im Kopf der Datei. Wer neue
Sektionen einzieht oder Höhen ändert, muss diese Fenster nachrechnen.

**Der Riss kommt aus DEMSELBEN Fortschritt wie der Flug** (`RISS_AB`,
`RISS_BIS`). Ein zweiter ScrollTrigger dafür war der Fehler der Vorfassung: das
Gebäck war mitten in der Galerie schon halb offen.

**Raus sind:** der Öffnungsstatus aus der Kopfzeile, das Band unter der
Startseite samt Collage, der Satzblock unter dem Video. Oeffnung.tsx,
Collage.tsx und Auftritt.tsx bleiben im Bau — sie werden gebraucht.

**Drei Fehler, die nur eine Messung findet:**

- `justify-self` war bei den Hälften vertauscht — die Bruchkante zeigte nach
  aussen. Das war der Grund, warum das Schiff dreimal „falsch rum" aufging.
- Die Hälften waren einzeln auf ihren Inhalt zugeschnitten (696 / 692 / 1100 px)
  und passten deshalb nie zusammen. Sie tragen jetzt alle die volle Leinwand.
- Die Leinwände massen sich mit `getBoundingClientRect` — also in der
  TRANSFORMIERTEN Grösse. Im skalierten Schiff hiess das 158 px Speicher für
  eine Fläche, die bis 608 px wächst. Jetzt `offsetWidth`.

---

## ⚠ Dieses Repo hat KEINE Gegenstelle

`git remote -v` ist leer. Die gesamte Arbeit liegt **nur auf diesem Rechner**.
Keine Sicherung bei GitHub, in keiner Cloud, nirgends. Ein Festplattenschaden
kostet alles. Wenn eine Gegenstelle gewünscht ist: privates Repo anlegen, einmal
pushen — der Rest ist Routine.

## Loslegen

```bash
cd ~/dev/aram-web && pnpm dev            # http://localhost:4185
pnpm build && pnpm exec vite preview --port 4190

# Der Fabrikprüfer — Playwright liegt in der Factory, nicht hier
cd ~/dev/website-factory
PLAYWRIGHT_KANAL=chrome node engine/pruefen.mjs http://localhost:4190/
```

**Falle:** `node engine/pruefen.mjs` läuft nur aus `~/dev/website-factory`, und
Playwright braucht `channel: 'chrome'` — auf diesem Mac gibt es kein eigenes
Chromium.

---

## ⚠ ZUERST LESEN: die Bildübertragung war zwei Sitzungen lang blockiert

Am 20. und 21.08. konnte ich **kein einziges Bild ansehen** — weder Karols
Screenshots, noch Mobbin-Referenzen, noch die eigene Seite. Auch heruntergeladene
und auf 520 px verkleinerte Dateien wurden abgelehnt; es lag am aufgebrauchten
Bildkontingent der Sitzung, nicht an der Dateigrösse.

**Folge: die ganze Seite ist gemessen, aber nicht gesehen.** Jede Zahl in den
Commit-Nachrichten stimmt. Ob es SCHÖN ist, weiss niemand ausser Karol.

**Erste Handlung einer neuen Sitzung: die Seite ansehen.** Screenshots bei
1440 und 393 px, Hero, Reise, Galerie, Karte. Danach erst weiterbauen.

Was in diesen zwei Sitzungen nur über Messung ging und dringend ein Augenpaar
braucht: die Reise (Flugbahn, Grösse des Schiffchens, Zeitpunkt des Bruchs),
die Galerie (Versätze, Rahmen), die Kopfzeile über dem Video.

---

## Was zuletzt gebaut wurde

| Commit | |
|---|---|
| `bc57e84` | Reise auf EIN Objekt, XL — plus `ABLICHTUNG.md` |
| `7d819ca` | echte Speisekarte, 22 Sorten mit Preisen; Handarbeit raus |
| `ceee8f2` | Hero-Video am Rechner schärfer; ein Fehlalarm zurückgenommen |

**Die Seite besteht aus:** Hero mit Video → Reise (gepinnt, ein XL-Objekt, das
aufbricht) → Galerie (waagerecht, 3D-Drehung) → Karte (22 Gerichte) → Laden →
Bestellen → Fuss.

**Nicht mehr in der Seite, Dateien liegen aber:** `Schaustueck.tsx` (von der
Reise ersetzt), `Handarbeit.tsx` (erzählte die Reise ein zweites Mal UND trug
die vier erzeugten Gerichte).

---

## Der Farbstand — er hat sich dreimal gedreht

Endstand nach Karols Entscheidung vom 21.08. abends:

```
Clay hell   oklch(93% 0.030 72)   #F5E5D3   Regelfall
Clay tief   oklch(87% 0.045 66)   #E9CFB6   zweiter Grund
Nacht       #1D140E                          Fuss und Schrift
Glut        oklch(48% 0.145 60)   #964300   EINE Sektion (die Reise), CREME darauf
Orange      #FE6201                          ihr Logo-Orange, nie als Fläche
Akzent      oklch(48% 0.130 43)              die dunkle Stufe ihres Orange
```

**Die Regel, die drei Umwege gekostet hat:** ein helles Orange braucht dunkle
Schrift, ein dunkles braucht helle. Man kann nicht die Fläche des einen mit der
Schrift des anderen kombinieren. `#FE6201` trägt Schwarz (6,01) und kein Creme
(2,76); `#964300` trägt Creme (6,20) und kein Schwarz (2,68). Karol wollte den
GEBRANNTEN — den aus der Fatayer-Rauch-Sequenz.

---

## Was fehlt, und alles hängt am Inhaber

`ABLICHTUNG.md` ist die Seite zum Weitergeben. Kurzfassung:

1. **Ein Foto vom Käseschiff** nach fünf Bedingungen (ein Stück allein, Luft an
   allen vier Seiten, ruhiger andersfarbiger Untergrund, von schräg vorn,
   Licht von einer Seite) — plus dasselbe Gericht einmal aufgebrochen.
   Ohne das bleibt der Höhepunkt der Seite ein Platzhalter, den Karol selbst
   „hässlich" genannt hat.
2. **Das Käseschiff-Video im Original.** WhatsApp liefert 464×848; das Original
   ist 1080×1920. Nicht über WhatsApp schicken — AirDrop oder Drive-Link.
3. **Impressum:** Firma mit Rechtsform, ladungsfähige Anschrift, E-Mail,
   Hoster, Streitbeilegung. Ohne diese fünf darf die Seite nicht live.
4. **Der Allergen-Schlüssel** von seinem Flyer. Die Karte führt Buchstaben
   (G, C, F, E, A), deren Legende nicht mitfotografiert wurde. In
   `inhalt/speisekarte.json` steht deshalb nur, was WÖRTLICH in seiner
   Zutatenliste vorkommt — nichts geraten.
5. **Drei Widersprüche**, siehe `rohbilder/FUNDE.md`: zwei Logos (das grüne mit
   Olivenkranz!), drei Telefonnummern, zwei Firmennamen.

---

## Werkzeug, das in diesen Sitzungen entstanden ist

```
werkzeug/freistellen.py     freistellen + bewerten (Randkontakt, Deckung, Teile)
werkzeug/kanten.py          WELCHE Kante berührt — unten offen ist verzeihlich
werkzeug/ernten.py          einzelne Gegenstände aus Gruppenfotos lösen
werkzeug/schaufenster.py    alle Freisteller als Seite (Umgehung der Blindheit)
werkzeug/besetzung.py       Kandidaten in Flug-Grösse auf dem echten Grund
werkzeug/kopf-vermessen.py  fremde Kopfzeilen aus Mobbin AUSMESSEN
werkzeug/reise-assets.py    Flugobjekte + den Bruch in den Alphakanal schneiden
werkzeug/galeriebilder.py   Galeriebilder zuschneiden und ableiten
```

Läuft in `.venv-bild` — **Python 3.11**, weil es für 3.14 kein `onnxruntime`
gibt und rembg ohne das nicht startet.

```bash
python3.11 -m venv .venv-bild
.venv-bild/bin/pip install "rembg[cpu]" pillow numpy scipy
```

---

## Die teuersten Fallen dieser Woche

**Zwei `transform` auf einem Knoten überschreiben einander still.** Vier
Bewegungen am Ladenschild = vier Knoten. Dieselbe Falle hat auch die
Galerie-Drehung gekostet.

**`getBoundingClientRect` enthält Transformationen bereits.** Wer sie noch
einmal verrechnet, rechnet sie weg — die Winkel standen still, während die Bahn
fuhr.

**Ein Flex-Kind hat `min-width: auto`** und kann nicht unter seine
Inhaltsbreite. Häufigste Ursache für seitlichen Überlauf, am Rechner nie
sichtbar.

**Doppelte Glättung.** Lenis glättet 1,1 s; ein `scrub: 1` legt eine zweite
Sekunde darauf. Gemessen: 16 % des Weges in den ersten 100 ms. Jetzt `true`
für die Hauptfahrt, 0,35 sonst — 52 %.

**Eine Leinwand ohne CSS-Grösse bleibt 300×150.** Der Dampf quoll zwei Tage
lang aus einer Briefmarke, weil `.dampf` keine Masse setzte.

**`naturalWidth` ist bei `srcset` dichtekorrigiert.** Nicht die Dateigrösse.
Hat mich einen falschen Befund gekostet.

**Der Prüfer kann selbst falsch liegen.** Sein „8 von 10 durchgefallen" beim
Freistellen war zu streng: er zählte den ganzen Umfang statt je Kante.
