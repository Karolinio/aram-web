import { useEffect, useRef } from 'react'

import galerieRoh from '../../inhalt/galerie.json'
import { werkzeugHolen } from '../bewegung.ts'
import { Kopf, Sektion } from './ui/bausteine.tsx'

type Bild = { nr: number; titel: string; lage: 'hoch' | 'quer'; breite: number; hoehe: number }
const BILDER = galerieRoh as Bild[]

/**
 * Die Galerie — sieben Bilder, die waagerecht vorbeiziehen.
 *
 * ═══ Warum waagerecht und nicht als Raster ═══
 *
 * Ein Raster aus sieben gleich grossen Kacheln beantwortet die Frage „was gibt
 * es hier" mit „sieben Sachen". Es ordnet, aber es erzählt nichts, und es
 * sieht auf jeder Seite gleich aus.
 *
 * Waagerecht ist etwas anderes: die Bilder kommen NACHEINANDER, in einer
 * Reihenfolge, die jemand gewählt hat. Vom Blech über die Glut zum Tisch. Der
 * Scroll wird zur Kamerafahrt an einem Tresen entlang — und das ist genau die
 * Bewegung, die jemand macht, der vor ihrer Auslage steht.
 *
 * ═══ Warum KEINE Freisteller ═══
 *
 * Karol am 21.08.: „die ganzen Bilder, wo mehrere Stücke dran sind, sind alle
 * ungeeignet." Er hat recht, und der Grund ist nicht das Freistellen.
 *
 * Ein Freisteller nimmt einem Foto den ORT. Bei einem einzelnen Gericht ist das
 * ein Gewinn — es schwebt dann über der Seite. Bei einem Blech voller Gebäck
 * vor einem Kuppelofen nimmt es dem Bild genau das, was es sehenswert macht:
 * das Feuer dahinter, die Steine, den Schieber. Übrig bleibt eine Ansammlung
 * brauner Formen ohne Massstab.
 *
 * In der Galerie steht deshalb das ganze Foto. Freigestellt wird nur, was
 * fliegen soll — und fliegen soll genau ein Gegenstand, nicht sieben.
 *
 * ═══ Die Tiefe ═══
 *
 * Die Bilder liegen auf zwei Ebenen: hohe stehen gross und vorn, quere kleiner
 * und etwas versetzt. Beim Vorbeiziehen laufen sie unterschiedlich schnell —
 * das ist Parallaxe, und sie ist der Grund, dass die Reihe Tiefe hat statt
 * eine Tapete zu sein.
 */
export default function Galerie() {
  const buehne = useRef<HTMLDivElement>(null)
  const bahn = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const b = buehne.current
    const s = bahn.current
    if (!b || !s) return

    let tot = false
    let abraeumen: (() => void) | undefined

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      const { gsap, ScrollTrigger } = werkzeug

      const mm = gsap.matchMedia()

      /* Ohne Bewegungswunsch: keine Anheftung, keine Fahrt. Die Bahn wird zur
         normalen waagerechten Rolle, die man mit dem Finger schiebt. Das ist
         der Ersatz, nicht das Abschalten — eine Bewegung, die etwas erklärt
         hat, hinterlässt ersatzlos ein Loch. */
      /**
       * ═══ Angeheftet nur am RECHNER ═══
       *
       * Gemessen: mit der angehefteten Fahrt sprang der Scrollweg am Handy von
       * 10,8 auf 14,8 Bildschirmhöhen. Vier zusätzliche Bildschirme für sieben
       * Bilder — auf einem Daumen ist das Arbeit, kein Vergnügen.
       *
       * Am Handy wischt man Galerien ohnehin. Die Bahn wird dort zur normalen
       * waagerechten Rolle mit Schnappen: kein Anheften, kein zusätzlicher
       * Scrollweg, und die Geste ist die, die jeder erwartet.
       *
       * Das ist kein Weglassen. Die Bewegung wird ZUSAMMENGELEGT — dieselbe
       * Reihenfolge, dieselben Bilder, ein anderer Antrieb.
       */
      mm.add('(min-width: 720px) and (prefers-reduced-motion: no-preference)', () => {
        /* Der Weg, den die Bahn zurücklegen muss, in Pixeln: ihre Breite minus
           das Fenster. Als Funktion, damit `invalidateOnRefresh` bei Drehung
           des Geräts neu rechnet statt einen Wert von vorhin zu benutzen. */
        const weg = () => Math.max(0, s.scrollWidth - window.innerWidth)

        const zug = gsap.to(s, {
          x: () => -weg(),
          ease: 'none',
          scrollTrigger: {
            trigger: b,
            start: 'top top',
            /* Der Scrollweg entspricht dem Fahrweg plus eine halbe
               Bildschirmhöhe Anlauf. Ein fester Wert wie „+=200 %" wäre bei
               sieben Bildern zu kurz und bei drei zu lang. */
            end: () => `+=${weg() + window.innerHeight * 0.5}`,
            /* `transform` statt `fixed`: eine angeheftete Sektion in `fixed`
               nimmt ihren Platz aus dem Fluss und verschiebt alles darunter.
               Das hat auf dieser Seite schon einmal CLS 0,525 gekostet. */
            pinType: 'transform',
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        /* Die zweite Ebene läuft eine Spur schneller als die Bahn selbst.
           Daraus entsteht die Tiefe — nicht aus einem Schatten. */
        const nah = gsap.utils.toArray<HTMLElement>('[data-ebene="nah"]', s)
        const tiefe = gsap.to(nah, {
          xPercent: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: b,
            start: 'top top',
            end: () => `+=${weg() + window.innerHeight * 0.5}`,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })

        return () => {
          zug.scrollTrigger?.kill()
          zug.kill()
          tiefe.scrollTrigger?.kill()
          tiefe.kill()
          gsap.set([s, ...nah], { clearProps: 'transform' })
        }
      })

      ScrollTrigger.refresh()
      abraeumen = () => mm.revert()
    })

    return () => {
      tot = true
      abraeumen?.()
    }
  }, [])

  return (
    <Sektion
      id="galerie"
      grund="tief"
      klasse="galerie"
      beschriftetVon="galerie-titel"
    >
      <Kopf
        id="galerie-titel"
        etikett="Aus dem Laden"
        titel="Was an einem Morgen entsteht"
        lead="Sieben Bilder in der Reihenfolge, in der es passiert — vom Blech über die Glut auf den Tisch."
      />

      <div className="galerie__buehne" ref={buehne}>
        <ul className="galerie__bahn" ref={bahn}>
          {BILDER.map((bild, i) => (
            <li
              key={bild.nr}
              className="galerie__stueck"
              data-lage={bild.lage}
              data-ebene={bild.lage === 'hoch' ? 'fern' : 'nah'}
            >
              <figure>
                <img
                  src={`/bilder/galerie/${String(bild.nr).padStart(2, '0')}.webp`}
                  srcSet={`/bilder/galerie/${String(bild.nr).padStart(2, '0')}-klein.webp 520w, /bilder/galerie/${String(bild.nr).padStart(2, '0')}.webp 900w`}
                  sizes="(max-width: 700px) 78vw, 32vw"
                  alt={bild.titel}
                  width={bild.breite}
                  height={bild.hoehe}
                  /* Die ersten zwei stehen beim Betreten der Sektion schon im
                     Bild. Alles danach kommt erst beim Fahren — es lazy zu
                     laden spart auf dem Handy die Hälfte der Galerie. */
                  loading={i < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                />
                <figcaption>{bild.titel}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </Sektion>
  )
}
