import { ARAM } from '../aram.config.ts'
import { useAbgang, useKamerafahrt, useVersatz } from '../bewegung.ts'
import Dampf from './ui/Dampf.tsx'
import Oeffnung from './ui/Oeffnung.tsx'
import Ladenschild from './Ladenschild.tsx'
import { Bild } from './ui/bausteine.tsx'

/**
 * Die Backstube — der Anfang.
 *
 * ═══ Was sich am 16.08. geändert hat ═══
 *
 * Vorher lag hier eine erzeugte Mehl-auf-Holz-Textur als Grund, und IHR Laden
 * stand daneben als eines von zwei Bildern in einer Spalte. Karol: „vielleicht
 * ein Bild vom Laden ganzflächig oder sogar ein Video von oben wie Drohnenfahrt".
 *
 * Er hat recht, und zwar aus einem Grund, der über den Geschmack hinausgeht:
 * die Textur war erzeugt, das Ladenfoto ist echt. Ein Gast, der in Hardtberg an
 * dieser Front vorbeigeht, erkennt sie wieder — die orange Markise, das
 * beleuchtete Schild, die arabische Tafel daneben. Das ist der einzige Beweis,
 * den eine Gastro-Seite führen kann, und er lag in der zweiten Reihe.
 *
 * ═══ Der Aufbau, drei Ebenen ohne einen einzigen Weichzeichner ═══
 *
 *   hinten   ihre Ladenfront, randlos über die ganze Breite, in einer
 *            Kamerafahrt: beim Laden fährt sie in ihre Ruhelage, beim Scrollen
 *            schiebt sie weiter hinein.
 *   darüber  ein Cremeschleier — eine DECKENDE Fläche mit Alpha, kein
 *            Weichzeichner. Links dicht, wo die Schrift steht; rechts dünn,
 *            damit das Foto wirklich zu sehen ist und nicht nur zu ahnen.
 *   vorn     Schild und Satz links, das freigestellte Gebäck rechts unten, und
 *            es ragt in die nächste Sektion hinein. Diese Überlappung IST die
 *            Tiefe.
 *
 * ═══ Was hier fehlt und warum es nicht ersetzt wird ═══
 *
 * Die Direktion sieht hier ein freigestelltes Gericht vor, das hereinschwebt und
 * an die Reise übergibt. Freigestellte Aufnahmen gibt es noch nicht — der
 * Inhaber ist im Urlaub. Statt eines erzeugten Fatayers steht hier IHR echtes
 * Foto, freigestellt, wie es ist.
 */
