import galerieRoh from '../../inhalt/galerie.json'
import { useFlug } from '../bewegung.ts'
import { Kopf, Sektion } from './ui/bausteine.tsx'

type Bild = { nr: number; titel: string; lage: 'hoch' | 'quer'; breite: number; hoehe: number }
const BILDER = galerieRoh as Bild[]

/**
 * Die Galerie — die Bilder FLIEGEN, sie fahren nicht.
 *
 * ═══ Warum die angeheftete Bahn weg ist ═══
 *
 * Karol, dreimal in Folge: „das Scrollgefühl ist immer noch zu haperig, also
 * sprich zu ruckelig, nicht konsistent, kein konsistenter Flow … wir hatten
 * mal eine Referenz, wo man gescrollt hat und Bilder auf der linken oder
 * rechten Seite von unten nach oben durchgeflogen sind."
 *
 * Zweimal habe ich am Nachlauf geschraubt und die Zahlen verbessert — von
 * 16 auf 52 Prozent Weg in den ersten hundert Millisekunden. Das Ruckeln blieb,
 * und es lag nicht am Nachlauf: es lag am PIN.
 *
 * Eine angeheftete Sektion hält die Seite an. Beim Betreten und beim Verlassen
 * gibt es einen Übergabepunkt, an dem die Seite von „scrollt" auf „steht" und
 * zurück wechselt. Dieser Wechsel ist kein Bildratenproblem — er ist ein
 * Bruch im Gefühl, und keine Dämpfung der Welt glättet ihn weg. Dazu kommt:
 * der senkrechte Scroll steuert eine waagerechte Bewegung. Hand und Bild
 * zeigen in verschiedene Richtungen.
 *
 * Jetzt fliegen die Bilder mit dem Scroll, nicht gegen ihn: von unten nach
 * oben, in zwei Spuren, jede mit eigenem Tempo. Nichts hält an, nichts wird
 * umgelenkt. Es ist derselbe Haken, der schon den Gebäckschwarm trägt —
 * `useFlug`, erprobt, ohne Anheftung.
 *
 * ═══ Warum von unten nach oben ═══
 *
 * Ein Gegenstand, der beim Herunterscrollen MITFÄLLT, steht relativ zur Seite
 * fast still — man sieht ihn kaum. Einer, der dabei AUFSTEIGT, bewegt sich
 * gegen den Scroll und wird dadurch doppelt so schnell. Genau daher kommt bei
 * der Savor-Referenz das Gefühl von Tiefe.
 */

/**
 * Die Flugbahnen. Zwei Spuren, unterschiedliche Tempi — das ist die Tiefe.
 *
 * `y` ist der Weg in Fensterhöhen: alle starten unterhalb und enden oberhalb,
 * aber unterschiedlich weit. Wer weiter fliegt, wirkt näher.
 *
 * Die Werte sind gesetzt, nicht gewürfelt: kein Nachbarpaar hat dasselbe
 * Tempo, und die beiden Spuren wechseln sich ab, damit nie zwei Bilder auf
 * derselben Höhe nebeneinanderstehen.
 */
const BAHNEN = [
  { spur: 'links',  y: [0.62, -0.72] as [number, number], dreh: [-7, 4] as [number, number],  skala: [0.9, 1.04] as [number, number] },
  { spur: 'rechts', y: [0.48, -0.54] as [number, number], dreh: [5, -6] as [number, number],   skala: [0.94, 1] as [number, number] },
  { spur: 'links',  y: [0.55, -0.62] as [number, number], dreh: [3, -5] as [number, number],   skala: [0.88, 1.02] as [number, number] },
  { spur: 'rechts', y: [0.7, -0.8] as [number, number],   dreh: [-6, 6] as [number, number],   skala: [0.92, 1.06] as [number, number] },
  { spur: 'links',  y: [0.44, -0.5] as [number, number],  dreh: [6, -3] as [number, number],   skala: [0.95, 1] as [number, number] },
  { spur: 'rechts', y: [0.58, -0.66] as [number, number], dreh: [-4, 5] as [number, number],   skala: [0.9, 1.03] as [number, number] },
  { spur: 'links',  y: [0.66, -0.76] as [number, number], dreh: [4, -6] as [number, number],   skala: [0.93, 1.05] as [number, number] },
]

function Blatt({ bild, bahn, i }: { bild: Bild; bahn: (typeof BAHNEN)[number]; i: number }) {
  const flug = useFlug<HTMLLIElement>({
    y: bahn.y,
    x: [0, 0],
    dreh: bahn.dreh,
    /* Ein Hauch Kippen um die Hochachse. Mehr wäre ein Effekt; so viel ist
       das, was ein Blatt Papier tut, das durch die Luft geht. */
    /* ═══ Die Kippung kommt aus der SPUR, nicht aus dem Index ═══
       Ein Blatt in der linken Spur dreht sich zur Mitte hin, eins in der
       rechten dagegen — so schauen beide den Betrachter an, und der Raum hat
       eine Mitte.
       Vorher stand hier `i % 2`. Das ergab dasselbe Ergebnis, aber nur durch
       Zufall: die Bahnen wechseln sich ab, und es sind gerade sieben Bilder.
       Bei acht Bildern oder einer anderen Bahnenliste hätte sich die Hälfte
       falsch herum gedreht. */
    drehY: bahn.spur === 'links' ? [10, -7] : [-10, 7],
    drehX: [4, -3],
    z: [-60, 0],
    skala: bahn.skala,
    buehne: '.galerie',
    abBreite: 720,
  })

  return (
    <li className="galerie__stueck" data-spur={bahn.spur} data-lage={bild.lage} ref={flug}>
      <figure className="galerie__blatt">
        {/* Die Nummer ist keine Verzierung: die sieben sind eine Folge — vom
            Blech über die Glut auf den Tisch — und eine Folge, die man nicht
            zählen kann, liest sich als Haufen. */}
        <span className="galerie__nr" aria-hidden="true">
          {String(i + 1).padStart(2, '0')}
        </span>
        <img
          src={`/bilder/galerie/${String(bild.nr).padStart(2, '0')}.webp`}
          srcSet={`/bilder/galerie/${String(bild.nr).padStart(2, '0')}-klein.webp 520w, /bilder/galerie/${String(bild.nr).padStart(2, '0')}.webp 900w`}
          sizes="(max-width: 719px) 78vw, 30vw"
          alt={bild.titel}
          width={bild.breite}
          height={bild.hoehe}
          loading={i < 2 ? 'eager' : 'lazy'}
          decoding="async"
        />
        <figcaption>{bild.titel}</figcaption>
      </figure>
    </li>
  )
}

export default function Galerie() {
  return (
    <Sektion id="galerie" grund="tief" klasse="galerie" beschriftetVon="galerie-titel">
      <Kopf
        id="galerie-titel"
        etikett="Aus dem Laden"
        titel="Was an einem Morgen entsteht"
        lead="Vom Blech über die Glut auf den Tisch."
      />

      {/* Eine echte Liste in Leserichtung. Für ein Vorleseprogramm ist der
          Unterschied, ob es „Liste mit sieben Einträgen" ansagt oder gar
          nichts — die Flugbahnen sind die Zugabe, nicht der Inhalt. */}
      <ul className="galerie__bahn">
        {BILDER.map((bild, i) => (
          <Blatt key={bild.nr} bild={bild} bahn={BAHNEN[i % BAHNEN.length]!} i={i} />
        ))}
      </ul>
    </Sektion>
  )
}
