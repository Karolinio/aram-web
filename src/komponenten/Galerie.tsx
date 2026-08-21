import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'

import galerieRoh from '../../inhalt/galerie.json'
import { werkzeugHolen } from '../bewegung.ts'
import { Kopf, Sektion } from './ui/bausteine.tsx'

type Bild = { nr: number; titel: string; lage: 'hoch' | 'quer'; breite: number; hoehe: number }
const BILDER = galerieRoh as Bild[]

/**
 * Die Höhenversätze, in rem. Sieben Werte, unregelmässig — und das ist der
 * ganze Punkt.
 *
 * Karol: „nicht gleichmässig angeordnet aussehen."
 *
 * Vorher gab es ZWEI Höhen, die sich mit der Lage abwechselten: hoch oben,
 * quer unten. Das ist ein Muster, und ein Muster erkennt das Auge nach zwei
 * Wiederholungen — danach liest die Reihe als Tabelle.
 *
 * Diese Folge hat keine Periode: sie steigt, fällt, springt zurück. Sie ist
 * auch nicht zufällig — Zufall erzeugt Klumpen, und zwei Bilder auf derselben
 * Höhe nebeneinander sehen aus wie ein Fehler. Von Hand gesetzt, mit dem
 * einzigen Kriterium, dass keine zwei Nachbarn dieselbe Höhe haben und der
 * grösste Sprung in der Mitte liegt.
 */
