import { useAuftauchen } from '../bewegung.ts'
import { pfad } from '../pfad.ts'
import { ARAM } from '../aram.config.ts'
import Oeffnung from './ui/Oeffnung.tsx'
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
      {/* ═══ Das Ladenfoto im Grund ist raus ═══

          Karol: „diese Seite, wo dieses Aram-Bild im Hintergrund ist, das ist
          es wirklich nicht."

          Es war meine Idee, seine Anregung aufzunehmen, und sie war falsch:
          ein Foto unter einer Folie bleibt ein Foto. Man erkennt Markise und
          Schriftzug, und damit stand hinter „Ruf an oder schreib uns" ein
          zweites Bild derselben Sache, die drei Sektionen höher schon zu sehen
          war. Die Saat stellt nichts dar und stört deshalb nicht. */}
      <Untergrund ton="glut" muster="saat" />

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

            Hier standen zwei Olivenzweige links und rechts, die ich selbst
            gezeichnet hatte. Sie fliegen raus, seit ihr echtes Emblem da ist:
            das enthält die Zweige BEREITS, und ein gezeichneter Zweig neben
            einem echten ist derselbe Gedanke zweimal — einmal erfunden, einmal
            belegt. Was bleibt, ist ihr Zeichen mitten im Code und der Bogen
            ihres Ofens darum. Beides ihres. */}
        <div className="scanschild">
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
              {/* Ihr Emblem sitzt IM Code, nicht daneben. Möglich nur mit
                  Fehlerkorrektur H — dreissig Prozent der Fläche dürfen
                  fehlen, das Siegel deckt gut sechs. Hier stand bis eben ihr
                  Name als Schriftzug; jetzt steht ihr Zeichen da. */}
              <img
                className="scanschild__siegel"
                src={pfad('bilder/marke/emblem-klein.webp')}
                alt=""
                width={240}
                height={240}
                aria-hidden="true"
              />
            </div>
            <p className="scanschild__wort">
              Scannen, dann liest du die Karte am Tisch weiter.
            </p>
          </div>
        </div>
      </div>
    </Sektion>
  )
}
