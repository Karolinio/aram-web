/**
 * Der Schwarm — was links durch die Sektion fliegt.
 *
 * ═══ Die Lagen sind gesetzt, nicht gewürfelt ═══
 *
 * Sie wechseln sich links/rechts ab und rücken von oben nach unten weiter —
 * gemessen, weil beim ersten Versuch Pizza, Manakisch und Lahm bi Ajin unten
 * links zu einem Klumpen zusammenfielen. Acht Gegenstände auf einer Bahn
 * brauchen einen Plan; zufällige Werte ergeben immer irgendwo drei, die sich
 * überdecken.
 *
 * ═══ Die Lagen sind Prozent der SEKTION, nicht der Spalte ═══
 *
 * Bis zum 16.08. lag der Schwarm in der linken Gitterspalte und war damit auf
 * deren Breite beschränkt — 44 % davon sind auf 1440 px gerade 260 px, und das
 * ist kein fliegendes Gericht, das ist ein Aufkleber. Jetzt liegt er auf
 * Sektionsebene: dieselben Prozente bedeuten das Doppelte.
 *
 * Sie wechseln sich links/rechts ab und rücken von oben nach unten weiter. Acht
 * Gegenstände auf einer Bahn brauchen einen Plan; zufällige Werte ergeben immer
 * irgendwo drei, die sich überdecken.
 *
 * ═══ Echt und erzeugt, und warum das hier steht ═══
 *
 * Genau EIN Gericht auf dieser Seite ist ihr Essen: das Fata’er aus dem Scan
 * ihrer alten Seite, hochskaliert und freigestellt. Die anderen vier sind am
 * 15.08.2026 erzeugt worden — auf Karols ausdrückliche Entscheidung, nachdem er
 * zweimal danach gefragt hatte.
 *
 * Das Feld `echt` ist kein Schmuck. Es steht hier, damit die Unterscheidung im
 * Code sichtbar bleibt und nicht in einem Ordnernamen versickert:
 *
 *   - `alt` beschreibt bei erzeugten Bildern das Gericht, nicht „ein Foto von"
 *   - die Konsole meldet beim Start, wie viele erzeugte Bilder ausgeliefert
 *     werden, damit niemand die Seite für fertig fotografiert hält
 *   - beim Eintreffen der echten Aufnahmen ist die Austauschliste diese Datei
 *
 * Siehe public/bilder/erzeugt/LIESMICH.md und DIRECTION.md, Amendement 2.3.
 *
 * ═══ Die Bahnen ═══
 *
 * Alle fliegen von OBEN nach UNTEN — `y` beginnt negativ und endet positiv.
 * Verschiedene Weiten, Drehungen und Grössen; wer nah ist, ist gross und dreht
 * sich weiter. Die Zahlen sind nicht beliebig: zusammen ergeben sie ein Feld,
 * in dem sich nichts überholt und nichts überlappt.
 */

export type Gebaeck = {
  id: string
  name: string
  /**
   * Die Ansichten desselben Gerichts, rundherum.
   *
   * Beim Scrollen wird durchgeschaltet — und genau daraus entsteht die
   * Drehung. Das ist die Mechanik, die die Direktion von Anfang an vorsah
   * („Die Drehung entsteht aus Bildfolgen, 3–4 Aufnahmen rundherum, per
   * Scrollfortschritt durchgeschaltet") und die bei nacho-macho aussah wie
   * echtes 3D.
   *
   * EIN Bild ist erlaubt: dann dreht sich nur die CSS-Ebene, und das Gericht
   * kippt, ohne seine Rückseite zu zeigen.
   */
  bilder: string[]
  /** Zeigt es IHR Essen? */
  echt: boolean
  alt: string
  /** Position in der linken Spur, in Prozent. */
  li: number
  ob: number
  /** Breite in Prozent der Spur. */
  gr: number
  /** Die ECHTEN Masse der Datei. Nicht geschätzt — der Prüfer misst nach, und
      ein falsch deklariertes Verhältnis reserviert die falsche Höhe. */
  breite: number
  hoehe: number
  y: [number, number]
  x: [number, number]
  dreh: [number, number]
  drehY: [number, number]
  drehX: [number, number]
  z: [number, number]
  skala: [number, number]
}

