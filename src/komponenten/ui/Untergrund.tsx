import { pfad } from '../../pfad.ts'

/**
 * Der Grund einer Sektion: ein Bild, darüber eine Folie in ihrer Farbe.
 *
 * ═══ Warum das eine Komponente ist ═══
 *
 * Karol am 31.08.: „Füge diese Mehl-Animation bzw. den Hintergrund überall bei
 * Orange ein. Zudem bei den schwarzen Sektionen dieses Mehlige leicht rein.
 * Vielleicht auch variieren. Kann man ein Bild vom Laden nehmen und transparent
 * in den Hintergrund legen auf einer orangenen Folie?"
 *
 * Das Verfahren gab es schon — genau einmal, fest verdrahtet in Bestellen. Es
 * an sechs Stellen zu kopieren hiesse, sechsmal dieselbe Deckkraft von Hand zu
 * treffen und beim ersten Nachziehen fünf davon zu vergessen. Hier steht es
 * einmal.
 *
 * ═══ Warum eine FOLIE und kein Filter ═══
 *
 * Der naheliegende Weg wäre `opacity` auf dem Bild. Das ergibt ein blasses
 * Bild auf einem farbigen Grund — zwei Ebenen, die man einzeln sieht. Eine
 * deckende Folie DAVOR färbt das Bild ein: was durchkommt, ist die Struktur,
 * nicht das Motiv. Der Unterschied ist derselbe wie zwischen einem
 * durchsichtigen Foto und einem getönten Fenster.
 *
 * Deshalb liegt die Deckkraft auf der FOLIE und nicht auf dem Bild.
 */

type Props = {
  /** Pfad unter `public/`, ohne führenden Schrägstrich. */
  bild: string
  /**
   * Welche Farbe die Folie hat. Sie muss die der Sektion sein — eine Folie,
   * die einen anderen Ton führt als ihr Grund, deckt ihn zu, statt ihn zu
   * tönen. Genau daran ist der Schleier in Bestellen schon einmal gescheitert.
   */
  ton: 'glut' | 'nacht'
  /**
   * Wie dicht die Folie deckt, 0 bis 1.
   *
   * Auf Orange trägt 0,90 bis 0,94: die Struktur ist zu ahnen, das Motiv
   * nicht mehr zu erkennen. Auf Schwarz braucht es MEHR — 0,95 bis 0,97 —,
   * weil eine helle Textur auf dunklem Grund stärker durchschlägt als
   * umgekehrt. Das ist kein Geschmack, sondern Wahrnehmung: der Kontrast
   * zwischen hell und dunkel ist grösser als der zwischen zwei warmen Tönen.
   */
  staerke?: number
  /** Bildausschnitt — die Variation von Sektion zu Sektion. */
  lage?: string
  /**
   * Die ECHTEN Masse der Datei.
   *
   * Sie standen hier mit einer Vorgabe von 1500 × 900 — geraten, und keine der
   * drei Texturen hat dieses Verhältnis. Der Fabrikprüfer hat es gemeldet:
   * „koerner.webp sagt 1500×900, ist 900×900, 67 % daneben." Falsche Masse
   * reservieren die falsche Höhe, und hier fällt es nur deshalb nicht auf,
   * weil der Kasten absolut liegt — bis jemand das ändert.
   * Deshalb ohne Vorgabe: wer ein Bild einsetzt, muss seine Masse kennen.
   */
  breite: number
  hoehe: number
}

export default function Untergrund({
  bild,
  ton,
  staerke = ton === 'nacht' ? 0.96 : 0.92,
  lage = 'center',
  breite,
  hoehe,
}: Props) {
  return (
    <div className="untergrund" aria-hidden="true">
      <img
        className="untergrund__bild"
        src={pfad(bild)}
        alt=""
        width={breite}
        height={hoehe}
        style={{ objectPosition: lage }}
        loading="lazy"
        decoding="async"
      />
      <div
        className={`untergrund__folie untergrund__folie--${ton}`}
        style={{ opacity: staerke }}
      />
    </div>
  )
}
