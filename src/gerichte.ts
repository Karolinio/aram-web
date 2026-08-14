/**
 * Die Gerichte-Slots — wo welches freigestellte Foto hinkommt.
 *
 * ═══ Warum es diese Datei gibt ═══
 *
 * Die Seite wurde am 14.08.2026 OHNE die echten Fotos gebaut. Das verstoesst gegen
 * Regel 1 des Pruefers („alle Assets zuerst") und Karol hat es bewusst so entschieden,
 * weil der Inhaber im Urlaub ist und die Fotos erst danach kommen.
 *
 * Der Schaden dieser Reihenfolge ist immer derselbe: das Layout entsteht um Loecher
 * herum, und wenn das Bild kommt, passt es nicht — dann wird umkomponiert statt
 * eingesetzt. Diese Datei ist die Gegenmassnahme. Jeder Slot ist VERMESSEN: Seiten-
 * verhaeltnis, Breite, Z-Tiefe, Anfangs- und Enddrehung, und der Scroll-Abschnitt, in
 * dem er sich bewegt. Wer ein Foto liefert, das dazu passt, tauscht eine Datei — er
 * baut keine Sektion neu.
 *
 * ═══ Was daraus abgeleitet wird ═══
 *
 *   src/komponenten/ui/Gericht.tsx   rendert den Slot, mit Foto oder ohne
 *   public/bilder/FOTOLISTE.md       die Anweisung fuer Karol, erzeugt aus dieser Datei
 *   Ein HTML-Kommentar im DOM        damit man es im Browser-Inspektor sieht
 *
 * Es gibt bewusst KEINE zweite Liste. Wer hier etwas aendert, aendert es ueberall.
 */

export type Slot = {
  /** Kennung. Wird zum Dateinamen: public/bilder/<id>.webp */
  id: string
  /** Wie das Gericht auf der Karte heisst */
  name: string
  /** In welcher Sektion es steht */
  sektion: 'ofen' | 'gerichte' | 'weg' | 'laden'
  /**
   * Seitenverhaeltnis Breite/Hoehe des FREIGESTELLTEN Objekts, ohne Rand.
   * Danach richtet sich der reservierte Platz — deshalb steht es hier und nicht im CSS.
   */
  verhaeltnis: number
  /** Breite in vw auf dem Desktop. Am Handy wird auf 82vw gedeckelt. */
  breiteVw: number
  /** Z-Ebene. Groesser = naeher am Betrachter, kommt spaeter und staerker aus der Tiefe. */
  ebene: 1 | 2 | 3
  /** Drehung beim Eintreten und am Ende, in Grad. Der Ofenschieber kippt leicht. */
  drehung: [von: number, bis: number]
  /** Wo im Scrollfortschritt der Sektion (0–1) die Bewegung laeuft. */
  fortschritt: [von: number, bis: number]
  /** Freisteller (transparent) oder rechteckiges Foto? */
  freisteller: boolean
  /** Was der Fotograf tun muss, damit dieses Bild passt. */
  aufnahme: string
}

