import { ARAM } from '../aram.config.ts'
import Oeffnung from './ui/Oeffnung.tsx'

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
  return (
    <section className="bestellen" id="bestellen" aria-labelledby="bestellen-titel">
      {/* Dieselbe Technik wie im Hero: echte Fotografie, darüber ein deckender
          Cremeschleier. Sie schliesst den Kreis — die Seite beginnt und endet
          auf demselben Holz. Der Schleier ist hier dichter, weil hier gelesen
          und getippt wird, nicht geschaut. */}
      <div className="bestellen__grund" aria-hidden="true">
        <img
          src="/bilder/textur/holz-makro.jpg"
          alt=""
          width={1500}
          height={837}
          loading="lazy"
          decoding="async"
        />
        <div className="bestellen__schleier" />
      </div>

      <div className="schale">
        <span className="augenbraue">Bestellen</span>
        <h2 id="bestellen-titel">Ruf an oder schreib uns</h2>
        <p className="lead">
          Beides geht sofort und kostet uns keine Provision. Wir sagen dir am Telefon, wie
          lange es dauert.
        </p>

        <Oeffnung className="bestellen__oeffnung" />

        {/* Zwei Spalten: links die Wege, die HEUTE funktionieren, rechts das,
            was noch offen ist. Untereinander gestellt läse sich die Vorschau
            wie ein gleichwertiges Angebot. */}
        <div className="bestellen__gitter">
        <div className="bestellen__wege">
          <a className="weg" href={ARAM.kontakt.telefonHref}>
            <span className="weg__art">Anrufen</span>
            <span className="weg__wert">{ARAM.kontakt.telefon}</span>
            <span className="weg__zusatz">Am schnellsten. Auch für Sonderwünsche.</span>
          </a>

          <a
            className="weg weg--glut"
            href={ARAM.kontakt.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="weg__art">WhatsApp</span>
            <span className="weg__wert">Nachricht schreiben</span>
            <span className="weg__zusatz">
              Gerichte in der Karte antippen — der Text schreibt sich selbst.
            </span>
          </a>
        </div>

        <div className="dienste">
          <p className="dienste__titel">
            Lieferdienste — <span className="luecke">noch nicht bestätigt</span>
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
            kein Link — ein Knopf, der ins Leere führt, ist schlimmer als keiner.
          </p>
        </div>
        </div>
      </div>
    </section>
  )
}
