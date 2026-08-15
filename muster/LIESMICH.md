# MUSTER — erzeugte Bilder, NICHT für die Live-Seite

Diese fünf Bilder sind am 15.08.2026 mit `nano_banana_pro` erzeugt worden. Sie sind
**Verkaufsmuster**, damit der Inhaber sieht, was möglich ist. Sie zeigen **nicht sein
Essen**.

## Die Regel, ohne Ausnahme

**Kein Bild aus diesem Ordner geht live.** Nicht als Platzhalter, nicht „für den ersten
Entwurf", nicht „bis die echten kommen". Deshalb heissen sie `MUSTER-*`.

> **Verschoben am 15.08.2026.** Der Ordner lag vorher unter `public/bilder/muster/`.
> Alles unter `public/` kopiert Vite unverändert in den Build — die fünf Muster waren
> damit auf einer ausgerollten Seite unter `/bilder/muster/MUSTER-fatayer.png` öffentlich
> abrufbar. Die Regel „geht nicht live" stand als Satz in dieser Datei und war technisch
> nicht durchgesetzt. Jetzt liegt der Ordner ausserhalb von `public/`: er ist im Repo,
> zum Zeigen und Vergleichen, und kommt nicht mehr in den Build.
> Nebenbei: der Build ist dadurch von 8,7 MB auf 1,1 MB geschrumpft.

Ein erzeugtes Fatayer ist eine Aussage über ein Produkt, das der Gast gleich in der Hand
hält. Wenn die Pizza auf der Seite anders aussieht als die im Karton, ist das keine
Gestaltungsfrage — das ist eine Enttäuschung an der Theke, und bei Lebensmitteln
rechtlich heikel.

## Wofür sie gut sind

1. **Dem Inhaber zeigen**, wie freigestellte Gerichte auf der Seite wirken.
2. **Die Slots prüfen** — ob Seitenverhältnis, Grösse und Drehung in `src/gerichte.ts`
   stimmen, bevor die echten Fotos da sind.
3. **Als Vorlage für den Fototermin.** Genau so soll aufgenommen werden: von schräg oben
   (ca. 35°), Tageslicht von links, sauberer heller Grund, rundherum Platz.

## Was beim Zeigen gesagt werden muss

> „So ungefähr — aber mit euren Sachen. Dafür brauche ich Fotos von euch."

Ohne diesen Satz erwartet der Inhaber später eine Seite, die aussieht wie diese Bilder,
und seine echten Fotos werden ihn enttäuschen. Erzeugte Bilder sehen fast immer besser
aus als echte, und genau das ist die Falle.

## Woran sie sich orientieren

Am **echten** Fatayer aus ihrem Scan (`register/aram/assets/0d0f9174.webp`): gewölbt wie
ein gefülltes Brötchen, glänzend eiergestrichen, grosszügig mit Sesam **und**
Schwarzkümmel. Nicht flach. Wer neue Muster erzeugt, trifft diese Beschreibung — sonst
ist es irgendein Gebäck und nicht ihres.

| Datei | Gericht |
|---|---|
| `MUSTER-fatayer.png` | Fata'er |
| `MUSTER-kaeseschiffchen.png` | Käseschiffchen / Pide |
| `MUSTER-lahmacun.png` | Lahmacun |
| `MUSTER-pizza.png` | Pizza |
| `MUSTER-manakisch.png` | Manakisch mit Zaatar |
