import { useFlug, useVersatz } from '../bewegung.ts'

/**
 * Der Weg zum Fata’er — die Savor-Sequenz.
 *
 * ═══ Was ich beim ersten Bau falsch verstanden hatte ═══
 *
 * Die Direktion nennt Savor als Referenz und beschreibt sie als „Bilder liegen
 * versetzt und überlappend". Daraus hatte ich ein Nebeneinander gebaut: Text
 * links, Bild rechts. Beim Nachsehen der Referenz auf Mobbin zeigt sie etwas
 * anderes — die Bilder stehen FAST SENKRECHT ÜBEREINANDER, jedes anders breit,
 * seitlich versetzt, und sie überlappen sich VERTIKAL. Bei Savor ist es
 * Butter → Butter im Mehl → Butter brutzelt.
 *
 * Das ist kein Layout, das ist ein Prozess. Der Scroll führt durch die Schritte,
 * und weil sie sich überlappen, liest man sie als einen Vorgang statt als drei
 * Bilder. Genau deshalb funktioniert es ohne einen einzigen Rahmen.
 *
 * ═══ Die beiden Rollen ═══
 *
 * Die RECHTECKE liegen rechts und ziehen ungleich schnell hoch — das ist der
 * Savor-Rhythmus. Das FREIGESTELLTE Gericht liegt links und REIST: von unten
 * nach oben, dabei dreht es sich und wird grösser. Es ist das einzige Element
 * der Seite mit einem Eigenschatten, weil es als einziges ein Gegenstand ist
 * und kein Bild.
 *
 * ═══ Warum nur ein Freisteller ═══
 *
 * Aus dem Scan ihrer alten Seite gibt es genau EIN Produktfoto. Der Freisteller
 * ist Hintergrundentfernung an eben diesem Foto — ihr echtes Fata’er, nur ohne
 * Hintergrund. Erzeugt ist daran nichts: ein erzeugtes Fata’er wäre eine
 * Aussage über ein Produkt, das der Gast gleich in der Hand hält.
 *
 * Kommen die restlichen Aufnahmen, fliegen hier mehrere Gerichte — die Bahn
 * unten nimmt beliebig viele.
 */

/**
 * Von unten links nach oben — und dabei nach rechts ausweichend.
 *
 * Der seitliche Drift ist kein Schmuck: ohne ihn steigt der Flieger am Ende
 * genau in die Überschrift der Sektion. Er weicht ihr aus, statt dass die
 * Überschrift ihm ausweichen muss — das war der erste Versuch, und eine
 * rechtsbündige Überschrift mit umbrechender Augenbraue war der Preis dafür.
 */
const BAHN = {
  /* Klein, weil `position: sticky` das Halten übernimmt. Die Bewegung kommt
     aus der Drehung, nicht aus dem Verschieben. */
  y: [0.1, -0.1] as [number, number],
  x: [-0.06, 0.06] as [number, number],
  dreh: [-13, 9] as [number, number],
  /* Die beiden Achsen, die aus einem Bild einen Gegenstand machen: das Kippen
     nach links/rechts und das Neigen nach vorn/hinten. Zusammen mit `z` und
     der `perspective` der Bühne liest es sich, als drehte sich das Gericht im
     Raum — ohne eine einzige Zeile 3D-Geometrie. */
  drehY: [-30, 26] as [number, number],
  drehX: [12, -9] as [number, number],
  z: [-220, 160] as [number, number],
  skala: [0.88, 1.05] as [number, number],
  buehne: '.prozess',
  /* Unter 1000 px gibt es keine freie linke Bahn — siehe useFlug. */
  abBreite: 1000,
}

const RECHTECKE = [
  {
    zahl: '01',
    titel: 'Mehl auf die Fläche',
    text: 'Morgens um sieben, bevor der erste Gast kommt.',
    quelle: '/bilder/textur/mehl-holz.jpg',
    alt: '',
    breite: 1700,
    hoehe: 949,
    tempo: -0.05,
  },
  {
    zahl: '02',
    titel: 'Von Hand gerollt',
    text: 'Jede Scheibe einzeln, nicht aus der Kiste.',
    quelle: '/bilder/echt/handarbeit.webp',
    alt: 'Zwei Bäcker drücken Teigscheiben auf der bemehlten Arbeitsfläche, daneben ein Stapel fertiger Fladen',
    breite: 500,
    hoehe: 600,
    tempo: 0.04,
  },
]

function Rechteck({ s, i }: { s: (typeof RECHTECKE)[number]; i: number }) {
  const ref = useVersatz<HTMLLIElement>(s.tempo)

  return (
    <li className={`schritt schritt--${i + 1}`} ref={ref}>
      <figure className="schritt__bild">
        <img
          src={s.quelle}
          alt={s.alt}
          width={s.breite}
          height={s.hoehe}
          loading="lazy"
          decoding="async"
        />
      </figure>
      <div className="schritt__wort">
        <span className="schritt__zahl">{s.zahl}</span>
        <h3 className="schritt__titel">{s.titel}</h3>
        <p className="schritt__text">{s.text}</p>
      </div>
    </li>
  )
}

