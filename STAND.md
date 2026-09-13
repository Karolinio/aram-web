# Stand · Aram

Wiedereinstieg. Alles, was eine neue Sitzung braucht, um ohne Rückfragen
weiterzubauen.

**Letzter Stand:** `HEAD` · **Zweig:** `main` · **Notiz vom:** 13.09.2026

---

## 13.09. — Startseite ohne Video, Schweif, Kopfzeile mit zwei Wegen

Live auf https://karolinio.github.io/aram-web/ (GitHub Pages, `ARAM_BASIS=/aram-web/`).

- **Startseite = Vorhang.** Logo gross und mittig (`logo.webp` ist jetzt auf
  den Inhalt beschnitten, 875×381 — vorher 31 % durchsichtiger Rand, ungleich,
  darum kleiner als gesetzt und 3 % links der Mitte). Zeile klein in Reem
  Kufi, ihre Unterkante haengt am Dampf, nicht am Logo.
- **Fahrt:** erst hoch (0–0,2), dann drehen; Teilung bei `TEILT_AB 0,58`
  (110° statt 75°), Karte haengt an TEILT_AB. Logo faehrt ueber 0–0,25 nach
  unten rechts aufs Wasserzeichenmass.
- **Salve = Schweif** (Salve.tsx): eine Catmull-Rom-Kurve, sechs Perlen mit
  `ABSTAND 0,075 / DAUER 0,55`, Start erst bei 28 % der Oeffnung
  (`SPALT_OFFEN`), Uebergabe an den Schwarm ueber `--schwarm-deck` (0,78–0,98).
- **Kopfzeile:** Anrufen + WhatsApp als Glasknoepfe oben rechts (`.kopf__weg`),
  am Handy nur Zeichen 44 px. Die drei Steine der Startseite sind raus,
  „Zur Karte" ganz (die Karte ist der naechste Takt).
- Dampf: Salve-Perlen `dichte 6`, Schwarm 8/6.

**Offen (Karols Entscheidung):** Sektionsfarben tauschen — Vorhang bleibt
schwarz (auf Orange verschwinden Fladen und Dampf, gemessen/gesehen),
„Alles entsteht" auf Schwarz, Galerien auf Orange. Probe-Screens lagen in der
Sitzung vom 13.09.; Umbau = `grund`-Prop je Sektion + Untergrund-Ton + die
tonabhaengigen Regeln der drei Sektionen (Dampf-Ton, Theke bleibt orange).

---

## 10.–11.09. — sein eigenes Material ist drin

Der Inhaber hat **38 Fotos und 12 Videos** geschickt (AirDrop, 10.09. 03:25).
Sie liegen in `rohbilder/eingang/neu-2026-09/` — nicht im Repo, Rohmaterial
bleibt draussen. Was auf welcher Aufnahme zu sehen ist und wie sicher die
Zuordnung ist, steht in **BILDKATALOG.md**, samt sechs offener Fragen an ihn.

**Auf der ganzen Seite gibt es kein erzeugtes Produkt mehr.** Alles stammt aus
diesen 50 Aufnahmen.

### Was wo herkommt

| Stelle | Quelle |
|---|---|
| Startseitenvideo | Clip 04 (`55BAB0F2`), Steinofen + Kaeseschiffe, 8 s |
| Neun Schwarmprodukte | IMG_1533/1510/1535/1507/1529/1518/1525/1509/1527 |
| Kaeseschiff-Reise | IMG_1533, fuenf Stufen aus einer Vorlage abgeleitet |
| Vorhang-Lahmacun | IMG_1535 |
| 16 Kartenbilder | siehe `werkzeug/kartenbilder.py`, Sicherheit steht dabei |
| Produktgalerie | dieselben Dateien wie die Karte |
| Vier neue Galeriebilder | IMG_5804, IMG_1517, IMG_5664, IMG_1520 |

### Die Regel, die diese Runde gekostet hat

**Higgsfield schneidet aus, der Code macht schoen.**

