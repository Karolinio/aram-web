/**
 * Der Schwarm — was links durch die Sektion fliegt.
 *
 * ═══ Warum die obersten beiden nicht ganz links liegen ═══
 *
 * Oben links klebt die Beschriftung „03 Erst dann belegt". Gemessen: mit
 * `li: 6` flog das echte Fata’er genau darüber und machte den Text unlesbar.
 * Die oberen Bahnen weichen deshalb nach rechts aus — unten, wo kein Text
 * steht, dürfen sie wieder an den Rand.
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
  quelle: string
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
    quelle: '/bilder/echt/fatayer-frei.png',
    echt: true,
    alt: 'Ein Fata’er von Aram, gewölbt und glänzend, dicht mit Sesam und Schwarzkümmel bestreut',
    li: 30,
    ob: 6,
    gr: 44,
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
    quelle: '/bilder/erzeugt/kaeseschiffchen.png',
    echt: false,
    alt: 'Ein Käseschiffchen in Bootsform, mit geschmolzenem Käse gefüllt',
    li: 2,
    ob: 34,
    gr: 38,
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
    quelle: '/bilder/erzeugt/lahmacun.png',
    echt: false,
    alt: 'Ein Lahmacun, dünn ausgerollt, mit Hackfleisch, Petersilie und einer Zitronenspalte',
    li: 52,
    ob: 40,
    gr: 34,
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
    quelle: '/bilder/erzeugt/manakisch.png',
    echt: false,
    alt: 'Ein Manakisch, rundes Fladenbrot mit Zaatar und Olivenöl',
    li: 12,
    ob: 58,
    gr: 30,
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
    quelle: '/bilder/erzeugt/fatayer-spinat.png',
    echt: false,
    alt: 'Ein Fata’er mit Spinat, gewölbt und glänzend, mit Sesam und Schwarzkümmel',
    li: 44,
    ob: 76,
    gr: 26,
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
]

/** Wie viele der ausgelieferten Gerichtebilder sind erzeugt? */
export const erzeugteGerichte = (): number => GEBAECKE.filter((g) => !g.echt).length
