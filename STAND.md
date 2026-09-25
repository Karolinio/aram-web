# Stand · Aram

Wiedereinstieg. Alles, was eine neue Sitzung braucht, um ohne Rückfragen
weiterzubauen.

**Letzter Stand:** `HEAD` · **Zweig:** `main` · **Notiz vom:** 17.09.2026

---

## 25.09. — Header schwebend (Craft-Vorbild), Logo-Schraegstrich, Trennstriche raus

- **Kopfzeile schwebt jetzt** statt kantenbuendig zu kleben: 999px Radius,
  20 px Luft zu allen drei Raendern, Haarlinien-Rand. Vorbild ueber Mobbin
  gesucht: [Craft](https://mobbin.com/screens/327e98e7-442b-462c-b0f5-884af12e7d78)
  (rein rundes Pill), [T1 Energy](https://mobbin.com/sites/sections/08b1da0a-e784-4a8c-8d23-0359ff00b023),
  [Frontify](https://mobbin.com/sites/sections/62984214-7e41-43f6-b3fe-4ada5446fc18).
  Glas/Farbe/Handy-Abschaltung (`pointer: coarse`) unveraendert — reine Form.
  Neuer Token `--kopf-schwebe`, in `--kopf-hoehe` eingerechnet (alle Sprung-
  marken/Hero-Abstaende bleiben korrekt).
- **„/finesites" im Fuss:** derselbe Kniff wie auf finesites.de selbst
  (`--marke-strich-grad`/`vertical-align: 0.149em`) — der Schraegstrich war
  groesser als die Buchstaben, jetzt auf 0,72 em verkleinert und um seine
  Unterlaenge angehoben, sitzt auf derselben Grundlinie.
- **Trennstriche zwischen den Kartengruppen wieder raus** — Karol: „sieht
  scheisse aus". Die groessere Gruppen-Ueberschrift (24.09.) bleibt, sie
  traegt die Zaesur allein; nur der harte Strich ist weg, Abstand bleibt grosszuegig.
- **Kartenblatt-Teaser auf der Startseite geprueft:** liest live und mit
  Cache-Umgehung KORREKT die 24.09.-Karte (3 Muhammara mit Gouda, 4 Lange
  Käse, 5 Käse mit Gouda, und 54 weitere). Karols Screenshot zeigte einen
  alten Browser-Tab — kein Code-Fehler.
- Offen/vertagt auf Karols Wunsch: Startseitenvideo NICHT entfernt (er sagte
  ausdruecklich "ueberlege" vor dem Loeschen) — Empfehlung siehe Chat.
  Schiefe Bilder rund um das Kartenblatt sind die Salve-Kurvenrotation
  waehrend des Aufklapp-Schwungs (gewollt) — kein Fund eines echten Fehlers
  in Ruhelage. Leere Kartenzeilen (Gerichte ohne Foto) bleiben ohne Bild,
  wie von Anfang an entschieden (`Karte ohne Bild reserviert keinen Platz`).

## 24.09. — Karte nach dem AKTUELLEN Flyer, Blech-Bilder in der Galerie

Karol hat vier Fotos von Arfans aktuellem Flyer geschickt (~/Downloads/
IMG_2929–2932.HEIC). **Das ist eine andere Karte als die alte Seite** und
erklärt alle Namen, die Arfan beim Treffen genannt hat.

- Karte neu: Fata'er **01–27** (u. a. Muhammara/Käse/Sucuk mit Gouda,
  Ricotta Käse, Hackfleisch mit Granatapfelsirup, Mexicano scharf, Lange
  Käse mit Paprikapaste/Gemüse, Kartoffeln mit Käse und Gemüse, Pizza mit
  Gemüse; Fahita und Groß Käse sind WEG), Manakisch **30–39** (neu: Sucuk
  Spezial 7 €), Pizza 61–75 unverändert, **Getränke** neu (ohne Nummern).
  59 Einträge, 13 mit Foto. Wortlaut wie gedruckt; „39 Sucuk Spezial …
  Tomaten und beizen" — „beizen" weggelassen, unleserlich/Druckfehler.
- Gruppenüberschrift jetzt Kapitel: 3-px-Strich + grösser als Gerichte.
- Galerie 23 Bögen: 16 Einzelprodukte (Namen wie Flyer), danach sieben
  Blech-/Tischbilder aus dem August-Ordner mit BESCHREIBENDEN Zeilen, kein
  Gerichtname geraten (Nr 35, 43, 32, 34, 38, 41, 25 → `blech-*`). Nr 9 =
  Dublette von 34.
- Flyer bestätigt: WhatsApp = 0177 4637662, Festnetz 0228 18034488,
  Mo Ruhetag, Di–So 8–19, Parkplatz Auf der Urdel; das Oliven-Kranz-Logo
  steht auf dem Flyer (also echt, neben dem Cartoon-Logo).
- Offen bei Arfan: Name des Titelgebäcks (Flyer-Vorderseite = Nr 41),
  Käseschiff = 04 Lange Käse?, „Pizza" in der Galerie = 23 Gemüse Käse?

## 21.09. — Nach dem Treffen: Beschriftungen, Nummern, Kritik vom Domain-Mann

Arfan und sein Partner: „super". Sein früherer Domain-/Website-Mann (hat
arampizzeria-bonn.de gebaut, hat den Hostinger-Zugang) am Telefon: weniger
Animation („wirkt wie Baustelle, langsamer"), KI-Bilder kennzeichnen
(„sonst 25.000 €"), will „die HTML". Karol will heute an ihn übergeben.

- **Produktgalerie ohne Nummern** (Galerie.tsx) — Arfan: „Erstes, Zweites …
  gibt es nicht mehr." Nummern bleiben nur in der Karte.
- **Foto 3 ist Sucuk, nicht Lange Käse** → Datei `sucuk.webp`, in der Karte
  hängt es jetzt an 16 Sucuk; 3 Lange Käse ohne Foto.
- **Foto 4 zeigt „Mexicano scharf"**, nicht Doppelt Käse → `mexicano-scharf.webp`,
  in der Galerie unter dem Namen; **an keinem Karteneintrag** (gibt es auf
  der Karte nicht — Karte stammt von seiner alten Seite, Juni 2026).
- Arfans Beschriftungen, Galerie UND Karte festgezurrt. Dateien heißen,
  was sie zeigen (`pizza-gemuese`, `ricotta-kaese`, `hackfleisch-granatapfel`,
  `hackfleisch-gemuese`, `mexicano-roll`, `kartoffel-kaese`, `pizza`,
  `mexicano-scharf`, `sucuk`, neu `kaeseschiff` aus IMG_1533). Galerie: 16
  Bögen, keine Nummern, Lahmacun mit Zwiebeln raus. Karte hat ein Foto NUR
  dort, wo Galerie-Name und Karteneintrag dasselbe Gericht sind (10 Foto:
  1, 2, 5, 10, 11, 15, 16, 18, 20, 22); 8/9/13/14/21 ohne Foto, weil ihre
  alten Fotos andere Gerichte zeigen. `kartenbilder.py` schreibt die
  Galerie nicht mehr; ZUORDNUNG = nur noch Kartengerichte.
- **Obere Arkade raus, mit Bildern:** public/bilder/galerie/, galerie.json,
  galeriebilder.py gelöscht. `galeriemass.ts` zählt jetzt die Produktgalerie.
- **Karte vollständig: Manakisch (41–49) und Pizza (61–75)** aus seinen
  Kartenfotos (rohbilder/eingang Bild 2 + 7) abgelesen — vorher stand nur
  Fata'er auf der Seite, eine Pizzeria ohne Pizza. Neues Feld
  `zusatzstoffe` (Farbstoff/Süßstoff/Konservierungsstoff), getrennt von den
  Allergenen, in derselben Zeile gezeigt. 44 Gerichte, Teaser „und 39 weitere".
  Nummer 47 und 70 fehlen auf SEINER Karte.
- **Flüssiger am Handy — vier Befunde aus dem CPU-Profil (4×-Drossel):**
  ① `saat.ts` schrieb zwei Variablen je Bild an `<html>` → Stilprüfung der
  ganzen Seite je Bild; jetzt an die `.untergrund__saat`-Ebenen, Schleife
  ruht, wenn nichts abklingt. ② `ziehen.ts` maß `offsetLeft` je Bild (Layout
  erzwungen) auch außer Sicht → gemerkt, Halt-Bedingungen zuerst.
  ③ `setStand` bekam je Band-Scroll ein neues Objekt → React renderte alle
  32 Bögen je Bild; jetzt nur bei Änderung. ④ Mehlstaub (Vollbild-Canvas,
  60 Hz) und Kopfzeilen-`backdrop-filter` (28 px Blur je Bild) am groben
  Zeiger aus. Ergebnis im Profil: Hauptstrang beim Scrollen 47 % frei statt
  30 %, React-Arbeit 1,25 s → 0,28 s je 10 s Scroll. Lighthouse/Scroll-Bench
  auf diesem Mac (Load 15–20) zu verrauscht für eine Zahl — das Handy
  entscheidet. Weiter offen: natives Rendering (7 Saat-Ebenen, Scrub).
- Fußzeile: KI-Satz sagt jetzt ausdrücklich, dass alle Gerichte echte Fotos
  sind; erzeugt sind nur Dampf und drei Teigstufen.
- **Lighthouse mobil (live, 21.09.): Performance 27**, TBT 6,3 s, LCP 7,5 s,
  Script-Auswertung 9 s bei 4×-Drossel, 20 lange Tasks (seite-*.js,
  bausteine-*.js, ScrollTrigger). Der Domain-Mann hat mit „langsamer" recht.
  Bytes sind nicht das Problem (2,7 MB gesamt, 436 kB JS), die Startarbeit
  ist es. Offen: profilieren, was beim Start rechnet (Verdacht: Vermessen
  der Bühne/Kurven, Mehlstaub, Saat), und am Handy Dekor abschalten.

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
- **Der Film ist zurueck, aber als Grund:** Clip 04 (`public/video/ofen*.mp4`,
  aus e583713^ geholt) liegt HINTER Logo, Zeile und Fladen (`.vorhang__film`),
  38 % Helligkeit, Vignette, Ausschnitt 50 % 22 %; faehrt ueber p 0–0,25 aus
  und pausiert. Karol: Startseite ohne Video „zu langweilig". Referenz
  Artisan Kitchen (Mobbin): dunkle Kueche hinter beleuchtetem Produkt.
- Fladen in Ruhe `skala 0,84` (Ende 1,32), Scheibe `min(96vw, 68rem)` — und
  **nur zu einem Viertel im Bild** (`hoch` 58 vh Schirm / 56 Handy): Oberkante
  bei 84 % (1440×900), 93 % (2560, Handy). Aufstieg bis 0,25 = Logoflug;
  Drehung ab 0,25; `TEILT_AB 0,63 / TEILT_BIS 0,9`.
- Zeile wieder unter dem Logo; der Dampf (72 vh hoch, Fuss auf der
  Fladenoberkante, transform-origin unten, auf Ruhe normiert) ist die Bruecke
  vom Fladen bis unters Logo.
- **Schwarm leiser:** `gr`/`grM` × 0,78, Deckung 0,86 vorn bis 0,52 hinten
  (Karol: „die Produkte im Hintergrund sind ungewollt im Vordergrund").

- 13.09. spaet: Statuszeile mittig (`max-width: none` gegen das globale
  `p`), Fladen 12 % kleiner (`skala 0,74 → 1,16`), Emblem in der Karte klebt am
  Handy (`.karte__emblemlage` + sticky), **obere Galerie neu kuratiert**
  (`werkzeug/galeriebilder.py`: 10 Bilder, keine Einzelprodukte — Strasse,
  Brueder, Team, Ofen, Bleche, Tisch; 54 = Ladenfront aus der Lieferung 10.09.),
  **Probe-Schalter `?ton=nacht`** auf der Adresse schaltet „Alles entsteht" auf
  Schwarz (Handarbeit.tsx `NACHT`) — nach Karols Entscheidung entfernen.

- 14.09.: **Impressum/Datenschutz waren auf der Testadresse nicht verlinkt
  erreichbar** (`href="/impressum.html"` → `karolinio.github.io/impressum.html`,
  404) — jetzt `pfad()`. Dazu: `theme-color` Nacht, PNG-Symbole + Manifest in
  `public/bilder/marke/`, `og:image` = `vorschau.jpg` (1200×630, Logo auf
  Nacht) mit Ursprung aus `ARAM_URSPRUNG` (Workflow) solange die Domain
  fehlt, eigene 404-Seite (`404.html` → `src/fehlseite.tsx`), keine
  Tab-Stopps mehr auf Unsichtbarem (Kopf-Logo, „Zur Karte").

### 17.09. — Wiedereinstieg: das Treffen

Arfan sagt zur Vorschau: „da ist irgendwas falsch" — ohne zu sagen, was.
Karol geht hin und schließt es mit ihm zusammen ab. **TREFFEN.md** hat
Nachricht, Liste (0–8) und die Deploy-Schritte. Beim Wiedereinstieg zuerst
Karols Notizen vom Treffen aufnehmen; wahrscheinlichste Fehler: Beschriftungen
und die geratenen Zuordnungen in `werkzeug/kartenbilder.py`. Alles Technische
ist deployt und geprüft (14.09.: 0 Fehler, Impressum ohne Lücke, Datenschutz
nur noch Hoster). `?ton=nacht` und `muster/` (lokal, nicht mehr im Repo)
siehe unten.

### 14.09. — Fundstücke im Netz, Impressum fast vollständig

Karol hat zwei Quellen gefunden:

- **sites.google.com/view/arampizzeria** (seine Google-Seite): Inhaber Arfan
  Omar, Festnetz 0228 18034488, WhatsApp 0152 090 921 00, Mail
  arampizzeria@gmail.com.
- **arampizzeria-bonn.de** — eine WordPress/Elementor-Seite vom Juni 2026 auf
  **Hostinger** (dns-parking.com, LiteSpeed). Impressum dort: „Aram Pizza &
  Orientlisches Gebäck", vertreten durch **Aram Omar, Shair Omar**, Tel 0177
  4637662, Mail info@arampizzaria-bonn.de (Tippfehler, kein MX — tot),
  **USt-IdNr DE368715327** (VIES: gültig), Streitbeilegung „nein",
  Platzhalter „[Vor- und Nachname]" als redaktionell Verantwortlicher,
  Instagram @aram.pizza.

Übernommen in `aram.config.ts`: `steuernummer`, `streitbeilegung: 'nein'`.
**Impressum zeigt keine Lücke mehr**; Datenschutz nur noch der Hoster.

Widersprüche, die nur er auflösen kann, stehen in **FRAGEN-AN-DEN-CHEF.md**
(Name, WhatsApp-Nummer, Domain/Zugang, Mail, Zeiten, Instagram,
Lieferdienste, sechs Fotos).

**Hosting-Empfehlung:** Domain und Hosting gibt es schon (Hostinger). Den
statischen Bau (`ARAM_BASIS=/`) nach `public_html` laden, WordPress abschalten
— dann `web.domain = 'https://arampizzeria-bonn.de'`, `recht.hoster` =
Hostinger (Rechtsträger vor dem Eintrag prüfen). Alternative: DNS auf GitHub
Pages + CNAME-Datei; dann hängt die Seite an Karols GitHub-Konto.

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