export default function Backstube() {
  const bild = useVersatz<HTMLDivElement>(-0.06)
  const fahrt = useKamerafahrt<HTMLImageElement>('.backstube')
  /* Beim Herunterscrollen hebt die Schlagzeile ab. Sie begrüsst und geht dann
     aus dem Weg — sie fährt nicht die ganze Seite mit. */
  const titel = useAbgang<HTMLHeadingElement>('.backstube')

  return (
    <section className="backstube" id="start" aria-labelledby="backstube-titel">
      <div className="backstube__grund" aria-hidden="true">
        {/* Der Rahmen trägt die Einfahrt beim Laden, das Bild die Fahrt beim
            Scrollen. Zwei Knoten, weil zwei `transform` auf einem Knoten
            einander still überschreiben. */}
        <div className="backstube__rahmen">
          <picture>
            {/* Am Handy ein ANDERER Ausschnitt, nicht dasselbe Bild kleiner.
                Grund: auf einer schmalen Fläche füllt `cover` nach Höhe, das
                Bild ist also in voller Höhe zu sehen — samt der Tafel über
                ihrer Tür, auf der „Aram" steht. Neben unserem Schild wären das
                wieder zwei Wortmarken. Dieser Ausschnitt beginnt unterhalb der
                Tafel: die fünf Männer, die Tür, „mehr als 25 Jahre Erfahrung". */}
            {/* `width`/`height` stehen an JEDER Quelle, nicht nur am `img`.
                Der Handy-Ausschnitt ist 560×599, das volle Bild 1024×784 —
                stünde nur das eine Maß da, behauptete die Seite für den
                Ausschnitt ein Seitenverhältnis, das 40 % danebenliegt. Hier
                bestimmt zwar der Container die Box, aber eine falsche Angabe
                ist eine falsche Angabe: sie wird zur Falle, sobald jemand die
                Regel ändert. */}
            <source
              media="(max-width: 640px)"
              srcSet="/bilder/echt/team-laden-schmal.webp"
              width={560}
              height={599}
            />
            <source
              media="(max-width: 1100px)"
              srcSet="/bilder/echt/team-laden-900.webp"
              width={900}
              height={689}
            />
            {/* KEIN `width`/`height` am `img` — und das ist hier die richtige
                Wahl, nicht eine vergessene.

                Die Attribute dienen einem Zweck: dem Browser vor dem Laden das
                Seitenverhältnis zu verraten, damit er Platz reserviert. Dieses
                Bild reserviert nichts — es liegt in einem absolut gesetzten
                Rahmen und ist per CSS 100 % breit und 100 % hoch. Sein
                Eigenmaß beeinflusst kein Layout.

                Stünde hier ein Maß, wäre es für den Handy-Ausschnitt falsch
                (560×599 gegen 1024×784, 40 % daneben) — eine Angabe, die
                stimmt, solange niemand die CSS-Regel anfasst. Die Maße stehen
                deshalb an den Quellen, wo sie je Datei stimmen. */}
            <img
              ref={fahrt}
              src="/bilder/echt/team-laden.webp"
              alt=""
              /* Das grösste Bild über der Falz und zugleich das erste Argument
                 der Seite. Es früh und bevorzugt zu laden ist der Unterschied
                 zwischen einer Seite, die steht, und einer, die eine Sekunde
                 lang leer ist. */
              loading="eager"
              fetchPriority="high"
              decoding="sync"
            />
          </picture>
        </div>
        <div className="backstube__schleier" />
      </div>

      <div className="schale backstube__gitter">
        <div className="backstube__satz">
          {/* ═══ Warum hier vier Zeilen stehen und vorher sieben ═══

              Am 20.08. hatte der Hero: Logo (672 px breit), eine orange
              Unterzeile, einen Vorspann, die Öffnungszeit, ZWEI Knöpfe, einen
              Bildnachweis und ein schwebendes Gebäck. Karol: „Die Startseite
              ist eine Katastrophe."

              Sie war es, und nicht wegen einer der acht Sachen. Acht Dinge, die
              gleichzeitig sprechen, sagen nichts — der Blick findet keinen
              Anfang und bleibt deshalb nirgends hängen. Ein Hero hat EINEN
              Satz, und alles andere steht ihm bei.

              Die Reihenfolge ist jetzt: wer (Marke), wo (Ort), was (Satz),
              wie (Beleg). Vier Stufen, absteigend laut. */}
          <Ladenschild />

          {/* KURZ, und das ist gemessen statt entschieden.

              Hier stand „Bonn-Hardtberg · seit über 25 Jahren". In der
              Ersatzschrift brach die Zeile auf ZWEI Zeilen um, mit Reem Kufi
              auf eine — 42 px gegen 21 px, und die 21 px Differenz schoben
              Schlagzeile, Vorspann, Knopf, Gebäck und die ganze nächste
              Sektion nach oben, sobald die Schrift eintraf. Das war der Rest
              des Sprungs, den `size-adjust` nicht auflösen konnte: eine Zeile,
              die umbricht, ist kein Metrikproblem, sondern eine zu lange Zeile.

              Kürzer ist hier ausserdem richtiger. Bonn-Hardtberg steht schon im
              Bildnachweis unten, „Orientalisches Gebäck und Pizza" im Vorspann
              darunter — die Zeile hat zwei Sachen gesagt, die beide woanders
              stehen. Was bleibt, ist die einzige, die sonst nirgends steht. */}
          <p className="backstube__ort">Seit über 25 Jahren</p>

          {/* Die Schlagzeile ist gesetzte Schrift, nicht mehr ihr Logo.

              Es ist IHR Satz — er stand vorher als Vorspann klein unter dem
              Logo, und das war die Verschwendung: der beste Satz der Seite als
              Kleingedrucktes unter einem Rasterbild. Ein Handzettel behauptet
              „bester Geschmack"; dieser Satz sagt, was jemand um sechs Uhr
              morgens tut. Genau das kann kein Wettbewerber abschreiben. */}
          <h1 id="backstube-titel" className="backstube__titel" ref={titel}>
            Jeder Teig wird morgens von Hand gerollt
          </h1>

          <p className="lead backstube__lead">
            Orientalisches Gebäck und Pizza, belegt erst bei deiner Bestellung.
          </p>

          <Oeffnung className="backstube__oeffnung" />

          {/* EIN Knopf, nicht zwei. Karol: „auch mit dem orangenen Button in
              der Ecke … auf jeden Fall einmal musst du ihn raus. Ich würd'
              sagen, von der Startseite oben rechts kannst du den lassen."

              Er hat damit die richtige der beiden Nummern gestrichen. Die
              Telefonnummer steht fest in der Kopfzeile und ist auf JEDER
              Bildschirmhöhe erreichbar; dieselbe Nummer zwei Zentimeter
              darunter noch einmal als Farbklotz ist keine zweite Gelegenheit,
              sondern ein zweiter Anspruch auf dieselbe Aufmerksamkeit. */}
          <div className="backstube__knoepfe">
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

        {/* Die Bildunterschrift des Grundes. Sie steht hier und nicht am Bild,
            weil der Grund keinen Platz für eine hat — und weglassen wäre falsch:
            wer auf diesem Foto steht, ist die Aussage des Fotos. */}
        <p className="backstube__nachweis">
          Der Inhaber und seine Brüder, vor ihrer Tür in Bonn-Hardtberg
        </p>

        <div className="backstube__bild" ref={bild}>
          {/* Der Dampf steigt HINTER dem Gebäck auf, nicht davor. Vorne wäre er
              ein Schleier über dem Produkt; hinten kommt er von der Oberseite,
              und genau so sieht man ihn an einem Blech, das gerade aus dem Ofen
              kommt. Er steht hier und nicht in der Sektion, weil er zu DIESEM
              Gegenstand gehört — er wandert mit ihm, wenn er sich verschiebt. */}
          <Dampf klasse="backstube__dampf" ton="warm" />
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
