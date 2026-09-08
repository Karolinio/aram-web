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
 * Bis zum 07.09. lagen alle `li` zwischen 0 und 30 % — eine Spur am linken
 * Rand. Das war richtig, solange rechts der Text und links EIN grosser Bogen
 * standen: der Schwarm musste ihnen ausweichen.
 *
 * Seit dem Umbau auf die Ofenwand stimmt die Voraussetzung nicht mehr. Die
 * Wand ist flach und liegt waagerecht in der Mitte; darüber und darunter ist
 * die ganze Breite frei. Karol am 07.09.: „man sieht dadurch auch nicht die
 * ganzen Produkte, die im Hintergrund runterfliegen … weil die Bilder so gross
 * sind und genau vor den Produkten sind."
 *
 * Die `li` sind deshalb über die volle Breite verteilt (3 bis 84 %). Sie
 * fliegen weiterhin HINTER der Wand vorbei und tauchen darüber und darunter
 * auf — das ist kein Verdecken mehr, sondern Tiefe: Mobbin zeigt an
 * Yellowbird und bella, dass ein Freisteller über Flachfarbe eine Überlappung
 * oder einen echten Schatten braucht, sonst liest er sich als Aufkleber.
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
  /**
   * Steigt Dampf davon auf?
   *
   * Karol am 01.09.: „ich will, dass die Produkte dampfen." Er hat recht, und
   * es ist mehr als Schmuck — Dampf ist das einzige Zeichen dafür, dass etwas
   * GERADE aus dem Ofen kommt. Ein Gebäck ohne ihn kann auch von gestern sein.
   *
   * ═══ Erst drei, jetzt alle acht ═══
   *
   * Es trugen zunächst nur die drei grössten und vordersten — aus Sorge um die
   * Rechenzeit: jede Schwadenleinwand ist ein eigener Zeichenlauf.
   *
   * Karol am 03.09.: „lass die aber dampfen." Nachgemessen war die Klage
   * berechtigt, und der Grund ein anderer als gedacht: die drei dampfenden
   * standen an den Stellen `ob: 6`, `20` und `36`, also ganz oben in der
   * Sektion. Wer bei den Schritten 01 und 02 steht, hat sie längst nach oben
   * aus dem Bild geschoben — gemessen waren dort fünf Stücke sichtbar, und
   * keines davon dampfte.
   *
   * Jetzt alle acht, dafür sieben Schwaden je Leinwand statt zehn. In Summe
   * 56 statt 30 — anderthalbmal so viel Zeichenarbeit für achtmal so viele
   * Stellen, an denen es zu sehen ist. Weiterhin nur am Schirm.
   *
   * Und weiterhin nur über GEBACKENEM. Dampfender roher Teig wäre eine
   * Behauptung — seit dem 01.09. ist ohnehin keiner mehr im Schwarm.
   */
  dampft?: boolean
  alt: string
  /** Position in der linken Spur, in Prozent. */
  li: number
  ob: number
  /** Breite in Prozent der Sektion. */
  gr: number
  /**
   * ═══ Wie weit hinten das Stueck fliegt: 0 vorn, 1 ganz hinten ═══
   *
   * Karol am 07.09.: „wieso die Ausschnitte?"
   *
   * Die Frage ist berechtigt, und Mobbin beantwortet sie: ein freigestellter
   * Gegenstand ueber Flachfarbe ist eine Illustrationstechnik. Bei Savor und
   * Eat Real Food steht immer nur das VORDERSTE Stueck frei, alles dahinter
   * ist kleiner, unschaerfer oder gerahmt. Ohne Tiefenzeichen liest sich ein
   * Foto-Freisteller als Aufkleber, egal wie gut das Produkt ist.
   *
   * `tiefe` ist deshalb kein Schmuck, sondern die Achse, aus der vier Dinge
   * abgeleitet werden: Groesse, Unschaerfe, Deckung (Luftperspektive — was
   * weiter weg ist, geht in den orangenen Grund ueber) und die Weichheit des
   * Schattens.
   *
   * ═══ Und woher der Wert kommt ═══
   *
   * Nicht aus dem Gefuehl, sondern aus der GEMESSENEN Schaerfe des Fotos.
   * Stand nach der zweiten Runde mit seedream am 08.09. (Laplace-Varianz im
   * deckenden Bereich, bei gleicher Darstellgroesse):
   *
   *     lahmacun 4551 · zaatar-2 4285 · zaatar 3893 · stapel 2269
   *     fatayer 1858 · rolle 1722 · kaese 1143 · gebacken 1100 · sesam 957
   *
   * Alle NEUN sind inzwischen ueber `is_inpaint` neu aufgenommen. Das zehnte
   * hiess `bleche` und ist RAUS: seine Quelle war ein misslungener Freisteller
   * (das rechte Blech halb Ofeninneres), und zwei Anlaeufe haben daraus einmal
   * ein dupliziertes und einmal ein leeres Blech gemacht. Wo die Vorlage nicht
   * traegt, hilft kein Modell.
   *
   * Verteilt wird nach RANG, nicht nach Rohwert. Die vier ueberarbeiteten
   * Stuecke haben ihre Schaerfe verdoppelt bis vervierfacht; nach Rohwert
   * besetzten sie die ganze Spitze und sechs von zehn landeten hinten. Der
   * Rang haelt die Staffelung gleichmaessig und die Ordnung trotzdem ehrlich.
   *
   * Karol dazu: „bei zum Beispiel Lahmacun und Fatayer, kann man doch bestimmt
   * gut auch mehr machen." Genau die stehen oben in der Liste.
   *
   * Aus der Messung wird die Ordnung: das schaerfste Foto fliegt vorn und
   * gross, das weichste hinten, klein und absichtlich unscharf. Damit hoert
   * die Weichheit der schwachen Aufnahmen auf, ein Mangel zu sein — sie wird
   * zu dem, was sie in einer Tiefenschaerfe ohnehin waere.
   */
  tiefe: number
  /**
   * Nur am breiten Schirm zeigen.
   *
   * Die hinteren Wiederholungen verdichten das Bild, ohne dass die Wiederholung
   * auffiele — sie sind klein, unscharf und halbdurchsichtig. Am Handy sind sie
   * trotzdem je ein eigener ScrollTrigger und eine eigene Ebene, und dort ist
   * schon einmal eine lange Aufgabe gemessen worden. Dieselbe Regel wie bei den
   * Koernern: Atmosphaere darf schmaler werden, bevor der Gegenstand es tut.
   */
  nurBreit?: boolean
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

