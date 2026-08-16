import { useEffect, useRef } from 'react'

import { werkzeugHolen } from '../bewegung.ts'
import Dampf from './ui/Dampf.tsx'
import { Etikett, Sektion } from './ui/bausteine.tsx'

/**
 * Das Schaustück — die gepinnte Nahaufnahme.
 *
 * ═══ Warum es das gibt ═══
 *
 * Die Seite hatte kein Herzstück. Die Direktion sieht genau eins vor — „Die
 * Reise", ein Fata'er wandert durch Teig, Mehl, Belag und Ofen — und die ist
 * nicht gebaut, weil die vier Aufnahmen dafür nicht existieren. Alles andere
 * auf der Seite ist gut gemachtes Beiwerk. Eine Seite ohne Herzstück kann
 * sauber sein; auffallen kann sie nicht.
 *
 * ═══ Warum es KEIN Drehteller geworden ist ═══
 *
 * Der Plan war ein gepinnter Drehteller aus den vorhandenen Bildfolgen. Beim
 * Nachsehen der Dateien fiel es auf: die drei „Ansichten" des Käseschiffchens
 * sind KEINE Drehung. Es sind drei fast gleiche Draufsichten desselben
 * Gerichts, erzeugt in derselben Kameralage. Hart durchgeschaltet ergäbe das
 * ein Flackern, keine Drehung — `useBildfolge` schaltet auf dieser Seite
 * zwischen Beinahe-Duplikaten um.
 *
 * Das hat die Entscheidung umgedreht, und zwar zum Besseren: eine Bewegung,
 * die mit EINEM Bild auskommt, kann ihr ECHTES Foto nehmen. Und davon gibt es
 * genau eins — das Fata'er aus dem Scan ihrer alten Seite. Das Schaustück der
 * Seite zeigt damit ihr Essen und kein erzeugtes.
 *
 * ═══ Was stattdessen passiert ═══
 *
 * Das Gebäck liegt flach auf der Fläche, klein und weit weg, mit einem breiten
 * weichen Schatten darunter. Beim Scrollen RICHTET ES SICH AUF: es kippt aus
 * 64 Grad in die Senkrechte, kommt näher, dreht sich dabei leicht. Der Schatten
 * zieht sich zusammen und wird dichter — das ist der Teil, der das Anheben
 * verkauft. Ein Gegenstand, der grösser wird, während sein Schatten gleich
 * bleibt, wächst; einer, dessen Schatten mitschrumpft, hebt ab.
 *
 * Erst wenn es oben ist, beginnt der Dampf. Vorher wäre er die Aussage
 * „heiss" über etwas, das noch flach auf dem Brett liegt.
 *
 * ═══ Was die drei Sätze dürfen und was nicht ═══
 *
 * Sie stammen aus IHREN Angaben — der Speisekarte und ihrer eigenen Ladenfront
 * („mehr als 25 Jahre Erfahrung" steht dort in Grossbuchstaben). Keiner davon
 * ist eine Steigerung: nicht „seit 25 Jahren in Hardtberg", sondern genau der
 * Satz, den sie selbst an die Tür geschrieben haben.
 */

const SAETZE = [
  'Sesam und Schwarzkümmel, dicht gestreut.',
  'Drei Füllungen: Akkawi-Käse, Spinat, Rindhack.',
  'Mehr als 25 Jahre Erfahrung.',
]

