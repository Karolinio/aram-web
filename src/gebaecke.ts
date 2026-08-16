/**
 * Der Schwarm — was links durch die Sektion fliegt.
 *
 * ═══ EINE Bahn links, nicht acht Punkte im Feld ═══
 *
 * Karol: „die Parallax-Animation mit den ganzen Gerichten links oder rechts auf
 * der Seite von unten nach oben."
 *
 * Vorher lagen die acht über die ganze Sektionsbreite verstreut — vier links,
 * vier rechts, dazwischen Leere. Verstreut ist aber kein Strom: man sieht acht
 * einzelne Gegenstände, die zufällig gleichzeitig unterwegs sind. Ein Strom
 * entsteht erst, wenn sie DIESELBE Bahn nehmen und sich darin überholen.
 *
 * Also liegen alle `li` jetzt zwischen 0 und 30 % — eine Spur am linken Rand,
 * halb über die Kante hinaus. Die rechte Seite gehört dem Text und den beiden
 * Prozessbildern; dort war vorher die Hälfte des Schwarms und musste ihnen
 * ausweichen.
 *
 * Die Lagen sind Prozent der SEKTION, nicht der Spalte. Bis zum 16.08. lag der
 * Schwarm in der linken Gitterspalte und war damit auf deren Breite beschränkt
 * — 44 % davon sind auf 1440 px gerade 260 px, und das ist kein fliegendes
 * Gericht, das ist ein Aufkleber.
 *
 * Die `ob`-Werte staffeln sich gleichmässig von 6 auf 92 %: acht Gegenstände
 * auf EINER Bahn brauchen einen Plan, sonst fallen drei zu einem Klumpen
 * zusammen. Genau das war beim ersten Versuch passiert.
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
 * ═══ Die Bahnen: von UNTEN nach OBEN ═══
 *
 * Bis zum 16.08. fielen sie von oben nach unten. Karol: „ich möchte, dass diese
 * Parallax-Animation mit den ganzen Gerichten von unten nach oben
 * scroll-driven mit GSAP umgesetzt wird."
 *
 * Er hat recht, und der Grund ist nicht Geschmack. Ein Gegenstand, der beim
 * Herunterscrollen mitfällt, bewegt sich MIT dem Scroll — man sieht ihn kaum,
 * weil er relativ zur Seite fast stillsteht. Einer, der dabei aufsteigt,
 * bewegt sich GEGEN den Scroll und wird dadurch doppelt so schnell. Genau
 * daher kommt bei Savor das Gefühl von Tiefe.
 *
 * Deshalb beginnt `y` jetzt positiv (unterhalb) und endet negativ (oberhalb).
 *
 * ═══ Und sie drehen sich sichtbar ═══
 *
 * Karol: „und sich nicht dreht". Die Drehung war da — sie war nur zu klein,
 * um sie zu bemerken: 22 Grad über eine ganze Sektion sind pro Bildschirmhöhe
 * kaum zehn. Alle `dreh`-Werte sind auf das 2,8-Fache gegangen, `drehY` aufs
 * 1,5-Fache. Jetzt macht ein Gebäck über die Sektion eine gute Halbdrehung in
 * der Bildebene, und die Hochachse kippt weit genug, dass man die Kante sieht.
 *
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
  /** Breite in Prozent der Sektion. */
  gr: number
  /**
   * Dieselbe Bahn am Handy — eigene Werte, gleiche Mechanik.
   *
   * Karol: „ich wollte eig von anfang an das mobil genauso 1:1 mitgebaut
   * wird." Bis zum 16.08. stand der Schwarm am Handy still, weil neben dem
   * Inhalt keine freie Bahn ist. Das war meine Entscheidung, nicht seine
   * Vorgabe — und sie war falsch: es gibt eine Bahn, sie liegt nur AUF der
   * rechten Kante statt daneben. Die Gerichte fliegen halb aus dem Bild, und
   * genau das lässt sie gross wirken statt gedrängt.
   */
  liM: number
  grM: number
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
    li: 2,
    ob: 6,
    gr: 26,
    liM: 58,
    grM: 52,
    breite: 1000,
    hoehe: 799,
    /* Das echte fliegt am weitesten und am grössten — es ist das einzige, das
       zeigt, was der Gast bekommt. */
    y: [0.5, -0.34],
    x: [-0.04, 0.08],
    dreh: [-34, 28],
    drehY: [-39, 33],
    drehX: [14, -11],
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
    li: 24,
    ob: 20,
    gr: 24,
    liM: 72,
    grM: 44,
    breite: 1000,
    hoehe: 746,
    y: [0.34, -0.48],
    x: [0.03, -0.06],
    dreh: [25, -36],
    drehY: [30, -36],
    drehX: [-10, 15],
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
    li: 6,
    ob: 36,
    gr: 21,
    liM: 54,
    grM: 48,
    breite: 1000,
    hoehe: 1000,
    y: [0.62, -0.28],
    x: [-0.05, 0.1],
    dreh: [-45, 22],
    drehY: [-27, 39],
    drehX: [17, -8],
    z: [-340, -60],
    skala: [0.72, 0.9],
  },
  {
    id: 'manakisch',
    name: 'Manakisch',
    bilder: ['/bilder/erzeugt/manakisch.webp', '/bilder/erzeugt/manakisch-2.webp'],
    echt: false,
    alt: 'Ein Manakisch, rundes Fladenbrot mit Zaatar und Olivenöl',
    li: 28,
    ob: 48,
    gr: 17,
    liM: 76,
    grM: 38,
    breite: 1000,
    hoehe: 1000,
    y: [0.28, -0.4],
    x: [0.06, -0.04],
    dreh: [36, -25],
    drehY: [36, -24],
    drehX: [-13, 10],
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
    li: 10,
    ob: 62,
    gr: 14,
    liM: 74,
    grM: 36,
    breite: 1000,
    hoehe: 746,
    y: [0.44, -0.22],
    x: [-0.03, 0.07],
    dreh: [-22, 45],
    drehY: [-21, 33],
    drehX: [10, -17],
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
    li: 0,
    ob: 74,
    gr: 23,
    liM: 60,
    grM: 50,
    breite: 1000,
    hoehe: 1000,
    y: [0.4, -0.34],
    x: [0.04, -0.08],
    dreh: [31, -39],
    drehY: [27, -33],
    drehX: [-11, 14],
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
    li: 30,
    ob: 84,
    gr: 15,
    liM: 78,
    grM: 34,
    breite: 1000,
    hoehe: 746,
    y: [0.5, -0.2],
    x: [-0.06, 0.04],
    dreh: [-28, 34],
    drehY: [-30, 27],
    drehX: [13, -15],
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
    li: 12,
    ob: 92,
    gr: 19,
    liM: 56,
    grM: 44,
    breite: 1000,
    hoehe: 1000,
    y: [0.24, -0.44],
    x: [0.05, -0.05],
    dreh: [39, -22],
    drehY: [33, -21],
    drehX: [-14, 11],
    z: [-460, -180],
    skala: [0.56, 0.72],
  },
]
/** Wie viele der ausgelieferten Gerichtebilder sind erzeugt? */
export const erzeugteGerichte = (): number => GEBAECKE.filter((g) => !g.echt).length

/** Wie viele Ansichten liegen insgesamt aus? Sagt, wie weit die Drehung trägt. */
export const ansichten = (): number => GEBAECKE.reduce((s, g) => s + g.bilder.length, 0)