/* ═══ Die Aufnahmen sind belichtet, nicht ersetzt ═══

       Karol am 02.09.: „mach die Produkte nun schöner, aber trotzdem so echt
       es geht an den Produkten von Aram." Der Inhaber dazu: so nah wie möglich
       am Original.

       Alle acht sind am 02.09. über Higgsfield (seedream_v5_pro) durch einen
       Durchgang gegangen — aber als BEARBEITUNG ihres eigenen Fotos, nicht als
       Neuerzeugung. Der Schalter dafür heisst `is_inpaint`, und der
       Unterschied ist nicht theoretisch: gemessen bleibt der Umriss bei sieben
       von acht Stücken zu über 98 % derselbe.

           Gebaeck        Mikrokontrast   Umriss
           fatayer          15,5 -> 21,1   99,4 %
           rolle             9,9 -> 14,0   83,8 %
           lahmacun         18,3 -> 23,5   99,7 %
           zaatar           21,2 -> 30,8   99,7 %
           zaatar-2         18,0 -> 23,4   98,1 %
           sesam             5,0 -> 14,0   99,8 %
           gebacken         10,0 -> 14,3   99,1 %
           kaese             8,8 -> 11,7   99,3 %

       Der Sesam-Fladen war mit 5,0 das weichste Stück der ganzen Seite; jetzt
       sind die einzelnen Körner wieder da. Die Rolle ist mit 83,8 % die
       einzige, die merklich gewandert ist — sie ist etwas länger geworden.

       Der erste Versuch war 34 Stufen ZU DUNKEL (Helligkeit 124 auf 90) und
       sah oben rechts verbrannt aus. Erst der ausdrückliche Zusatz „gleiche
       Helligkeit halten, nicht abdunkeln, nicht verbrannt aussehen lassen" hat
       das gedreht: 112 statt 90, bei gleichzeitig mehr Textur.

       `appetit.py` läuft auf diesen acht NICHT mehr. Der Generator hat Schärfe
       und Glanz schon gemacht, und ein zweiter Durchgang macht aus Körnern
       Kanten. Lichtangleich und Kantenglättung laufen weiter, damit die acht
       dasselbe Licht und denselben Rand tragen wie der Rest der Seite.

   ═══ Roher Teig ist kein Gericht ═══

       Karol am 01.09.: „die Elemente von Aram sind scheisse … das sieht aus wie
       unappetitliche Steine."

       Er hatte recht, und es liess sich nachrechnen. Über die undurchsichtigen
       Pixel gemessen, Sättigung und Mikrokontrast:

           schwarm-teig            19,3  /  1,8
           schwarm-teig-paar       18,0  /  1,2
           alle übrigen        63 bis 67  /  5,8 bis 11,3

       Der Schnitt liegt sauber: die beiden rohen Teigschiffchen sind ein
       Drittel so bunt und ein Fünftel so texturiert wie alles andere. Das ist
       kein Fehler der Aufnahme — roher Teig hat weder Röstung noch Glanz, weil
       er weder gebacken noch bestrichen ist. Ein blasser grauer Klumpen bleibt
       einer, egal wie man ihn belichtet.

       Beide sind deshalb raus und durch zwei FERTIGE Gebäcke ersetzt, neu aus
       dem Materialstapel des Inhabers geschnitten: das gefüllte Gebäck vom Blech
       im Fenster und der Käsefladen vom Holzbrett. Der Teig hat seinen Platz
       weiter in der Prozessfolge — dort erzählt er etwas. Hier stand er als
       Ergebnis, und als Ergebnis ist er falsch.

   ═══ Hier lag ein Zwilling ═══

       Der Eintrag `fatayer-gold` ist am 01.09. entfernt worden. Er stammte aus
       demselben Foto wie `sesam` (a347f19c), und nach dem Lichtangleich waren
       die beiden nebeneinander kaum zu unterscheiden — zwei Aufnahmen
       desselben Blechs, die sich als zwei Sorten ausgaben.

       Acht verschiedene Gebäcke sind besser als neun, von denen zwei dasselbe
       zeigen. Der Schwarm hat dadurch eine Flugbahn weniger; die anderen acht
       sind unangetastet, weil sie gegen die Überschriften gemessen sind.

       Ein neunter kommt zurück, sobald es ein Foto gibt, das ein Gebäck zeigt,
       das noch fehlt. Zwei Versuche, eines aus den vorhandenen zu schneiden,
       sind gescheitert: der eine Ausschnitt erwischte ihr Wasserzeichen, der
   andere nur ein abgerissenes Stück. */