export const GEBAECKE: Gebaeck[] = [
  {
    id: 'fatayer',
    name: "Fata’er",
    bilder: ['/bilder/echt/fatayer-frei.webp'],
    echt: true,
    alt: 'Ein Fata’er von Aram, gewölbt und glänzend, dicht mit Sesam und Schwarzkümmel bestreut',
    li: 4,
    ob: 8,
    gr: 26,
    breite: 1000,
    hoehe: 799,
    /* Das echte fliegt am weitesten und am grössten — es ist das einzige, das
       zeigt, was der Gast bekommt. */
    y: [-0.34, 0.5],
    x: [-0.04, 0.08],
    dreh: [-12, 10],
    drehY: [-26, 22],
    drehX: [10, -8],
    z: [-140, 150],
    skala: [0.88, 1.06],
  },
  {
    id: 'kaeseschiffchen',
    name: 'Käseschiffchen',
    bilder: [
      '/bilder/erzeugt/kaeseschiffchen.webp',
      '/bilder/erzeugt/kaeseschiffchen-2.webp',
      '/bilder/erzeugt/kaeseschiffchen-3.webp',
    ],
    echt: false,
    alt: 'Ein Käseschiffchen in Bootsform, mit geschmolzenem Käse gefüllt',
    li: 68,
    ob: 18,
    gr: 24,
    breite: 1000,
    hoehe: 746,
    y: [-0.48, 0.34],
    x: [0.03, -0.06],
    dreh: [9, -13],
    drehY: [20, -24],
    drehX: [-7, 11],
    z: [-260, 40],
    skala: [0.8, 0.98],
  },
  {
    id: 'lahmacun',
    name: 'Lahmacun',
    bilder: [
      '/bilder/erzeugt/lahmacun.webp',
      '/bilder/erzeugt/lahmacun-2.webp',
      '/bilder/erzeugt/lahmacun-3.webp',
    ],
    echt: false,
    alt: 'Ein Lahmacun, dünn ausgerollt, mit Hackfleisch, Petersilie und einer Zitronenspalte',
    li: 14,
    ob: 40,
    gr: 21,
    breite: 1000,
    hoehe: 1000,
    y: [-0.28, 0.62],
    x: [-0.05, 0.1],
    dreh: [-16, 8],
    drehY: [-18, 26],
    drehX: [12, -6],
    z: [-340, -60],
    skala: [0.72, 0.9],
  },
  {
    id: 'manakisch',
    name: 'Manakisch',
    bilder: ['/bilder/erzeugt/manakisch.webp', '/bilder/erzeugt/manakisch-2.webp'],
    echt: false,
    alt: 'Ein Manakisch, rundes Fladenbrot mit Zaatar und Olivenöl',
    li: 78,
    ob: 52,
    gr: 17,
    breite: 1000,
    hoehe: 1000,
    y: [-0.4, 0.28],
    x: [0.06, -0.04],
    dreh: [13, -9],
    drehY: [24, -16],
    drehX: [-9, 7],
    z: [-420, -140],
    skala: [0.64, 0.8],
  },
  {
    id: 'fatayer-spinat',
    name: "Fata’er mit Spinat",
    bilder: [
      '/bilder/erzeugt/fatayer-spinat.webp',
      '/bilder/erzeugt/fatayer-spinat-2.webp',
      '/bilder/erzeugt/fatayer-spinat-3.webp',
    ],
    echt: false,
    alt: 'Ein Fata’er mit Spinat, gewölbt und glänzend, mit Sesam und Schwarzkümmel',
    li: 86,
    ob: 84,
    gr: 14,
    breite: 1000,
    hoehe: 746,
    y: [-0.22, 0.44],
    x: [-0.03, 0.07],
    dreh: [-8, 16],
    drehY: [-14, 22],
    drehX: [7, -12],
    z: [-500, -200],
    skala: [0.58, 0.74],
  },
  {
    id: 'pizza',
    name: 'Pizza Margherita',
    bilder: [
      '/bilder/erzeugt/pizza.webp',
      '/bilder/erzeugt/pizza-2.webp',
      '/bilder/erzeugt/pizza-3.webp',
    ],
    echt: false,
    alt: 'Eine Pizza Margherita mit Tomate, Mozzarella und Basilikum',
    li: 2,
    ob: 66,
    gr: 23,
    breite: 1000,
    hoehe: 1000,
    y: [-0.34, 0.4],
    x: [0.04, -0.08],
    dreh: [11, -14],
    drehY: [18, -22],
    drehX: [-8, 10],
    z: [-300, -40],
    skala: [0.7, 0.88],
  },
  {
    id: 'fatayer-hack',
    name: "Fata’er mit Hackfleisch",
    bilder: [
      '/bilder/erzeugt/fatayer-hack.webp',
      '/bilder/erzeugt/fatayer-hack-2.webp',
      '/bilder/erzeugt/fatayer-hack-3.webp',
    ],
    echt: false,
    alt: 'Ein Fata’er mit Hackfleisch, gewölbt und glänzend, mit Sesam und Schwarzkümmel',
    li: 58,
    ob: 76,
    gr: 15,
    breite: 1000,
    hoehe: 746,
    y: [-0.2, 0.5],
    x: [-0.06, 0.04],
    dreh: [-10, 12],
    drehY: [-20, 18],
    drehX: [9, -11],
    z: [-380, -100],
    skala: [0.6, 0.78],
  },
  {
    id: 'lahm-bi-ajin',
    name: 'Lahm bi Ajin',
    bilder: [
      '/bilder/erzeugt/lahm-bi-ajin.webp',
      '/bilder/erzeugt/lahm-bi-ajin-2.webp',
      '/bilder/erzeugt/lahm-bi-ajin-3.webp',
    ],
    echt: false,
    alt: 'Ein Lahm bi Ajin, kleines dickrandiges Fladenbrot mit würzigem Hackfleisch',
    li: 28,
    ob: 86,
    gr: 19,
    breite: 1000,
    hoehe: 1000,
    y: [-0.44, 0.24],
    x: [0.05, -0.05],
    dreh: [14, -8],
    drehY: [22, -14],
    drehX: [-10, 8],
    z: [-460, -180],
    skala: [0.56, 0.72],
  },
]
/** Wie viele der ausgelieferten Gerichtebilder sind erzeugt? */
export const erzeugteGerichte = (): number => GEBAECKE.filter((g) => !g.echt).length

/** Wie viele Ansichten liegen insgesamt aus? Sagt, wie weit die Drehung trägt. */
export const ansichten = (): number => GEBAECKE.reduce((s, g) => s + g.bilder.length, 0)
