import galerieRoh from '../../inhalt/galerie.json'
import type { CSSProperties } from 'react'

import { useVersatz } from '../bewegung.ts'
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
 * ═══ Der Stapel ═══
 *
 * Karol, dreimal in Folge: „Die Galerie ist immer noch furchtbar." Beim
 * dritten Mal habe ich gemacht, was er beim zweiten schon verlangt hatte, und
 * bei Mobbin nachgesehen. Die Antwort ist **Nite Riot**, und sie sagt genau,
 * was hier falsch war:
 *
 *   RAHMEN       Dort sind es nackte Fotos. Hier lag jedes in einem
 *                cremefarbenen Passepartout mit Radius und drei Schatten —
 *                eine Bedienoberflächen-Karte, keine Fotografie.
 *   ABSTAND      Dort überlappen sie einander. Hier standen sie in einem
 *                Raster mit einer freien Mittelspalte, das eine Berührung
 *                ausgeschlossen hat.
 *   GRÖSSE       Dort reicht das grösste an das Vierfache des kleinsten. Hier
 *                waren alle fast gleich.
 *   RAND         Dort laufen sie aus dem Bild. Hier endeten sie brav an der
 *                Schale.
 *   BESCHRIFTUNG Dort keine. Hier trug jedes eine Nummer und eine Bildzeile —
 *                und genau das macht aus einer Wand voller Fotos eine
 *                Dokumentation.
 *
 * Jeder dieser fünf Punkte für sich wäre Geschmack. Zusammen sind sie der
 * Unterschied zwischen einem Stapel Abzüge auf einem Tisch und einer
 * Bildergalerie in einem Formular.
 */

/**
 * Wo jedes Blatt liegt — in Prozent der Bühne.
 *
 * `li` und `ob` sind die linke und obere Kante, `gr` die Breite. Negative
 * Werte und Werte über 100 sind ABSICHT: was über den Rand läuft, wird
 * beschnitten, und genau das nimmt der Wand ihre Kastenform.
 *
 * `tempo` ist der Versatz gegen den Scroll. Weil er sich von Blatt zu Blatt
 * unterscheidet, ÄNDERN sich die Überlappungen beim Scrollen — der Stapel
 * ordnet sich neu, während man daran vorbeifährt. Das ist die eigentliche
 * Bewegung; die Drehung ist nur die Handschrift.
 */
const LAGEN = [
  { li: -7, ob: 0, gr: 47, dreh: -5.5, tempo: -0.16, ebene: 2 },
  { li: 52, ob: 7, gr: 33, dreh: 4, tempo: 0.1, ebene: 1 },
  { li: 20, ob: 21, gr: 41, dreh: -2.5, tempo: -0.06, ebene: 3 },
  { li: 63, ob: 30, gr: 44, dreh: 6.5, tempo: 0.18, ebene: 2 },
  { li: 2, ob: 48, gr: 31, dreh: -7, tempo: 0.08, ebene: 1 },
  { li: 30, ob: 55, gr: 45, dreh: 2, tempo: -0.13, ebene: 3 },
  { li: 66, ob: 71, gr: 39, dreh: -4, tempo: 0.14, ebene: 2 },
] as const

function Blatt({ bild, lage, i }: { bild: Bild; lage: (typeof LAGEN)[number]; i: number }) {
  const ref = useVersatz<HTMLLIElement>(lage.tempo)
  const nr = String(bild.nr).padStart(2, '0')

  return (
    <li
      className="galerie__stueck"
      ref={ref}
      style={
        {
          left: `${lage.li}%`,
          top: `${lage.ob}%`,
          width: `${lage.gr}%`,
          zIndex: lage.ebene,
          '--dreh': `${lage.dreh}deg`,
        } as CSSProperties
      }
    >
      {/* Nacktes Bild, kein Rahmen, keine Bildzeile. Der Titel steht im
          Alternativtext — ein Vorleseprogramm bekommt ihn, das Auge nicht.
          Was hier zu sehen ist, braucht keine Unterschrift; die Sektion hat
          eine Überschrift, und die sagt es für alle sieben. */}
      <img
        src={`/bilder/galerie/${nr}.webp`}
        srcSet={`/bilder/galerie/${nr}-klein.webp 520w, /bilder/galerie/${nr}.webp 900w`}
        sizes="(max-width: 719px) 86vw, 42vw"
        alt={bild.titel}
        width={bild.breite}
        height={bild.hoehe}
        loading={i < 2 ? 'eager' : 'lazy'}
        decoding="async"
      />
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
          <Blatt key={bild.nr} bild={bild} lage={LAGEN[i % LAGEN.length]!} i={i} />
        ))}
      </ul>
    </Sektion>
  )
}
