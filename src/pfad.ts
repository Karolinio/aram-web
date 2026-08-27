/**
 * Ein Pfad zu einer Datei in `public/`, der auch unter einem Unterpfad stimmt.
 *
 * ═══ Warum es diese Datei gibt ═══
 *
 * Die Seite läuft je nach Ziel unter `/` oder unter `/aram-vorschau/`. Für
 * Pfade, die als ZEICHENKETTE im Quelltext stehen, erledigt das ein Plugin in
 * vite.config.ts: es ersetzt `"/bilder/…` beim Bauen.
 *
 * Genau daran ist die Galerie gescheitert. Sie baut ihre Pfade zur Laufzeit
 * aus einer Nummer zusammen:
 *
 *     src={`/bilder/galerie/${nr}.webp`}
 *
 * Nach dem Bündeln steht davon `bilder/galerie/${s}.webp` im Ergebnis — kein
 * Anführungszeichen davor, also kein Treffer für das Plugin. Auf der
 * Vorschau-Adresse zeigten alle sieben Bögen deshalb ins Leere; sichtbar war
 * nur noch der Alt-Text, halb aus dem Rahmen laufend.
 *
 * ═══ Warum nicht einfach das Plugin schlauer machen ═══
 *
 * Weil jede Textersetzung dieselbe Schwäche behält: sie muss raten, welche
 * Zeichenketten Pfade sind. Der nächste Pfad, der anders zusammengesetzt wird,
 * fällt wieder durch — und zwar lautlos, weil ein 404 auf einem Bild keine
 * Fehlermeldung erzeugt.
 *
 * `import.meta.env.BASE_URL` ist die Angabe, die Vite selbst führt. Sie kann
 * nicht danebenliegen, weil sie dieselbe Quelle hat wie `base`.
 */
export const pfad = (relativ: string): string =>
  import.meta.env.BASE_URL.replace(/\/$/, '') + '/' + relativ.replace(/^\//, '')