Erster Lauf mit einem Schoenheits-Auftrag („relight, deepen the browns, wie ein
guter Foodfotograf") gab ein ANDERES Gericht zurueck — Farbabstand 44,8 zur
Vorlage, mit Kaeseflecken und Kraeutern, die es auf seinem Lahmacun nicht gibt.
Derselbe Input mit einem Auftrag, der nur freistellt und jede Veraenderung
ausdruecklich verbietet: **3,0**.

Die Aram-Optik kommt seitdem aus `werkzeug/aramlicht.py` (S-Kurve, Waerme,
Saettigung, optional staerker und aufgehellt). Eine Gradation hat eine
Obergrenze, ein Modellauftrag nicht.

### Werkzeuge, die neu sind

    werkzeug/aramlicht.py       die Gradation
    werkzeug/schwarmbilder.py   Freisteller -> Schwarmprodukte
    werkzeug/reisebilder.py     die fuenf Stufen der Kaeseschiff-Reise
    werkzeug/vorhangbilder.py   Scheibe + Haelften entlang einer Bruchlinie
    werkzeug/kartenbilder.py    Kartenbilder + Produktgalerie-Verzeichnis

Alle laufen mit `/tmp/pdfvenv/bin/python` (pymupdf, numpy, Pillow). Ein
frisches System braucht dieses venv neu.

### Drei Fehler, die erst echte Durchlaeufe gefunden haben

**Die Vorhang-Haelften kamen aus dem GERISSENEN Bild.** Damit klaffte der Spalt
schon, solange sie uebereinanderlagen — ein Vorhang, der beim Aufgehen offen
ist. Jetzt wird das HEILE Gebaeck entlang einer gezackten Linie geteilt;
nachgemessen 0 Bildpunkte Ueberlappung, 0 Loch.

**Die Kartenbilder waren zu 80 % zu sehen.** `object-fit: cover` bei
`max-height: 56vh` schneidet ab. Dazu waren sie quadratisch zugeschnitten, weil
das VORSCHAUBILD quadratisch ist — dass dieselbe Datei gross gezeigt wird, war
uebersehen. Jetzt 4:3 quer und `contain`.

**Die Ziffer war groesser als die Ueberschrift** (31,8 gegen 28 px) — die
Nummer stand lauter da als das, was sie nummeriert.

### Der Riegel, den niemand anfassen darf

Die Ueberschrift auf der Theke steht bei **genau 24 px**. Weiss darauf misst
3,52; die WCAG-Grenze fuer grosse Schrift ist 3,0, fuer kleine 4,5 — und 4,5
erreicht sie nicht. 24 px ist der kleinste erlaubte Wert. Wer sie kleiner
macht, muss die Theke dunkler machen.

### Was offen ist

1. **Sechs Gerichte ohne Bild** — Beirut, Spinat, Mexicano Roll, Sucuk, Sucuk
   mit Kaese, Gemuese Kaese. Es gibt keine eigene Aufnahme dazu.
2. **Sechs Zuordnungen sind nur „vermutet"** und muessen vom Inhaber bestaetigt
   werden. Liste in BILDKATALOG.md.
3. **Wie heisst das Kaeseschiff auf seiner Karte?** Es steht dort nicht.
   Vermutung: „3 Lange Kaese". Davon haengt die Beschriftung der Scroll-Sektion
   ab.
4. **Die Steinofen-Galerie** ist um vier Bilder ergaenzt, aber keins der alten
   ist ersetzt. Karol wollte pruefen, ob treffendere die alten abloesen.
5. Unveraendert offen: Rechtsform fuers Impressum, WhatsApp-Nummer,
   Instagram-Handle, der Absatz ueber den Laden (steht als Luecke drin).
6. **18,1 Bildschirmhoehen am Handy** — die einzige Warnung des Fabrikpruefers.
   Durch die zweite Galerie eine Hoehe laenger geworden.

### Was gemessen gut steht

    CLS 0,015   Video laeuft auf allen drei Groessen
    Antippflaechen und Schriftgroessen am Handy: keine Beanstandung
    Kontraste auf der Theke: Ziffer 5,15 · Titel 3,52 · Text 5,76


## Speisekarte und Laden — 23.08.

**Die Gerichte laufen zweispaltig** (`columns`, nicht Raster: eine gesetzte
Karte liest sich spaltenweise, 1–12 links, 13–22 rechts). Zweispaltig war die
Karte vorher schon — aber auf GRUPPEN-Ebene, und es gibt nur eine Gruppe.

    Liste 2414 → 1383 px    Sektion 3124 → 2093 px

**Der Bildplatz steht, die Bilder fehlen.** `Gerichtbild` in inhalt.ts,
Vorschaubild als Knopf, `Bildschau.tsx` als natives `dialog`. Ohne Foto steht
kein Platzhalter da; sobald EIN Gericht der Gruppe eines hat, bekommen alle
Zeilen den Einzug. Was der Inhaber liefern muss, steht in ABLICHTUNG.md.

**Der Laden** hat zwei echte Fotos statt einem (`team-laden.webp` lag ungenutzt
herum), als Stapel mit eigenem Tempo je Bild. Die Öffnungszeiten sind kein
Sechszeiler mehr, sondern ein Satz — GERECHNET aus den Daten
(`wochenbloecke` in oeffnung.ts), nicht getippt: mehrere Zeitblöcke oder ein
Ruhetag mittendrin bringen die Aufzählung von selbst zurück.

### Drei Fehler, die erst diese Runde sichtbar wurden

- **560 px Sprung unterhalb der Speisekarte.** Mein eigener Zweispalter hatte
  `contain-intrinsic-size` überholt. Kein CLS — es passiert ausserhalb des
  Bildes, deshalb meldet der Prüfer es nicht — aber ein Scrollbalken, der
  mitten auf der Seite springt. Und der Wert beschreibt den INHALTSKASTEN: das
  Polster kommt obendrauf, sonst zählt es doppelt. Jetzt 0 px Drift.
- **Jede Überschrift der Seite lief in ihr eigenes Etikett.** Die Parallaxe hing
  an der `h2` und legt 36 px zurück; über der Überschrift sind 14 px Platz,
  darunter 16. Sie hängt jetzt am ganzen Kopfblock — Etikett, Titel und
  Vorspann bewegen sich gemeinsam. Gemessen über 700 Scrollschritte bleiben die
  Abstände konstant.
- **`team-laden.webp` ist 1024 × 784, nicht 900 × 675.** Geschätzt statt
  gemessen; der Fabrikprüfer hat es gefunden.

### Bekannte Einschränkung

Am Handy streift das Schiff im Riss-Abschnitt kurz den Vorspann. Die Bahn ist
an 1440 × 900 gemessen; am Handy liegt sie um 0,22 Fensterhöhen tiefer
(`tiefer` in Kaeseschiff.tsx). Eine zweite Wegpunkttabelle wäre die
naheliegende Antwort und die schlechtere — zwei Tabellen laufen auseinander.

---

## Die Ofenreise — der Stand vom 23.08.

Das Käseschiff wohnt in KEINER Sektion. Es liegt fest im Fenster
(`src/komponenten/Kaeseschiff.tsx`, `position: fixed`) und wird allein vom
Scrollfortschritt geführt — von der Oberkante der Handarbeit bis zur Unterkante
der Riss-Sektion. Es erzählt dabei den ganzen Vorgang:

```
Teigkugel → gewalzt → belegt → IN DEN OFEN → gebacken → reisst auf
```

**Drei Fahrpläne, ein Fortschritt.** `BAHN` (wohin), `STUFEN` (welches Bild),
`RISS_AB`/`RISS_BIS` (wie weit offen) lesen alle dieselbe Zahl. Ein zweiter
ScrollTrigger für den Riss war der Fehler der Vorfassung — das Gebäck war
gemessen mitten in der Galerie schon halb offen.

**Die Wegpunkte sind nach den ÜBERSCHRIFTEN gewählt, nicht nach der Kurve.** Es
gibt Fenster, in denen das Schiff tief oder rechts stehen MUSS, sonst parkt es
auf einer Zeile. Sie stehen im Kopf der Datei. Wer Sektionshöhen ändert, misst
sie neu.

**Der Ofen ist IHR Ofen** — Galeriefoto 09, beschnitten (`werkzeug/ofenbild.py`).
Erzeugt sind nur die Teigstufen; Mehl und Teig sind Material ohne erkennbaren
Ort. Das Maul liegt bei 32,3 % / 37 % des Bildes, gemessen — der Versatz im
Stilblatt schiebt genau diesen Punkt in die Fenstermitte. Wer das Foto tauscht,
misst neu.

**Die Teigstufen** (`werkzeug/ofenreise.py`) sind mit nano_banana_pro erzeugt,
MIT dem gebackenen Schiff als Referenz — nur deshalb stimmen Umriss,
Blickwinkel und Licht überein. Alle liegen auf DERSELBEN Leinwand (1200 × 540);
ohne das springt der Gegenstand bei jedem Wechsel.

### Fehler, die nur eine Messung findet

- `justify-self` war bei den Hälften vertauscht — die Bruchkante zeigte nach
  aussen. Grund für dreimal „falsch rum".
- Die Hälften waren einzeln zugeschnitten und passten nie zusammen. Volle
  Leinwand für alle.
- Die Leinwände massen sich mit `getBoundingClientRect`, also TRANSFORMIERT: im
  skalierten Schiff 158 px Speicher für eine Fläche, die auf 608 px wächst.
  Jetzt `offsetWidth`.
- Die Käsefäden waren GESTRICHENE Kurven. Ein Strich hat eine Stärke — die
  Einschnürung, die Käse ausmacht, ist damit nicht zeichenbar. Jetzt gefüllte
  Bänder mit eigener Halbbreite je Abtastpunkt.
- Der Dampfton `warm` hat einen dunklen Saum. Über Clay verschwindet sein heller
  Kern und übrig bleibt ein RING. Neuer Ton `ofen`, streng monoton fallend.
- Die Überschrift der Ofensektion stand auf ihrem eigenen Etikett: `useVersatz`
  rechnet seinen Bereich aus der Dokumentposition, und die ist in einem
  klebenden Block konstant. Text gehört NICHT in eine klebende Bühne.
- Der Balken unter dem Hero stand in ZWEI Regeln: `94svh` am Rechner und
  `92svh` im Handy-Block. Beide auf `100lvh`.

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