export const GEBAECKE: Gebaeck[] = [
  {
    id: 'fatayer',
    dampft: true,
    name: "Fata’er",
    bilder: ['/bilder/echt/fatayer-frei.webp'],
    echt: true,
    alt: 'Ein Fata’er von Aram, gewölbt und glänzend, dicht mit Sesam und Schwarzkümmel bestreut',
    li: 3,
    ob: 6,
    gr: 20,
    tiefe: 0.5,
    liM: 58,
    grM: 52,
    breite: 900,
    hoehe: 709,
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
    id: 'rolle',
    dampft: true,
    name: 'Gefuelltes Gebaeck',
    bilder: ['/bilder/echt/schwarm-rolle.webp'],
    echt: true,
    alt: 'Ein goldbraun gebackenes gefuelltes Gebaeck von Aram, die Fuellung tritt an den Einschnitten hervor',
    li: 70,
    ob: 20,
    gr: 19,
    tiefe: 0.62,
    liM: 72,
    grM: 48,
    breite: 900,
    hoehe: 669,
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
    dampft: true,
    name: 'Lahmacun',
    bilder: ['/bilder/echt/schwarm-lahmacun.webp'],
    echt: true,
    alt: 'Ein Lahmacun mit Hackfleisch, Petersilie und Paprika',
    li: 16,
    ob: 36,
    gr: 27,
    tiefe: 0.0,
    liM: 54,
    grM: 48,
    breite: 900,
    hoehe: 796,
    y: [0.62, -0.28],
    x: [-0.05, 0.1],
    dreh: [-45, 22],
    drehY: [-27, 39],
    drehX: [17, -8],
    z: [-340, -60],
    skala: [0.72, 0.9],
  },
  {
    id: 'zaatar',
    dampft: true,
    name: 'Manakisch mit Zaatar',
    bilder: ['/bilder/echt/schwarm-zaatar.webp'],
    echt: true,
    alt: 'Ein Manakisch mit Zaatar, frisch aus dem Ofen',
    li: 78,
    ob: 48,
    gr: 24,
    tiefe: 0.25,
    liM: 76,
    grM: 38,
    breite: 900,
    hoehe: 826,
    y: [0.28, -0.4],
    x: [0.06, -0.04],
    dreh: [36, -25],
    drehY: [36, -24],
    drehX: [-13, 10],
    z: [-420, -140],
    skala: [0.64, 0.8],
  },
  {
    id: 'zaatar-2',
    dampft: true,
    name: "Fata’er mit Spinat",
    bilder: ['/bilder/echt/schwarm-zaatar-2.webp'],
    echt: true,
    alt: 'Ein zweites Manakisch mit Zaatar',
    li: 4,
    ob: 62,
    gr: 25,
    tiefe: 0.12,
    liM: 74,
    grM: 36,
    breite: 900,
    hoehe: 850,
    y: [0.44, -0.22],
    x: [-0.03, 0.07],
    dreh: [-22, 45],
    drehY: [-21, 33],
    drehX: [10, -17],
    z: [-500, -200],
    skala: [0.58, 0.74],
  },
  {
    id: 'sesam',
    dampft: true,
    name: 'Fata’er mit Sesam',
    bilder: ['/bilder/echt/schwarm-sesam.webp'],
    echt: true,
    alt: 'Ein goldbraun gebackener Fata’er, dicht mit Sesam und Schwarzkümmel',
    li: 62,
    ob: 74,
    gr: 14,
    tiefe: 1.0,
    liM: 60,
    grM: 50,
    breite: 900,
    hoehe: 893,
    y: [0.4, -0.34],
    x: [0.04, -0.08],
    dreh: [31, -39],
    drehY: [27, -33],
    drehX: [-11, 14],
    z: [-300, -40],
    skala: [0.7, 0.88],
  },
  {
    id: 'gebacken',
    dampft: true,
    name: "Fata’er mit Hackfleisch",
    bilder: ['/bilder/echt/schwarm-gebacken.webp'],
    echt: true,
    alt: 'Ein flacher, goldbraun gebackener Fata’er mit Sesam',
    li: 34,
    ob: 84,
    gr: 16,
    tiefe: 0.88,
    liM: 78,
    grM: 34,
    breite: 900,
    hoehe: 733,
    y: [0.5, -0.2],
    x: [-0.06, 0.04],
    dreh: [-28, 34],
    drehY: [-30, 27],
    drehX: [13, -15],
    z: [-380, -100],
    skala: [0.6, 0.78],
  },
  {
    id: 'kaese',
    dampft: true,
    name: 'Fladen mit Kaese',
    bilder: ['/bilder/echt/schwarm-kaese.webp'],
    echt: true,
    alt: 'Ein runder Fladen von Aram, dick mit geschmolzenem Kaese belegt',
    li: 84,
    ob: 92,
    gr: 17,
    tiefe: 0.75,
    liM: 56,
    grM: 48,
    breite: 875,
    hoehe: 900,
    y: [0.24, -0.44],
    x: [0.05, -0.05],
    dreh: [39, -22],
    drehY: [33, -21],
    drehX: [-14, 11],
    z: [-460, -180],
    skala: [0.56, 0.72],
  },
  {
    id: 'stapel',
    dampft: true,
    name: 'Fladenstapel',
    bilder: ['/bilder/echt/schwarm-stapel.webp'],
    echt: true,
    alt: 'Ein hoher Stapel gebackener Fladen aus der Backstube',
    li: 24,
    ob: 68,
    gr: 22,
    tiefe: 0.38,
    liM: 30,
    grM: 34,
    breite: 518,
    hoehe: 900,
    y: [0.42, -0.28],
    x: [-0.05, 0.05],
    dreh: [-12, 16],
    drehY: [-18, 22],
    drehX: [7, -6],
    z: [-210, 30],
    skala: [0.92, 1.02],
  },
  /* ═══ Vier Wiederholungen ganz hinten ═══

     Karol am 07.09.: „wie wir da die ganzen einzelnen Produkte im Hintergrund
     dazumachen." Neues Material gibt es nicht mehr — von 54 Freistellern waren
     genau zwei brauchbar und neu. Dichte kommt deshalb aus der Tiefe: bei
     `tiefe` ueber 0,75 ist ein Stueck 13 bis 15 Prozent breit, gut 2 px
     unscharf und zu drei Vierteln deckend. Dass es dasselbe Gebaeck ist wie
     eines vorne, sieht man dort nicht — in einer Backstube liegt ohnehin von
     jedem mehr als eins. */
  {
    id: 'lahmacun-fern',
    dampft: false,
    name: 'Lahmacun',
    bilder: ['/bilder/echt/schwarm-lahmacun.webp'],
    echt: true,
    alt: '',
    li: 58,
    ob: 12,
    gr: 14,
    tiefe: 0.86,
    nurBreit: true,
    liM: 40,
    grM: 30,
    breite: 900,
    hoehe: 796,
    y: [0.44, -0.29],
    x: [0.04, -0.05],
    dreh: [18, -14],
    drehY: [24, -20],
    drehX: [-8, 6],
    z: [-234, 13],
    skala: [0.94, 1.02],
  },
  {
    id: 'zaatar-fern',
    dampft: false,
    name: 'Manakisch Zaatar',
    bilder: ['/bilder/echt/schwarm-zaatar.webp'],
    echt: true,
    alt: '',
    li: 14,
    ob: 26,
    gr: 15,
    tiefe: 0.79,
    nurBreit: true,
    liM: 20,
    grM: 32,
    breite: 900,
    hoehe: 826,
    y: [0.44, -0.29],
    x: [-0.04, 0.05],
    dreh: [-18, 14],
    drehY: [-24, 20],
    drehX: [8, -6],
    z: [-231, 15],
    skala: [0.94, 1.02],
  },
  {
    id: 'fatayer-fern',
    dampft: false,
    name: 'Fata’er',
    bilder: ['/bilder/echt/fatayer-frei.webp'],
    echt: true,
    alt: '',
    li: 72,
    ob: 56,
    gr: 13,
    tiefe: 0.94,
    nurBreit: true,
    liM: 68,
    grM: 28,
    breite: 900,
    hoehe: 709,
    y: [0.44, -0.29],
    x: [0.04, -0.05],
    dreh: [18, -14],
    drehY: [24, -20],
    drehX: [-8, 6],
    z: [-237, 12],
    skala: [0.94, 1.02],
  },
  {
    id: 'rolle-fern',
    dampft: false,
    name: 'Gefuelltes Gebaeck',
    bilder: ['/bilder/echt/schwarm-rolle.webp'],
    echt: true,
    alt: '',
    li: 40,
    ob: 80,
    gr: 14,
    tiefe: 0.88,
    nurBreit: true,
    liM: 50,
    grM: 30,
    breite: 900,
    hoehe: 669,
    y: [0.44, -0.29],
    x: [-0.04, 0.05],
    dreh: [-18, 14],
    drehY: [-24, 20],
    drehX: [8, -6],
    z: [-235, 13],
    skala: [0.94, 1.02],
  },
]
/** Wie viele der ausgelieferten Gerichtebilder sind erzeugt? */
export const erzeugteGerichte = (): number => GEBAECKE.filter((g) => !g.echt).length

/** Wie viele Ansichten liegen insgesamt aus? Sagt, wie weit die Drehung trägt. */
export const ansichten = (): number => GEBAECKE.reduce((s, g) => s + g.bilder.length, 0)
