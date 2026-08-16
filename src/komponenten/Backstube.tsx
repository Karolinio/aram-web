import { ARAM } from '../aram.config.ts'
import { useVersatz } from '../bewegung.ts'
import Oeffnung from './ui/Oeffnung.tsx'
import Ladenschild from './Ladenschild.tsx'

/**
 * Die Backstube — der Anfang.
 *
 * ═══ Der Aufbau, drei Ebenen ohne einen einzigen Weichzeichner ═══
 *
 *   hinten   die Fotografie: Mehl auf heller Holzarbeitsplatte, Morgenlicht von
 *            links durchs Fenster. Randlos, über die ganze Breite.
 *   darüber  ein Cremeschleier — eine DECKENDE Fläche mit Alpha, kein
 *            Weichzeichner. Er nimmt dem Foto den Kontrast und lässt seine
 *            Struktur stehen. Genau daran unterscheidet sich Papier von einer
 *            durchscheinenden Scheibe.
 *   vorn     die Schrift links, das Foto rechts, und das Foto ragt nach unten
 *            in die nächste Sektion hinein. Diese Überlappung IST die Tiefe.
 *
 * ═══ Was hier fehlt und warum es nicht ersetzt wird ═══
 *
 * Die Direktion sieht hier ein freigestelltes Gericht vor, das hereinschwebt und
 * an die Reise übergibt. Freigestellte Aufnahmen gibt es noch nicht — der
 * Inhaber ist im Urlaub. Statt eines erzeugten Fatayers steht hier IHR echtes
 * Foto, rechteckig, wie es ist. Ein erzeugtes Fatayer wäre eine Aussage über ein
 * Produkt, das der Gast gleich in der Hand hält.
 */
export default function Backstube() {
  const bild = useVersatz<HTMLElement>(-0.06)

  return (
    <section className="backstube" id="start" aria-labelledby="backstube-titel">
      <div className="backstube__grund" aria-hidden="true">
        <picture>
          <source media="(max-width: 640px)" srcSet="/bilder/textur/mehl-holz-klein.webp" />
          <img
            src="/bilder/textur/mehl-holz.webp"
            alt=""
            width={1700}
            height={949}
            /* Das grösste Bild über der Falz. Es früh und bevorzugt zu laden ist
               der Unterschied zwischen einer Seite, die steht, und einer, die
               eine Sekunde lang leer ist. */
            loading="eager"
            fetchPriority="high"
            decoding="sync"
          />
        </picture>
        <div className="backstube__schleier" />
      </div>

      <div className="schale backstube__gitter">
        <div className="backstube__satz">
          <Ladenschild />
          <p className="backstube__unter">Orientalisches Gebäck &amp; Pizza · Bonn-Hardtberg</p>

          <p className="lead backstube__lead">
            Jeder Teig wird morgens von Hand gerollt und erst bei deiner Bestellung belegt.
          </p>

          <Oeffnung className="backstube__oeffnung" />

          <div className="backstube__knoepfe">
            <a className="knopf" href={ARAM.kontakt.telefonHref}>
              <span aria-hidden="true">☎</span> {ARAM.kontakt.telefon}
            </a>
            <a
              className="knopf knopf--leise"
              href={ARAM.kontakt.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              Über WhatsApp bestellen
            </a>
          </div>
        </div>

        {/* Freigestellt, nicht rechteckig: „Das Essen liegt nicht auf dieser
            Seite, es schwebt darüber" — der erste Satz der Direktion, und bis
            jetzt war er nicht eingelöst. Der Freisteller entsteht durch
            Hintergrundentfernung an IHREM Foto; erzeugt ist daran nichts. */}
        <figure className="backstube__bild" ref={bild}>
          <img
            src="/bilder/echt/fatayer-frei.webp"
            alt="Ein Fata’er von Aram, gewölbt und glänzend, dicht mit Sesam und Schwarzkümmel bestreut"
            width={1000}
            height={799}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <figcaption>Fata’er, frisch aus dem Ofen</figcaption>
        </figure>
      </div>
    </section>
  )
}