const VERSATZ = [0, 5.2, -2.4, 7.6, 1.2, -3.6, 4.4]

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

        const blaetter = gsap.utils.toArray<HTMLElement>('.galerie__blatt', s)
        const MAX = 24
        /* Ein Setzer je Eigenschaft und Element, einmal angelegt. `gsap.set`
           in einer Schleife pro Bild wäre bei sieben Bildern und sechzig
           Bildern je Sekunde 420 Aufrufe, die jedes Mal den Zielwert neu
           auflösen. Ein `quickSetter` löst ihn einmal auf. */
        const setzer = blaetter.map((el) => gsap.quickSetter(el, 'css'))

        /**
         * ═══ Die Maße werden EINMAL gemessen, nicht in jedem Bild ═══
         *
         * Die erste Fassung las in jedem Bild `getBoundingClientRect()` für
         * jedes der sieben Bilder — und schrieb unmittelbar davor ein
         * `transform`. Jeder dieser Aufrufe erzwingt damit einen neuen
         * Layoutdurchgang.
         *
         * Gemessen über einen Durchlauf der ganzen Seite, Handy 4x gebremst:
         *
         *   ohne Drehung   0 lange Aufgaben,  1,0 % der Frames über 32 ms
         *   mit            2 lange Aufgaben,  9,3 % der Frames über 32 ms
         *
         * Neunmal so viele zähe Bilder für etwas, das man auch ohne Layout
         * ausrechnen kann: die Bilder stehen in einer Reihe, und ihre Abstände
         * zueinander ändern sich beim Fahren NICHT. Es genügt, die Ruhelage
         * einmal zu messen und je Bild nur den Stand der Bahn dazuzurechnen —
         * ein einziges Rechteck je Frame statt sieben.
         */
        /* Gemessen wird der Abstand jedes Bildes zur LINKEN KANTE DER BAHN.
           Beide Rechtecke tragen dieselbe Verschiebung, also fällt sie in der
           Differenz heraus — der Wert ist verschiebungsfrei und gilt, solange
           sich die Breiten nicht ändern.

           Ein erster Versuch hat die Verschiebung zusätzlich addiert und beim
           Zeichnen wieder abgezogen. Das war doppelt gemoppelt und hat sich
           exakt aufgehoben: die Winkel standen still, während die Bahn fuhr.
           `getBoundingClientRect` enthält Transformationen bereits — wer sie
           noch einmal verrechnet, rechnet sie weg. */
        let ruhe: number[] = []
        const vermessen = () => {
          const bahn = s.getBoundingClientRect()
          ruhe = blaetter.map((el) => {
            const r = el.getBoundingClientRect()
            return r.left + r.width / 2 - bahn.left
          })
        }

        const drehen = () => {
          if (!ruhe.length) return
          /* EIN Rechteck je Frame statt sieben: die Bahn bewegt sich, die
             Bilder darin nicht relativ zu ihr. */
          const bahnLinks = s.getBoundingClientRect().left
          const mitte = window.innerWidth / 2
          for (let i = 0; i < blaetter.length; i++) {
            const x = bahnLinks + ruhe[i]!
            /* −1 links vom Fenster, 0 in der Mitte, +1 rechts. */
            const t = gsap.utils.clamp(-1, 1, (x - mitte) / mitte)
            setzer[i]!({
              rotationY: -t * MAX,
              /* Was sich wegdreht, rückt nach hinten und wird kleiner. Ohne das
                 liest die Drehung als Verzerrung statt als Tiefe. */
              z: -Math.abs(t) * 90,
              scale: 1 - Math.abs(t) * 0.05,
            })
          }
        }

        /**
         * ═══ Der Takt kommt vom BILD, nicht vom Auslöser ═══
         *
         * Zuerst hing die Drehung an `onUpdate` der gescrubbten Fahrt. Gemessen
         * lief sie damit auf 1100 px Scrollweg genau EINMAL — die Bahn fuhr,
         * die Winkel standen. `onUpdate` einer gescrubbten Zeitleiste meldet
         * den Fortschritt der Zeitleiste; die Bahn wird aber mit Nachlauf
         * bewegt, und die Position der Bilder im Fenster ändert sich noch,
         * wenn der Fortschritt längst steht.
         *
         * Der Winkel hängt hier nicht vom Fortschritt ab, sondern von der
         * POSITION IM FENSTER. Also wird er dort gerechnet, wo Positionen
         * entstehen: einmal je Bild. GSAP hat dafür einen eigenen Takt, und
         * er teilt sich die Uhr mit Lenis — zwei Schleifen nebeneinander
         * laufen auseinander.
         *
         * Der Beobachter hält ihn an, sobald die Galerie aus dem Bild ist. Ein
         * Rechteck je Bild und Frame ist billig; sieben Rechtecke für etwas,
         * das niemand sieht, sind es nicht.
         */
        let laeuft = false
        const anwerfen = () => {
          if (laeuft) return
          laeuft = true
          gsap.ticker.add(drehen)
        }
        const anhalten = () => {
          if (!laeuft) return
          laeuft = false
          gsap.ticker.remove(drehen)
        }
        const beob = new IntersectionObserver(
          ([e]) => (e?.isIntersecting ? anwerfen() : anhalten()),
          { rootMargin: '20% 0px' },
        )
        beob.observe(b)
        ScrollTrigger.addEventListener('refreshInit', vermessen)
        vermessen()
        drehen()

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
            /* KEIN zusätzlicher Nachlauf auf der Hauptfahrt. Sie ist das
               Einzige, was in dieser Sektion auf den Finger antwortet — jede
               Millisekunde Verzögerung darauf ist eine Millisekunde, in der
               die Seite tot wirkt. Die Weichheit kommt von Lenis. */
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            /* Die Drehung hängt an DIESEM Auslöser und nicht an einem eigenen.
               Ein zweiter Auslöser auf derselben angehefteten Sektion bekommt
               einen verschobenen Bereich — gemessen blieben die Winkel dann
               stehen, während die Bahn schon fuhr. Ein Auslöser, eine Fahrt,
               eine Rechnung. */
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
            /* Die Tiefenebene DARF nachlaufen — genau daraus entsteht der
               Abstand zur Hauptbahn. Sie ist die einzige Stelle, an der der
               Nachlauf die Aussage ist und nicht die Verzögerung. */
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })



        return () => {
          zug.scrollTrigger?.kill()
          zug.kill()
          tiefe.scrollTrigger?.kill()
          tiefe.kill()
          anhalten()
          beob.disconnect()
          ScrollTrigger.removeEventListener('refreshInit', vermessen)
          gsap.set([s, ...nah, ...blaetter], { clearProps: 'transform' })
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
              style={{ '--versatz': `${VERSATZ[i % VERSATZ.length]}rem` } as CSSProperties}
            >
              <figure className="galerie__blatt">
                {/* Die Nummer ist keine Verzierung. Diese sieben Bilder sind
                    eine FOLGE — vom Blech über die Glut auf den Tisch — und
                    eine Folge, die man nicht zählen kann, liest sich als
                    Haufen. Numeriert wird, was eine Reihenfolge hat; alles
                    andere bekommt keine Nummer. */}
                <span className="galerie__nr" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
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
