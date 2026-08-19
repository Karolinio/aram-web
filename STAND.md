# Stand · Aram

Wiedereinstieg nach einer Pause. Alles, was eine neue Sitzung braucht, um ohne
Rückfragen weiterzubauen.

**Letzter Stand:** `0c5454a` — die Startseite ohne Cremeschleier
**Zweig:** `main`
**Stichtag dieser Notiz:** 19.08.2026

---

## ⚠ Dieses Repo hat KEINE Gegenstelle

`git remote -v` ist leer. Die gesamte Arbeit liegt **nur auf diesem Rechner**.
Es gibt keine Sicherung bei GitHub, in keiner Cloud, nirgends.

Solange das so ist, kostet ein Festplattenschaden alles. Wenn eine Gegenstelle
gewünscht ist: privates Repo anlegen und einmal pushen — der Rest ist dann
Routine.

Die **Direktion** liegt woanders und ist dort gesichert:
`~/dev/website-factory/clients/aram/DIRECTION.md`, Zweig
`feat/vorlage-zahnarzt-praxis`, Gegenstelle `Karolinio/website-factory`.
Sie enthält sechs Amendements und ist die Begründung für jeden Token.

---

## Starten

```bash
cd ~/dev/aram-web
pnpm dev                       # Entwicklung, http://localhost:4185
pnpm build && pnpm preview --port 4190   # der gebaute Stand
```

Weitere Seiten: `/stil.html` (Stilbogen, `noindex`), `/impressum.html`,
`/datenschutz.html`.

## Prüfen

```bash
cd ~/dev/website-factory
PLAYWRIGHT_KANAL=chrome node engine/pruefen.mjs http://localhost:4190/
node engine/inhalt-pruefen.mjs aram
```

**Falle:** Der Prüfer braucht Playwright über zwei Symlinks in
`~/dev/website-factory/node_modules/`. Die sind während der letzten Sitzung
einmal verschwunden und mussten neu gelegt werden:

```bash
cd ~/dev/website-factory && mkdir -p node_modules
ln -sfn ~/Desktop/03_OS_Projects/LifeOS/browser-service/node_modules/playwright node_modules/playwright
ln -sfn ~/Desktop/03_OS_Projects/LifeOS/browser-service/node_modules/playwright-core node_modules/playwright-core
```

Auf diesem Mac gibt es kein eigenes Chromium — immer `channel: 'chrome'`.

---

## Drei Entscheidungen liegen bei Karol

Alle drei liegen als **umschaltbare Fassungen** im Code. Sobald entschieden
ist, fliegt die Verliererin raus — damit nicht zwei Wahrheiten stehen bleiben.

### 1. Die Farbfassung

```js
document.documentElement.setAttribute('data-farbe','clay')  // Karols Vorschlag
document.documentElement.setAttribute('data-farbe','ofen')  // Empfehlung
document.documentElement.removeAttribute('data-farbe')      // Ist-Zustand
```

Gemessen aus dem Scan ihrer alten Seite: Orange `#fe6201`, Schwarz `#1d140e`.
Und die Messung, die alles entscheidet — **ihr Orange wird erst auf dunklem
Grund zur Markenfarbe**:

| | |
|---|---|
| ihr Orange als Schrift auf Clay | 2,27 durchgefallen |
| Tinte auf ihrem Orange als Fläche | 4,57 knapp |
| ihr Orange auf ihrem Schwarz | **6,01 sitzt** |
| Creme auf ihrem Schwarz | **16,34 sitzt** |

Empfehlung `ofen`: Clay als Grund über die ganze Seite, und die eine
Ausnahmesektion in ihrem Schwarz mit ihrem Orange. Seit die Startseite dunkel
ist, spricht die Seite damit durchgehend dieselbe Sprache.

### 2. Der Telefonknopf in der Kopfzeile

```js
document.documentElement.setAttribute('data-probe','rot')   // ihr Logorot
document.documentElement.removeAttribute('data-probe')      // Clay/Glas
```

### 3. Der Deckel von 10 Bildschirmhöhen

Der Auftrag deckelt bei 10 am Handy, 11 am Rechner. Aktuell: **Handy 10,9**,
Rechner 9,3. Der Überhang ist der Preis des gepinnten Schaustücks — ein
gepinnter Abschnitt kostet seinen Scrollweg zusätzlich zu seiner Höhe.