export default function Handarbeit() {
  const flieger = useFlug<HTMLDivElement>(BAHN)

  return (
    <>
      <div className="band">
        <p className="band__satz schale">Du siehst zu, wie dein Fata’er entsteht.</p>
      </div>

      <section className="prozess" aria-labelledby="prozess-titel">
        <div className="schale prozess__buehne">
          <header className="prozess__kopf">
            <span className="augenbraue">Rollen, belegen, in den heissen Ofen</span>
            <h2 id="prozess-titel">Alles entsteht vor deinen Augen</h2>
          </header>

          <div className="prozess__gitter">
            {/* Die linke Spur ist so hoch wie die Folge daneben. Sie muss es
                sein, sonst hat `position: sticky` keinen Weg zum Kleben. */}
            <div className="spur">
              {/* Klebender Rahmen und gedrehtes Bild sind zwei Elemente. Läge
                  die Beschriftung im gedrehten, würde sie mitkippen; läge sie
                  frei daneben, verdeckte das Gericht sie beim Wandern. So
                  klebt beides gemeinsam, und nur das Bild dreht sich. */}
              <div className="klebt">
                <p className="flieger__wort">
                  <span className="schritt__zahl">03</span>
                  <span className="flieger__titel">Erst dann belegt</span>
                  <span className="flieger__text">
                    Und in den heissen Ofen. Deshalb dauert es ein paar Minuten.
                  </span>
                </p>
                <div className="flieger" ref={flieger}>
                  <img
                    src="/bilder/echt/fatayer-frei.png"
                    alt="Ein fertiges Fata’er von Aram, gewölbt und glänzend, dicht mit Sesam und Schwarzkümmel bestreut"
                    width={1000}
                    height={799}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            </div>

            <ol className="folge">
              {RECHTECKE.map((s, i) => (
                <Rechteck key={s.zahl} s={s} i={i} />
              ))}
            </ol>
          </div>
        </div>

        {/* Vierzehn freigestellte Sesam- und Schwarzkümmelkörner, jedes mit
            eigenem Tempo. Sie liegen hinter der Bühne und geben dem Raum eine
            Ausdehnung. Erzeugt — aber Material ohne erkennbaren Ort, und damit
            auf der erlaubten Seite der Grenze. Ein erzeugtes Gericht wäre es
            nicht. */}
        <Koerner />
      </section>
    </>
  )
}

/**
 * Einzelne Körner statt Klumpen.
 *
 * ═══ Zwei Fehlversuche, und warum der dritte funktioniert ═══
 *
 * 1. Drei Schichten zu 46/30/62 Prozent der Sektionsbreite: auf 1440 px sind
 *    das Körner von zwei Zentimetern. Sie lasen sich als Mandeln.
 * 2. Fünf kleine Schichten: richtig gross, aber jede zeigte dasselbe Blatt
 *    komplett — fünf enge Klumpen statt verstreuter Körner.
 *
 * Jetzt zeigt jedes Teilchen einen AUSSCHNITT des Blattes. `background-size:
 * 380%` bildet das Blatt auf knapp das Vierfache des Teilchens ab, und
 * `background-position` wählt daraus eine Stelle. Vierzehn Teilchen, vierzehn
 * verschiedene Stellen: aus einem Bild werden vierzehn verschiedene Körner,
 * bei einem einzigen Netzabruf.
 *
 * Die Stellen sind von Hand gewählt und liegen im mittleren Bereich des
 * Blattes — an den Rändern ist es leer, und ein leeres Teilchen ist ein Loch.
 */
const KOERNER = [
  { x: 32, y: 24, gr: 44, li: 3, ob: 6, tempo: -0.3, deck: 0.5 },
  { x: 58, y: 30, gr: 26, li: 16, ob: 15, tempo: 0.2, deck: 0.36 },
  { x: 44, y: 52, gr: 34, li: 27, ob: 3, tempo: -0.42, deck: 0.28 },
  { x: 66, y: 44, gr: 20, li: 41, ob: 21, tempo: 0.32, deck: 0.42 },
  { x: 38, y: 70, gr: 40, li: 55, ob: 9, tempo: -0.24, deck: 0.32 },
  { x: 72, y: 62, gr: 28, li: 84, ob: 17, tempo: 0.26, deck: 0.45 },
  { x: 50, y: 38, gr: 22, li: 92, ob: 40, tempo: -0.36, deck: 0.3 },
  { x: 60, y: 70, gr: 36, li: 8, ob: 44, tempo: 0.18, deck: 0.34 },
  { x: 28, y: 46, gr: 24, li: 34, ob: 58, tempo: -0.46, deck: 0.4 },
  { x: 70, y: 26, gr: 46, li: 62, ob: 52, tempo: 0.36, deck: 0.26 },
  { x: 40, y: 60, gr: 18, li: 78, ob: 66, tempo: -0.2, deck: 0.44 },
  { x: 54, y: 22, gr: 32, li: 21, ob: 78, tempo: 0.44, deck: 0.3 },
  { x: 64, y: 54, gr: 26, li: 47, ob: 86, tempo: -0.34, deck: 0.38 },
  { x: 36, y: 34, gr: 38, li: 88, ob: 88, tempo: 0.22, deck: 0.28 },
]

function Koerner() {
  return (
    <div className="koerner" aria-hidden="true">
      {KOERNER.map((k, i) => (
        <Korn key={i} k={k} />
      ))}
    </div>
  )
}

function Korn({ k }: { k: (typeof KOERNER)[number] }) {
  const ref = useVersatz<HTMLSpanElement>(k.tempo)
  return (
    <span
      ref={ref}
      className="korn"
      style={{
        width: `${k.gr}px`,
        height: `${k.gr}px`,
        left: `${k.li}%`,
        top: `${k.ob}%`,
        opacity: k.deck,
        backgroundPosition: `${k.x}% ${k.y}%`,
      }}
    />
  )
}
