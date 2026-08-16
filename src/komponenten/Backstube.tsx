import { ARAM } from '../aram.config.ts'
import { useVersatz } from '../bewegung.ts'
import Oeffnung from './ui/Oeffnung.tsx'
import Ladenschild from './Ladenschild.tsx'
import { Bild } from './ui/bausteine.tsx'

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
  const bild = useVersatz<HTMLDivElement>(-0.06)

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
        {/* Ihre Ladenfront mit den fünf Männern davor — der Beweis, dass es den
            Laden gibt. Sie läuft links aus dem Bild heraus: von Savor geklaut,
            wo genau diese Asymmetrie den Unterschied zwischen einer Seite und
            einem Raster macht. */}
        <Bild
          klasse="backstube__laden"
          quelle="/bilder/echt/team-laden.webp"
          alt="Fünf Männer vor dem Laden von Aram, mit Nudelholz, einem Blech mit Teigscheiben und zwei hölzernen Ofenschiebern"
          breite={1024}
          hoehe={784}
          unterschrift="Der Inhaber und seine Brüder, vor der Tür in Bonn-Hardtberg"
          eilig
        />

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
            Seite, es schwebt darüber" — der erste Satz der Direktion. Der
            Freisteller entsteht durch Hintergrundentfernung an IHREM Foto.

            Ohne Bildunterschrift: das Element liegt frei über der Sektion, und
            eine Unterschrift landete dadurch mitten im Fliesstext. Was es ist,
            sagt der Alternativtext — und die Karte zwei Sektionen weiter. */}
        <div className="backstube__bild" ref={bild}>
          <Bild
            quelle="/bilder/echt/fatayer-frei.webp"
            alt="Ein Fata’er von Aram, gewölbt und glänzend, dicht mit Sesam und Schwarzkümmel bestreut"
            breite={1000}
            hoehe={799}
            eilig
          />
        </div>
      </div>
    </section>
  )
}
