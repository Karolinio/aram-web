import galerieRoh from '../../inhalt/galerie.json'
import type { CSSProperties } from 'react'

import { useSchub } from '../bewegung.ts'
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
 * ═══ Die Arkade ═══
 *
 * Karol, zum vierten Mal: „Die Galerie ist immer noch kacke. Will einen ganz
 * anderen Ansatz, von links nach rechts … die Bilder sollen thematisch
 * umrahmt sein, irgendwie in arabischer Rahmen-UI."
 *
 * Zwei Vorfassungen sind gescheitert, und beide aus demselben Grund: sie waren
 * SENKRECHT. Erst zwei Spuren, die von unten nach oben flogen, dann ein
 * überlappender Stapel — beide Male scrollte man an Bildern vorbei, statt
 * durch sie hindurchzugehen.
 *
 * ═══ Was Mobbin dazu sagt ═══
 *
 * MOUTHWASH Studio führt ein waagerechtes Band quer durch die Bildmitte: alle
 * Bilder auf einer Höhe, gleiche Grösse, ruhig, in Leserichtung. Kein Stapel,
 * keine Streuung. Das ist die Form, die „von links nach rechts" wirklich
 * einlöst — und sie ist ruhig genug, dass der Rahmen etwas zu sagen bekommt.
 *
 * ═══ Warum ein RUNDBOGEN und kein Ornament ═══
 *
 * „Arabische Rahmen-UI" liesse sich mit Maschrabiyya-Gittern oder
 * Achteckmustern bedienen. Das wäre von der Stange und hätte mit Aram nichts
 * zu tun.
 *
 * Ihr Ofen IST ein Bogen — ein gemauerter Rundbogen, auf Galeriefoto 09 und 12
 * deutlich zu sehen. Eine Reihe von Rundbögen ist ausserdem genau das, was
 * eine Arkade ist: die Grundform jedes Basars und jeder Moschee.
 *
 * Der Rahmen kommt damit nicht aus einem Musterbuch, sondern aus ihrem eigenen
 * Laden. Das ist der Unterschied zwischen orientalisch AUSSEHEN und
 * orientalisch SEIN.
 *
 * ═══ Warum nicht angeheftet ═══
 *
 * Weil das Anheften schon einmal der Fehler war: eine angeheftete Sektion hält
 * die Seite an, und der Wechsel von „scrollt" auf „steht" ist ein Bruch, den
 * keine Dämpfung glättet. Karol hat ihn dreimal als „haperig" gemeldet.
 *
 * Das Band wandert stattdessen einfach nach links, während die Sektion durchs
 * Bild fährt. Nichts hält an.
 */

/** Wie hoch der Bogen steht. Drei Werte im Wechsel — sonst ist es eine Mauer. */
const HOEHEN = [1, 0.86, 0.94, 0.8, 1, 0.88, 0.92] as const

function Bogen({ bild, i }: { bild: Bild; i: number }) {
  const nr = String(bild.nr).padStart(2, '0')
  return (
    <li className="bogen" style={{ '--hoch': HOEHEN[i % HOEHEN.length] } as CSSProperties}>
      <div className="bogen__rahmen">
        <img
          src={`/bilder/galerie/${nr}.webp`}
          srcSet={`/bilder/galerie/${nr}-klein.webp 520w, /bilder/galerie/${nr}.webp 900w`}
          sizes="(max-width: 719px) 62vw, 26vw"
          alt={bild.titel}
          width={bild.breite}
          height={bild.hoehe}
          loading={i < 3 ? 'eager' : 'lazy'}
          decoding="async"
        />
      </div>
      {/* Die Bildzeile steht wieder da — anders als beim Stapel. Dort war sie
          falsch, weil ein Stapel Abzüge keine Beschriftung hat; unter einem
          Bogen in einer Arkade ist sie eine Tafel, und die gehört dorthin. */}
      <p className="bogen__wort">{bild.titel}</p>
    </li>
  )
}

export default function Galerie() {
  /* Waagerecht statt senkrecht: derselbe Haken, andere Achse. Der Wert ist
     negativ, damit das Band beim Herunterscrollen nach LINKS läuft — die
     Leserichtung bleibt links nach rechts, die Bewegung führt sie fort. */
  const band = useSchub<HTMLUListElement>(-0.42)

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
      {/* Das Band ist breiter als das Fenster und wandert nach links, während
          die Sektion durchfährt. Der Haken ist derselbe, der überall auf
          dieser Seite Flächen bewegt — siehe BEWEGUNG.md, Regel 3. */}
      <div className="galerie__fahrt">
        <ul className="galerie__arkade" ref={band}>
          {BILDER.map((bild, i) => (
            <Bogen key={bild.nr} bild={bild} i={i} />
          ))}
        </ul>
      </div>
    </Sektion>
  )
}