Drei Wege: Deckel auf 11,5 anheben (die Fabrik warnt erst bei 15) · die Karte
hinter „alle neun anzeigen" kürzen (~1,5 Höhen, versteckt aber das, wofür Gäste
kommen) · das Schaustück streichen.

---

## Was vom Chef fehlt — und was es freischaltet

| fehlt | schaltet frei |
|---|---|
| **11 Gerichtefotos**, 3–4 Ansichten je Gericht | „Die Reise" (das eigentliche Showpiece) und ein Schaustück mit echtem Essen |
| **Ein Frontfoto bei Abendlicht** | die Startseite — sie erwartet jetzt ein Bild bei voller Stärke |
| **Ofenfoto** | Schritt 03 im Prozess, plus die zweite Dampfquelle (gebaut, wartet) |
| **9 Preise** | neunmal „—" wird eine Karte |
| **Öffnungszeiten** | die sichtbare Lücke im Hero, der Live-Status, `openingHours` bei Google |
| **Anschrift, Rechtsform, E-Mail, Hoster, VSBG-Aussage** | Impressum, Datenschutz, Kartensuche — und den Livegang überhaupt |
| **Lieferando/Uber/Wolt: ja oder nein** | drei Namen ohne Link im Bestellen |

Alles davon sind Zeilen in `src/aram.config.ts` und `inhalt/zeiten.json`.
`lueckenVorLive()` blockiert den Livegang, solange etwas davon fehlt, und die
Konsole meldet es bei jedem Start.

---

## Was noch niemand gebaut hat

- **Ein Zuhause.** Keine Domain, kein Server, kein Vorschaulink. Deshalb hat
  der Chef die Seite bisher nur über Karols Bildschirm gesehen.
- **Die Reise** — das Herzstück aus der Direktion, 0 %.
- **Messung**, ob überhaupt jemand anruft.
- **Ein Test auf einem echten Gerät.** Alles Gemessene lief in einem
  gesteuerten Browser auf einem Mac.

---

## Fallen, die diese Sitzung gekostet haben

Damit sie nicht zweimal Zeit kosten:

- **`[hidden]` schlägt kein eigenes `display`.** Das Handymenü lag deshalb
  bildschirmfüllend über der Seite, auch am Rechner. Wer `display` an einem
  Element setzt, das `hidden` tragen kann, muss `[hidden] { display: none }`
  mitschreiben.
- **`backdrop-filter` macht ein Element zum enthaltenden Block** für alle
  `position: fixed`-Nachfahren — wie `filter` und `transform`. Deshalb hängt
  das Menü per Portal am `<body>`.
- **Eine klebende Kopfzeile, die ihre Höhe ändert, schiebt die ganze Seite.**
  Sie ist jetzt `fixed`, der Platz kommt vom Innenabstand am `<body>`.
- **Text auf einer Fotografie rechnet man nicht, man misst ihn** — am
  zusammengesetzten Pixel, nicht am Token. Drei Werte sind so durchgefallen,
  die auf dem Papier gestimmt hätten.
- **Wer eine Grundregel dreht, muss ihre Ausnahmen mitdrehen.** Der Hero war
  auf hell gedreht, die Handy-Ausnahme trug noch den Cremeschleier: 1,06.
- **`will-change` kostete hier zweimal mehr, als es brachte** — einmal 30
  Ebenen ab dem Laden, einmal einen Neuumbruch bei `text-wrap: balance`.
- **Der gläserne Kopf kostet Bildrate.** Gemessen: schlimmster Frame 54 ms mit
  Glas gegen 28 ms ohne. Erste Stellschraube, falls die Seite je zäh wirkt.

---

## Zuletzt gemessen (`0c5454a`, Produktionsbau)

Prüfer **ohne Befund** · CLS 0,004 · 0 Konsolenfehler · 0 lange Aufgaben ·
Handy 10,9 / Tablet 9,3 / Laptop 9,3 Bildschirmhöhen.

Kontraste im neuen Hero, am Pixel gemessen: Rechner 5,44–18,43 ·
Handy 4,71–18,01 · Kopfzeile 5,64.

**Higgsfield: 49 von 60 Credits verbraucht.**