export default function Schaustueck() {
  const wurzel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wurzel.current
    if (!el) return

    const buehne = el.closest('.schaustueck')
    const stueck = el.querySelector<HTMLElement>('.schaustueck__stueck')
    const fenster = el.querySelector<HTMLElement>('.schaustueck__buehne')
    const dampf = el.querySelector<HTMLElement>('.schaustueck__dampf')
    const saetze = [...el.querySelectorAll<HTMLElement>('.schaustueck__satz')]
    if (!buehne || !stueck || !fenster || !dampf) return

    /**
     * Bei reduzierter Bewegung KEIN Pin und KEIN Scrub.
     *
     * Das ist nicht dasselbe wie „kürzere Dauer": ein gepinnter Abschnitt
     * entkoppelt Scrollweg und Seiteninhalt, und genau das ist für jemanden
     * mit Bewegungsempfindlichkeit das Unangenehme. Gezeigt wird deshalb der
     * ZUSTAND AM ENDE — aufgerichtet, alle drei Sätze da.
     */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      stueck.style.transform = 'none'
      fenster.style.clipPath = 'none'
      dampf.style.opacity = '1'
      saetze.forEach((s) => {
        s.style.opacity = '1'
        s.style.transform = 'none'
      })
      return
    }

    let tot = false
    let abraeumen: (() => void) | undefined

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      const { gsap } = werkzeug

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: buehne,
          start: 'top top',
          /* Der Weg ist an die Fensterhöhe gebunden und wird bei jedem
             `refresh` neu gerechnet — sonst endet der Pin nach dem Einklappen
             der Adressleiste am Handy an der falschen Stelle. */
          /**
           * Am Handy KÜRZER, aber nicht anders.
           *
           * Der Auftrag deckelt die Seite bei zehn Bildschirmhöhen, und ein
           * gepinnter Abschnitt kostet seinen Scrollweg zusätzlich zu seiner
           * Höhe. 0,95 statt 1,35 Fensterhöhen spart knapp eine halbe — und
           * zusammengelegt wird der Weg, nicht die Bewegung: es passiert
           * dasselbe, nur auf kürzerer Strecke.
           */
          end: () =>
            '+=' + window.innerHeight * (window.matchMedia('(min-width: 1000px)').matches ? 1.35 : 0.95),
          pin: '.schaustueck__klebt',
          /* `1` statt `true`: eine Sekunde Nachlauf. Starr gescrubbt ist
             technisch richtig und liest sich mechanisch. */
          scrub: 1,
          /* Ohne das springt der Pin bei schnellem Scrollen um einen Frame. */
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      /* Alles hier ist `ease: 'none'`. Die Beschleunigung liefert der Daumen
         des Nutzers; eine Kurve obendrauf kämpft dagegen. */
      tl
        /**
         * Die Bühne wischt auf. Von rechts nach links, weil die Seite von
         * links gelesen wird — der Ausschnitt öffnet sich in die Leserichtung
         * hinein statt gegen sie.
         *
         * Das ist die erste Hälfte des Weges. Danach ist offen, und die
         * restliche Strecke gehört der Kamerafahrt und den Sätzen.
         */
        .fromTo(
          fenster,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', ease: 'none', duration: 0.45 },
          0,
        )
        /* Die Kamera schiebt hinein, während aufgewischt wird. Beides
           gleichzeitig, sonst wirkt das Aufwischen wie ein Vorhang vor einem
           Standbild. */
        .fromTo(
          stueck,
          { scale: 1.16, xPercent: 3, yPercent: 3 },
          { scale: 1, xPercent: 0, yPercent: 0, ease: 'none', duration: 1 },
          0,
        )
        /* Der Dampf kommt später und schnell: 0,35 bis 0,6 des Weges. Von
           Anfang an sichtbar wäre er die Behauptung „heiss" über etwas, das
           noch flach auf dem Brett liegt. */
        .fromTo(dampf, { opacity: 0 }, { opacity: 1, ease: 'none', duration: 0.3 }, 0.42)

      saetze.forEach((s, i) => {
        tl.fromTo(
          s,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, ease: 'none', duration: 0.18 },
          0.42 + i * 0.17,
        )
      })

      abraeumen = () => {
        tl.scrollTrigger?.kill()
        tl.kill()
        gsap.set([stueck, fenster, dampf, ...saetze], { clearProps: 'all' })
      }
    })

    return () => {
      tot = true
      abraeumen?.()
    }
  }, [])

  return (
    <Sektion grund="tief" kante klasse="schaustueck" beschriftetVon="schaustueck-titel">
      <div className="schaustueck__klebt" ref={wurzel}>
        <div className="schale schaustueck__innen">
          <header className="schaustueck__kopf">
            <Etikett>Ofenfrisch</Etikett>
            <h2 id="schaustueck-titel" className="lebt">
              Ein Fata’er, aus der Nähe
            </h2>
          </header>

          <div className="schaustueck__buehne">
            <Dampf klasse="schaustueck__dampf" ton="warm" />
            <img
              className="schaustueck__stueck"
              src="/bilder/echt/fatayer-frei.webp"
              srcSet="/bilder/echt/fatayer-frei-500.webp 500w, /bilder/echt/fatayer-frei.webp 1000w"
              sizes="(max-width: 700px) 78vw, 40vw"
              alt="Ein Fata’er von Aram, gewölbt und glänzend, dicht mit Sesam und Schwarzkümmel bestreut"
              width={1000}
              height={799}
              loading="lazy"
              decoding="async"
            />
          </div>

          <ul className="schaustueck__saetze">
            {SAETZE.map((s) => (
              <li key={s} className="schaustueck__satz">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Sektion>
  )
}
