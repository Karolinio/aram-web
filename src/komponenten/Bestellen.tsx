import { useAuftauchen } from '../bewegung.ts'
import { pfad } from '../pfad.ts'
import { ARAM } from '../aram.config.ts'
import Oeffnung from './ui/Oeffnung.tsx'
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
      <div className="bestellen__grund" aria-hidden="true">
        <img
          src="/bilder/textur/holz-makro.webp"
          alt=""
          width={1500}
          height={837}
          loading="lazy"
          decoding="async"
        />
        <div className="bestellen__schleier" />
      </div>

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
              Gerichte in der Karte antippen — der Text schreibt sich selbst.
            </span>
          </a>

          {/* ═══ Der QR im Ofenbogen ═══

              Karol wollte ihn „cool eingebaut, vielleicht in einen Steinofen".
              In ein OFENFOTO gelegt hätte er aufgehört zu funktionieren: ein
              Scanner braucht harten Kontrast, eine ruhige Zone und keine
              Perspektive. Ein Foto liefert keines davon.

              Was trägt, ist die FORM ihres Ofens statt seines Bildes — der
              gemauerte Rundbogen, den die Galerie und die Tafel im Vorhang
              schon führen. Der Code liegt flach und sauber darin.

              Bei DICE und Sana nachgesehen (Mobbin): ein QR wirkt durch Luft
              und einen Satz, nicht durch Verzierung. Deshalb steht hier genau
              eine Zeile daneben und sonst nichts.

              Er zeigt auf UNSERE Karte, nicht auf den gedruckten Aufkleber am
              Tresen: wer am Rechner sitzt, holt sich damit die Karte aufs
              Handy. Erzeugt mit werkzeug/qrbauen.py — bei einem Domainwechsel
              neu bauen, siehe dort. */}
          <div className="scanschild">
            <div className="scanschild__bogen">
              <img
                className="scanschild__code"
                src={pfad('bilder/marke/qr-karte.svg')}
                alt=""
                width={200}
                height={200}
              />
            </div>
            <p className="scanschild__wort">
              <span className="scanschild__gross">Karte aufs Handy</span>
              Scannen, dann liest du sie am Tisch weiter.
            </p>
          </div>
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
            kein Link — ein Knopf, der ins Leere führt, ist schlimmer als keiner.
          </p>
        </div>
        </div>
      </div>
    </Sektion>
  )
}
