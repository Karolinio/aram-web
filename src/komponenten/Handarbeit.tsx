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

/** Die Bahn des reisenden Gerichts. Von unten links nach oben, drehend. */
/**
 * Von unten links nach oben — und dabei nach rechts ausweichend.
 *
 * Der seitliche Drift ist kein Schmuck: ohne ihn steigt der Flieger am Ende
 * genau in die Überschrift der Sektion. Er weicht ihr aus, statt dass die
 * Überschrift ihm ausweichen muss — das war der erste Versuch, und eine
 * rechtsbündige Überschrift mit umbrechender Augenbraue war der Preis dafür.
 */
const BAHN = {
  y: [0.38, -0.16] as [number, number],
  x: [-0.1, 0.55] as [number, number],
  dreh: [-15, 7] as [number, number],
  skala: [0.82, 1.08] as [number, number],
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

          <ol className="folge">
            {RECHTECKE.map((s, i) => (
              <Rechteck key={s.zahl} s={s} i={i} />
            ))}
          </ol>

          {/* Das reisende Gericht. Es liegt ausserhalb der Schrittliste, weil es
              kein Schritt IST — es ist das Ergebnis, und es bewegt sich quer
              durch alle Schritte hindurch. */}
          <div className="flieger" ref={flieger}>
            <img
              src="/bilder/echt/fatayer-frei.png"
              alt="Ein fertiges Fata’er von Aram, gewölbt und glänzend, dicht mit Sesam und Schwarzkümmel bestreut"
              width={500}
              height={400}
              loading="lazy"
              decoding="async"
            />
            <p className="flieger__wort">
              <span className="schritt__zahl">03</span>
              <span className="flieger__titel">Erst dann belegt</span>
              <span className="flieger__text">
                Und in den heissen Ofen. Deshalb dauert es ein paar Minuten.
              </span>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
