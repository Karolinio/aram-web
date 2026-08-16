import { useFlug, useVersatz } from '../bewegung.ts'
import { GEBAECKE, type Gebaeck } from '../gebaecke.ts'

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
 * Savor-Rhythmus. Links fliegt der SCHWARM: fünf freigestellte Gebäcke fallen
 * von oben nach unten durch die Sektion, jedes mit eigener Weite, Drehung und
 * Tiefe. Sie sind die einzigen Elemente der Seite mit Eigenschatten, weil sie
 * als einzige Gegenstände sind und keine Bilder.
 *
 * ═══ Eins davon ist ihr Essen, vier sind es nicht ═══
 *
 * Welche, steht in gebaecke.ts im Feld `echt` — und warum, in
 * public/bilder/erzeugt/LIESMICH.md. Kurz: aus dem Scan ihrer alten Seite gibt
 * es genau EIN Produktfoto, und Karol hat am 15.08.2026 ausdrücklich
 * entschieden, die übrigen vier erzeugen zu lassen.
 */

const RECHTECKE = [
  {
    zahl: '01',
    titel: 'Mehl auf die Fläche',
    text: 'Morgens um sieben, bevor der erste Gast kommt.',
    quelle: '/bilder/textur/mehl-holz.webp',
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

/**
 * Ein Gebäck auf seiner Bahn.
 *
 * Jedes bekommt seinen eigenen Trigger-Fortschritt über dieselbe Bühne, aber
 * eigene Weiten, Drehungen und Tiefen. Dass sie sich nicht überholen und nicht
 * überlappen, steckt in den Zahlen in gebaecke.ts — nicht in einer Kollisions-
 * rechnung, die auf jedem Bildschirm etwas anderes ergäbe.
 */
function Gebaeckstueck({ g }: { g: Gebaeck }) {
  const ref = useFlug<HTMLImageElement>({
    y: g.y,
    x: g.x,
    dreh: g.dreh,
    drehY: g.drehY,
    drehX: g.drehX,
    z: g.z,
    skala: g.skala,
    buehne: '.prozess',
    abBreite: 1000,
  })

  return (
    <img
      ref={ref}
      className={g.echt ? 'gebaeck gebaeck--echt' : 'gebaeck'}
      src={g.quelle}
      alt={g.alt}
      width={g.breite}
      height={g.hoehe}
      loading="lazy"
      decoding="async"
      style={{ left: `${g.li}%`, top: `${g.ob}%`, width: `${g.gr}%` }}
    />
  )
}

export default function Handarbeit() {
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
            {/* Die linke Spur. Sie ist so hoch wie die Folge daneben — nur
                deshalb haben die Gebäcke einen Weg zum Fliegen. */}
            <div className="spur">
              <p className="klebt flieger__wort">
                <span className="schritt__zahl">03</span>
                <span className="flieger__titel">Erst dann belegt</span>
                <span className="flieger__text">
                  Und in den heissen Ofen. Deshalb dauert es ein paar Minuten.
                </span>
              </p>

              <div className="schwarm">
                {GEBAECKE.map((g) => (
                  <Gebaeckstueck key={g.id} g={g} />
                ))}
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
