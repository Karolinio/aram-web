import { useVersatz } from '../bewegung.ts'

/**
 * Handarbeit — der Savor-Rhythmus und das eine laute Farbfeld.
 *
 * ═══ Das Band ═══
 *
 * Ein einziges gesättigtes Feld in IHREM Orange, quer über die ganze Breite, mit
 * dunkler Schrift darauf. Von Yellowbird geklaut, aber nicht deren Register:
 * dort schreit die Farbe, hier trägt das Material. Es ist die einzige Stelle der
 * Seite, an der `--glut` grossflächig steht — ein Effekt, der überall ist, ist
 * keiner.
 *
 * Gemessen: Ruß auf Glut hält 4,97 (AA). Das reicht für Schrift dieser Grösse
 * und für nichts Kleineres. Deshalb steht auf dieser Fläche genau ein Satz und
 * keine Bildunterschrift.
 *
 * ═══ Der Rhythmus ═══
 *
 * Zwei Fotos, verschieden breit, versetzt, überlappend, keins mittig. Sie ziehen
 * beim Scrollen ungleich schnell hoch (`useVersatz`) — daraus entsteht Bewegung,
 * ohne dass sich ein Element dreht oder skaliert. Kein Rahmen, kein Schatten,
 * kein Kasten: die Bilder liegen einfach da.
 *
 * Die Merkmalskarten stehen DANEBEN, nicht darauf. Eine Beschriftung auf einem
 * Foto ist eine Sprechblase, und Sprechblasen sind der Ton einer Werbeanzeige.
 */
export default function Handarbeit() {
  const links = useVersatz<HTMLElement>(-0.08)
  const rechts = useVersatz<HTMLElement>(0.05)

  return (
    <>
      <div className="band">
        <p className="band__satz schale">Du siehst zu, wie dein Fata’er entsteht.</p>
      </div>

      <section className="handarbeit" aria-labelledby="handarbeit-titel">
        <div className="schale handarbeit__gitter">
          <div className="handarbeit__wort">
            <span className="augenbraue">Rollen, belegen, in den heissen Ofen</span>
            <h2 id="handarbeit-titel">Alles entsteht vor deinen Augen</h2>
            <p>
              Der Teig wird morgens von Hand gerollt, nicht aus der Kiste geholt. Belegt wird
              erst, wenn du bestellt hast — deshalb dauert es ein paar Minuten, und deshalb
              schmeckt man den Unterschied.
            </p>
          </div>

          <figure className="handarbeit__bild handarbeit__bild--gross" ref={links}>
            <img
              src="/bilder/echt/handarbeit.webp"
              alt="Zwei Bäcker drücken Teigscheiben auf der bemehlten Arbeitsfläche, daneben ein Stapel fertiger Fladen"
              width={500}
              height={600}
              loading="lazy"
              decoding="async"
            />
          </figure>

          <ul className="merkmale">
            <li className="merkmal">
              <span className="merkmal__zahl">01</span>
              <p className="merkmal__text">Teig morgens von Hand gerollt</p>
            </li>
            <li className="merkmal">
              <span className="merkmal__zahl">02</span>
              <p className="merkmal__text">Erst bei deiner Bestellung belegt</p>
            </li>
            <li className="merkmal">
              <span className="merkmal__zahl">03</span>
              <p className="merkmal__text">Im Steinofen gebacken, vor den Augen der Gäste</p>
            </li>
          </ul>

          <figure className="handarbeit__bild handarbeit__bild--klein" ref={rechts}>
            <img
              src="/bilder/echt/brueder.webp"
              alt="Zwei der Brüder vor dem Laden, unter dem orangefarbenen Schild"
              width={500}
              height={600}
              loading="lazy"
              decoding="async"
            />
            <figcaption>Geführt wird der Laden vom Inhaber und seinen Brüdern.</figcaption>
          </figure>
        </div>
      </section>
    </>
  )
}
