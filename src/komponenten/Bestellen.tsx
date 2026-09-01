import { useAuftauchen } from '../bewegung.ts'
import { pfad } from '../pfad.ts'
import { ARAM } from '../aram.config.ts'
import Oeffnung from './ui/Oeffnung.tsx'
import Olivenzweig from './ui/Olivenzweig.tsx'
import Untergrund from './ui/Untergrund.tsx'
import { Etikett, Kopf, Sektion } from './ui/bausteine.tsx'

const DIENSTE = [
  { name: 'Lieferando', schalter: ARAM.bestellen.lieferando },
  { name: 'Uber Eats', schalter: ARAM.bestellen.uberEats },
  { name: 'Wolt', schalter: ARAM.bestellen.wolt },
]

/**
 * Bestellen — der Weg ohne Provision zuerst.
 *
 * ═══ Warum Telefon und WhatsApp oben stehen ═══
 *
 * Lieferando nimmt je nach Modell grob 13 bis um die 30 Prozent. Jede Bestellung,
 * die stattdessen hier durchgeht, ist für den Laden eine ganze Bestellung statt
 * einer siebtel weniger. Das ist der Satz, mit dem der Wert dieser Seite erklärt
 * wird — nicht die Animation.
 *
 * ═══ Warum die Lieferdienste nicht anklickbar sind ═══
 *
 * Es ist NICHT bestätigt, ob Aram dort gelistet ist. Ein Logo, das eine Listung
 * behauptet, die es nicht gibt, ist eine Falschangabe — und ein Bestellknopf,
 * der ins Leere führt, kostet eine Bestellung und nicht einen Klick. Sie stehen
 * deshalb als Vorschau da, sichtbar unfertig, bis jemand nachgesehen hat.
 */
export default function Bestellen() {
  const wege = useAuftauchen<HTMLDivElement>(0.9)
  return (
    <Sektion id="bestellen" grund="glut" klasse="bestellen" beschriftetVon="bestellen-titel">
      {/* Dieselbe Technik wie im Hero: echte Fotografie, darüber ein deckender
          Cremeschleier. Sie schliesst den Kreis — die Seite beginnt und endet
          auf demselben Holz. Der Schleier ist hier dichter, weil hier gelesen
          und getippt wird, nicht geschaut. */}
      {/* ═══ Ihr Laden unter der Orangefolie ═══

          Karol: „Kann man ein Bild vom Laden nehmen und transparent in den
          Hintergrund legen auf einer orangenen Folie?"

          Genau das, und es ist mehr als eine Textur: hier steht „Ruf an oder
          schreib uns", und dahinter liegt der Ort, an dem abgehoben wird. Bei
          92 % Deckung erkennt man das Motiv nicht mehr, aber die Markise, die
          Tische und die Menschen geben der Fläche eine Tiefe, die kein
          Holzmakro hat.

          Hier lag holz-makro. Das war richtig, solange es die einzige Sektion
          mit Grund war; jetzt haben fünf andere Texturen, und diese eine darf
          etwas Eigenes sein.

          0,94 statt 0,92 und tiefer angeschnitten: bei 0,92 las sich ihr
          Schriftzug deutlich genug, um mit der Schlagzeile zu streiten. Jetzt
          tragen Markise, Tische und Menschen die Fläche, ohne dass man ein
          zweites „Aram" liest. */}
      <Untergrund
        muster="foto"
        bild="bilder/echt/ladenfront.webp"
        ton="glut"
        staerke={0.94}
        lage="50% 68%"
        breite={1400}
        hoehe={934}
      />

      <div className="schale">
        <Kopf
          id="bestellen-titel"
          etikett="Bestellen"
          titel="Ruf an oder schreib uns"
          lead="Beides geht sofort und kostet uns keine Provision. Wir sagen dir am Telefon, wie lange es dauert."
        />

        <Oeffnung className="bestellen__oeffnung" />

        {/* Zwei Spalten: links die Wege, die HEUTE funktionieren, rechts das,
            was noch offen ist. Untereinander gestellt läse sich die Vorschau
            wie ein gleichwertiges Angebot. */}
        <div className="bestellen__gitter">
        <div className="bestellen__wege" ref={wege}>
          <a className="weg" href={ARAM.kontakt.telefonHref}>
            <Etikett klasse="weg__art">Anrufen</Etikett>
            <span className="weg__wert">{ARAM.kontakt.telefon}</span>
            <span className="weg__zusatz">Am schnellsten. Auch für Sonderwünsche.</span>
          </a>

          <a
            className="weg weg--glut"
            href={ARAM.kontakt.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Etikett klasse="weg__art">WhatsApp</Etikett>
            <span className="weg__wert">Nachricht schreiben</span>
            <span className="weg__zusatz">
              Gerichte in der Karte antippen, der Text schreibt sich selbst.
            </span>
          </a>

        </div>

        <div className="dienste">
          <Etikett klasse="dienste__titel">Lieferdienste</Etikett>
          <p className="dienste__stand">
            <span className="luecke">noch nicht bestätigt</span>
          </p>
          <ul className="dienste__liste">
            {DIENSTE.map((d) => (
              <li key={d.name}>
                <span
                  className="knopf knopf--leise"
                  aria-disabled={d.schalter.aktiv ? undefined : 'true'}
                >
                  {d.name}
                </span>
              </li>
            ))}
          </ul>
          <p className="dienste__grund leise">
            Wir wissen noch nicht, ob Aram dort gelistet ist. Solange das offen ist, steht hier
            kein Link. Ein Knopf, der ins Leere führt, ist schlimmer als keiner.
          </p>
        </div>
        </div>

        {/* ═══ Der QR — ein eigener Moment, kein Kärtchen in der Ecke ═══

            Karol: „soll nicht billig aussehen, sondern kreativ eingearbeitet.
            Dann soll der Olivenzweig platziert sein."

            Bei Shop und Dub nachgesehen (Mobbin): ein QR trägt, wenn er MITTIG
            steht, Luft bekommt und eine Zeile über sich hat — und wenn in
            seiner Mitte ein Zeichen sitzt. Dub macht genau das. Möglich ist es
            nur mit Fehlerkorrektur H, und genau damit ist unserer gebaut
            (werkzeug/qrbauen.py): dreissig Prozent der Fläche dürfen fehlen.

            Die zwei Olivenzweige links und rechts sind IHRE Anordnung — auf
            dem Aufkleber am Tresen flankieren sie das Rund mit der Sonne. Hier
            flankieren sie den Code. Das ist der Unterschied zwischen einem
            Ornament, das man dazustellt, und einem, das schon zur Marke
            gehörte. */}
        <div className="scanschild">
          <Olivenzweig klasse="scanschild__zweig scanschild__zweig--links" />

          <div className="scanschild__mitte">
            <p className="scanschild__gross">Karte aufs Handy</p>
            <div className="scanschild__bogen">
              <img
                className="scanschild__code"
                src={pfad('bilder/marke/qr-karte.svg')}
                alt=""
                width={220}
                height={220}
              />
              {/* Sitzt IM Code, nicht daneben. Die Fehlerkorrektur trägt es. */}
              <span className="scanschild__siegel" aria-hidden="true">
                <span lang="ar" dir="rtl">أرام</span>
              </span>
            </div>
            <p className="scanschild__wort">
              Scannen, dann liest du die Karte am Tisch weiter.
            </p>
          </div>

          <Olivenzweig klasse="scanschild__zweig scanschild__zweig--rechts" />
        </div>
      </div>
    </Sektion>
  )
}
