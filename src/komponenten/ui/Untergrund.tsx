import { pfad } from '../../pfad.ts'

/**
 * Der Grund einer Sektion — eine Konstante und zwei Wechselnde.
 *
 * ═══ Was hier vorher stand und warum es nicht trug ═══
 *
 * Sechs Sektionen, sechs verschiedene Fototexturen, sechs Deckkräfte. Karol:
 * „ich will, dass das ein harmonisches Gesamtbild ergibt, bin noch nicht 100 %
 * zufrieden." Er hatte recht: das ist Abwechslung ohne System. Sechs Motive
 * ergeben sechs Eindrücke, nicht einen.
 *
 * ═══ Was Koto zeigt ═══
 *
 * Bei Koto (Mobbin) liegt über der flachen Fläche nur feines KORN — kein Foto,
 * kein Motiv. Es macht aus einer CSS-Farbe eine gedruckte Fläche und stört
 * nie, weil es nichts darstellt. Eat Hungry Tiger zeigt die andere Hälfte
 * derselben Sache: Harmonie kommt aus Zurückhaltung, nicht aus Fülle.
 *
 * ═══ Das System ═══
 *
 *   Korn    auf JEDER Sektion, identisch. Die Konstante, die verbindet.
 *   Bogen   ihr Ofenrundbogen als Reihe — dieselbe Form, die die Arkade, die
 *           Tafel im Vorhang und das QR-Schild schon führen.
 *   Foto    nur noch dort, wo es etwas BEDEUTET: Mehl in der Handarbeit,
 *           ihr Laden im Bestellen.
 *
 * Eins konstant, zwei im Wechsel, und jede Ausnahme hat einen Grund. Das ist
 * der Unterschied zwischen Rhythmus und Zufall.
 */

type Props = {
  /**
   * Die Farbe der Folie. Sie muss die der Sektion sein — eine Folie, die einen
   * anderen Ton führt als ihr Grund, deckt ihn zu, statt ihn zu tönen.
   */
  ton: 'glut' | 'nacht'
  /** Was über dem Korn liegt. Ohne Angabe: nur Korn. */
  muster?: 'bogen' | 'foto'
  /** Nur bei `muster="foto"`: Pfad unter `public/`, ohne führenden Schrägstrich. */
  bild?: string
  /**
   * Wie dicht die Folie über dem FOTO deckt.
   *
   * Auf Orange trägt 0,91 bis 0,94, auf Schwarz braucht es mehr — eine helle
   * Struktur auf dunklem Grund schlägt stärker durch als umgekehrt.
   */
  staerke?: number
  /** Bildausschnitt. */
  lage?: string
  /** Die ECHTEN Masse der Datei — siehe unten, der Prüfer fängt geratene. */
  breite?: number
  hoehe?: number
}

export default function Untergrund({
  ton,
  muster,
  bild,
  staerke = ton === 'nacht' ? 0.96 : 0.92,
  lage = 'center',
  breite,
  hoehe,
}: Props) {
  return (
    <div className="untergrund" aria-hidden="true">
      {muster === 'foto' && bild && (
        <>
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
        </>
      )}

      {/* Kein Bild: die Folie ist der Grund selbst — sonst läge das Muster
          über einer durchsichtigen Fläche und der Sektionsgrund käme
          ungefiltert durch. */}
      {muster !== 'foto' && (
        <div className={`untergrund__folie untergrund__folie--${ton}`} />
      )}

      {muster === 'bogen' && <div className="untergrund__bogen" />}

      {/* Das Korn liegt ganz oben und IMMER. Es ist das einzige, was alle
          sieben Sektionen teilen. */}
      <div className="untergrund__korn" />
    </div>
  )
}