/** Reihenfolge = Reihenfolge auf der Seite. Wer umsortiert, sortiert die Seite um. */
export const SLOTS: Slot[] = [
  {
    id: 'ofen-feuer',
    name: 'Der Ofen',
    sektion: 'ofen',
    verhaeltnis: 1.78,
    breiteVw: 100,
    ebene: 1,
    drehung: [0, 0],
    fortschritt: [0, 1],
    freisteller: false,
    aufnahme:
      'Der Ofen mit Feuer, quer. Wird der Hintergrund der Startseite. Dunkel ist gut — ' +
      'die Seite ist ohnehin dunkel, und die Glut soll die einzige helle Stelle sein.',
  },
  {
    id: 'fatayer-hero',
    name: "Fata'er",
    sektion: 'ofen',
    verhaeltnis: 1.35,
    breiteVw: 26,
    ebene: 3,
    drehung: [-7, -2],
    fortschritt: [0, 0.55],
    freisteller: true,
    aufnahme:
      'Ein einzelnes Fatayer auf Backpapier, von schraeg oben (ca. 35 Grad), Tageslicht ' +
      'am Fenster. Rundherum Platz lassen. Dieses Bild ist das MASTER — alle anderen ' +
      'Gerichtefotos werden per image-to-image daraus abgeleitet, damit Licht und Farbe ' +
      'ueber die ganze Seite stimmen. Deshalb: das schoenste Exemplar nehmen.',
  },
  {
    id: 'kaeseschiffchen',
    name: 'Kaeseschiffchen',
    sektion: 'gerichte',
    verhaeltnis: 1.9,
    breiteVw: 30,
    ebene: 3,
    drehung: [-9, -3],
    fortschritt: [0.05, 0.45],
    freisteller: true,
    aufnahme:
      'Pide-Form, laengs im Bild. 3–4 Aufnahmen rundherum (einmal um das Blech gehen), ' +
      'damit es sich auf der Seite drehen kann. Kaese noch glaenzend, direkt aus dem Ofen.',
  },
  {
    id: 'lahmacun',
    name: 'Lahmacun',
    sektion: 'gerichte',
    verhaeltnis: 1,
    breiteVw: 24,
    ebene: 2,
    drehung: [6, 1],
    fortschritt: [0.15, 0.55],
    freisteller: true,
    aufnahme:
      'Flach von schraeg oben, Rand leicht gewellt sichtbar. Petersilie und Zitrone ' +
      'drauf, wenn ihr es so serviert — das ist die Farbe, die im Bild sonst fehlt.',
  },
  {
    id: 'pizza',
    name: 'Pizza',
    sektion: 'gerichte',
    verhaeltnis: 1,
    breiteVw: 28,
    ebene: 3,
    drehung: [-4, 4],
    fortschritt: [0.25, 0.7],
    freisteller: true,
    aufnahme:
      'Ganze Pizza, von schraeg oben. 4 Aufnahmen rundherum — sie dreht sich auf der ' +
      'Seite langsam mit dem Scroll. Kaese noch blasig.',
  },
  {
    id: 'manakish',
    name: 'Manakish',
    sektion: 'gerichte',
    verhaeltnis: 1.15,
    breiteVw: 22,
    ebene: 1,
    drehung: [8, 2],
    fortschritt: [0.35, 0.8],
    freisteller: true,
    aufnahme: 'Mit Zaatar, von schraeg oben. Ein Exemplar reicht.',
  },
  {
    id: 'weg-1-teig',
    name: 'Der Teig',
    sektion: 'weg',
    verhaeltnis: 1.4,
    breiteVw: 34,
    ebene: 2,
    drehung: [-3, 0],
    fortschritt: [0, 0.25],
    freisteller: true,
    aufnahme:
      'Die gerollte Teigscheibe, noch leer, auf der Arbeitsflaeche. Von schraeg oben, ' +
      'gleiche Kameraposition wie die naechsten drei — die vier Bilder sind EINE ' +
      'Bewegung. Am besten Handy auf einen Stapel Kartons legen und nicht mehr anfassen.',
  },
  {
    id: 'weg-2-belegt',
    name: 'Belegt',
    sektion: 'weg',
    verhaeltnis: 1.4,
    breiteVw: 34,
    ebene: 2,
    drehung: [0, 0],
    fortschritt: [0.25, 0.5],
    freisteller: true,
    aufnahme: 'Derselbe Teig, jetzt belegt. Kamera NICHT bewegen.',
  },
  {
    id: 'weg-3-ofen',
    name: 'Im Ofen',
    sektion: 'weg',
    verhaeltnis: 1.4,
    breiteVw: 34,
    ebene: 2,
    drehung: [0, 0],
    fortschritt: [0.5, 0.75],
    freisteller: true,
    aufnahme:
      'Im Ofen, Glut sichtbar. Hier darf die Kamera naeher ran — das ist der Moment, ' +
      'in dem die Seite am hellsten wird.',
  },
  {
    id: 'weg-4-fertig',
    name: 'Fertig',
    sektion: 'weg',
    verhaeltnis: 1.4,
    breiteVw: 34,
    ebene: 3,
    drehung: [0, -2],
    fortschritt: [0.75, 1],
    freisteller: true,
    aufnahme: 'Fertig gebacken, herausgenommen, auf Backpapier. Wieder dieselbe Kamera.',
  },
  {
    id: 'laden-aussen',
    name: 'Der Laden',
    sektion: 'laden',
    verhaeltnis: 1.6,
    breiteVw: 46,
    ebene: 1,
    drehung: [0, 0],
    fortschritt: [0, 0.4],
    freisteller: false,
    aufnahme:
      'Die Ladenfront mit Schild, frontal, am besten abends wenn drinnen Licht brennt. ' +
      'KEIN Freisteller — dieses Bild bleibt rechteckig. Es ist der Beweis, dass es den ' +
      'Laden gibt, deshalb darf es nicht erzeugt werden.',
  },
]

export const slotsVon = (sektion: Slot['sektion']) => SLOTS.filter((s) => s.sektion === sektion)
export const slot = (id: string) => SLOTS.find((s) => s.id === id)
