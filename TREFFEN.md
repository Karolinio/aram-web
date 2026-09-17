# Treffen mit Arfan — verschoben, Karol geht hin (Stand 17.09.)

**Neu am 17.09.:** Arfan hat Karol auf den GitHub-Link geantwortet: „da ist
irgendwas falsch" — WAS, hat er nicht gesagt. Karol vermutet Kleinigkeiten
wie Beschriftungen einzelner Produkte (Karte, Galerie-Titel). Sie machen es
zusammen vor Ort. Beim Wiedereinstieg: **erst seine Liste aufnehmen, dann
bauen** — die geratenen Foto-Zuordnungen (kartenbilder.py ZUORDNUNG,
Sicherheit „vermutet") sind der wahrscheinlichste Fehler.

Karols Liste fürs Treffen (0–8) steht unten in Teil D; er hat sie in seinen
Notizen.

Zwei Teile: **A** ist die Nachricht, die du ihm HEUTE schickst (damit er
morgen das Richtige dabeihat). **B** ist deine Liste fürs Treffen. **C** ist,
was danach passiert und wie lange es dauert.

---

## A · Nachricht an ihn, heute

> Hallo Arfan, freu mich auf morgen. Die neue Seite kannst du dir vorher
> anschauen: https://karolinio.github.io/aram-web/
>
> Bring bitte drei Sachen mit, dann können wir morgen alles fertig machen:
>
> 1. Den Zugang zu deiner alten Website arampizzeria-bonn.de — das ist ein
>    Hostinger-Konto (E-Mail + Passwort). Wenn jemand anderes die gebaut hat:
>    seine Nummer.
> 2. Deine Gewerbeanmeldung oder den letzten Steuerbescheid — ich brauche
>    den Namen, der im Impressum stehen muss, genau so wie er dort steht.
> 3. Dein Handy — wir prüfen zusammen, auf welcher Nummer WhatsApp läuft.
>
> Und wenn du morgen früh Zeit hast: je ein Foto von Beirut, Spinat, Mexicano
> Roll, Sucuk, Sucuk mit Käse und Gemüse Käse — von oben, auf dem Brett, am
> Fenster. Die sechs fehlen noch auf der Karte.
>
> Karol

---

## B · Deine Liste fürs Treffen

In dieser Reihenfolge. Die ersten drei sind Blocker — ohne sie geht nichts live.

### 1 · Hostinger-Zugang  ← ohne den kein Deploy
- Einloggen auf hpanel.hostinger.com, prüfen: ist die Domain
  **arampizzeria-bonn.de** dort, und läuft das Hosting noch (Ablaufdatum)?
- Dich als Nutzer hinzufügen oder die Zugangsdaten notieren. Du brauchst:
  Dateimanager (oder FTP) und den DNS-Bereich.
- Wer hat die alte Seite gebaut? Läuft da noch ein Vertrag oder eine Zahlung
  an eine Agentur? (Seite ist vom Juni 2026, Elementor — sieht nach
  Fremdauftrag aus.)

### 2 · Name im Impressum
- Google-Seite: **Arfan Omar**. Alte Seite: **Aram Omar, Shair Omar**.
- Was steht in der Gewerbeanmeldung? Einzelunternehmen (ein Name) oder GbR
  (beide Namen + „GbR")? Genau abschreiben, mit Rechtsform.
- Firmenname: „Aram Pizza & Orientalisches Gebäck" oder anders?

### 3 · WhatsApp-Nummer
- Flyer + Google: **0152 090 921 00**. Alte Seite + Seite jetzt: **0177 4637662**.
- Auf seinem Handy nachsehen: WhatsApp → Einstellungen → Profil. Die Nummer
  dort ist die richtige. Ist die 0177 dann noch die Nummer fürs Anrufen?

### 4 · Bestätigen (je ein Ja)
- Mail: arampizzeria@gmail.com
- Zeiten: Mo Ruhetag, Di–So 8–19 Uhr
- USt-IdNr DE368715327 (steht auf seiner alten Seite, ist gültig)
- Keine Teilnahme an Schlichtungsverfahren (steht auch dort)
- Instagram @aram.pizza — seins? Facebook?
- Lieferando / Wolt / Uber Eats — ja oder nein, ggf. Link

### 5 · Zusammen am Handy anschauen
- Die Seite auf SEINEM Handy, einmal durch. Was er sagt, aufschreiben.
- Sektion „Alles entsteht vor deinen Augen": orange (Standard) oder schwarz
  (https://karolinio.github.io/aram-web/?ton=nacht). Einer von euch
  entscheidet, dann fliegt der Schalter raus.
- Die sechs geratenen Fotos durchgehen (Muhammara, Lange Käse, Oliven,
  Hackfleisch, Groß Käse Gemüse, Doppelt Käse, Schamiyeh, Frischkäse,
  Schaorma Roll, Fahita, Hackfleisch & Gemüse) — er sagt, was was ist.
- Name des Käseschiffs auf der Karte.

### 6 · Fotos einsammeln
- Die sechs fehlenden Gerichte. Per AirDrop oder WhatsApp in Originalgröße.

---

## C · Was danach passiert

Sobald 1–3 da sind, ist es bei mir **ein Nachmittag**:

| Schritt | Was |
|---|---|
| Config | Name, Nummer, Domain, Hoster, Instagram, Lieferdienste in `aram.config.ts`; Impressum und Datenschutz füllen sich daraus |
| Datenschutz | Hoster = **HOSTINGER operations, UAB, Švitrigailos str. 34, LT-03230 Vilnius, Litauen** (EU — kein Drittland-Absatz nötig); AV-Vertrag liegt bei hostinger.com/legal/dpa |
| Bau | `ARAM_BASIS=/` statt `/aram-web/` — Basis wird die Wurzel |
| Hochladen | Inhalt von `dist/` nach `public_html` bei Hostinger; WordPress vorher wegräumen (Ordner umbenennen, nicht löschen — Rückweg) |
| .htaccess | `ErrorDocument 404 /404.html` + Weiterleitungen der alten Adressen: `/menu/` → `/#karte`, `/impressum/` → `/impressum.html` |
| Prüfen | Live-Check wie am 14.09.: 0 kaputte Anfragen, Links, Vorschaubild in WhatsApp testen |
| Google | Auf seiner Google-Unternehmensseite die Website-Adresse eintragen; Google-Sites-Seite abschalten |

Alternative, falls er den Hostinger-Zugang nicht findet: DNS der Domain auf
GitHub Pages zeigen + CNAME-Datei. Geht auch in einer Stunde — aber dann
hängt seine Seite an deinem GitHub-Konto, und der Hoster im Datenschutz wäre
GitHub Inc. (USA, Datenschutzrahmen). Hostinger ist der bessere Weg.

**Nicht am Treffen klären, kommt später:** Dampf-Clip für den Schwarm,
Hamburger-Menü, die 16 Bildschirmhöhen am Handy, Fotos nachpflegen.

---

## D · Karols Liste fürs Treffen (0–8), wie am 16.09. gegeben

0. Einstieg: „Die Seite ist fertig. Was fehlt, kann nur von dir kommen: drei
   Angaben und der Zugang zu deiner alten Seite." Kein Datum nennen, bevor
   der Zugang da ist.
1. Zeigen — auf SEINEM Handy: Start, Scrollen (Salve), Anrufen/WhatsApp
   antippen, Karte (16 mit Foto, 6 fehlen), Galerie, Der Laden, Impressum.
   Was er sagt: aufschreiben, nicht diskutieren.
2. Blocker: (a) Hostinger-Zugang — wer hat die alte Seite gebaut, hPanel,
   Karol als Nutzer hinzufügen, Ablaufdatum, zahlt er noch jemandem?
   (b) Name — Gewerbeanmeldung abfotografieren, ein Name = Einzelunternehmen,
   zwei = GbR. (c) WhatsApp-Nummer — in WhatsApp-Einstellungen nachsehen:
   0152 090 921 00 oder 0177 4637662; Anruf-Nummer getrennt fragen.
3. Bestätigen: Mail arampizzeria@gmail.com · Mo Ruhetag, Di–So 8–19 ·
   Festnetz 0228 18034488 · USt-IdNr DE368715327 · keine Schlichtung ·
   Instagram @aram.pizza / Facebook · Lieferdienste · Parkplatz Auf der
   Urdel · „mehr als 25 Jahre".
4. Entscheiden: Orange/Schwarz (`?ton=nacht`) · geratene Fotos durchgehen
   (Muhammara, Lange Käse, Oliven, Hackfleisch, Groß Käse Gemüse, Doppelt
   Käse, Schamiyeh, Frischkäse, Schaorma Roll, Fahita, Hackfleisch &
   Gemüse) · Name des Käseschiffs · Satz in „Der Laden".
5. Mitnehmen: 6 Fotos (Beirut, Spinat, Mexicano Roll, Sucuk, Sucuk mit
   Käse, Gemüse Käse) als Dokument/AirDrop · Foto Gewerbeanmeldung · ggf.
   Kartenblatt.
6. Erklären: „ein Nachmittag nach Zugang, dann auf arampizzeria-bonn.de,
   alte Links leiten um, du pflegst nichts, Hosting zahlst du schon."
7. Nicht tun: nichts an der alten Seite ändern · kein Livegang heute ·
   nicht raten lassen · nichts Neues zusagen (Lieferando o. ä.).
8. Häkchen vor dem Gehen: Zugang · Name+Rechtsform · Nummern · 9 Ja/Nein ·
   Orange/Schwarz · Liste falscher Zuordnungen · 6 Fotos · seine Wünsche.
