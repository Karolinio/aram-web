import { useEffect, useRef } from 'react'

import { werkzeugHolen } from '../bewegung.ts'
import Auftritt from './ui/Auftritt.tsx'
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
          /**
           * `transform` statt `fixed` — und das ist kein Feinschliff.
           *
           * Standardmässig setzt ScrollTrigger den gepinnten Kasten auf
           * `position: fixed` und wieder zurück. Jeder dieser Wechsel nimmt das
           * Element aus dem Fluss und stellt es zurück hinein: alles darunter
           * springt. Der Fabrikprüfer hat genau das gemessen — CLS 0,525 am
           * Handy, grösster Sprung 0,456 bei 2500 px auf der Karte, also
           * unmittelbar UNTER dem Schaustück.
           *
           * Mit `pinType: 'transform'` bleibt der Kasten im Fluss und wird nur
           * verschoben. Eine Verschiebung kann kein Layout ändern.
           *
           * Zusätzlicher Grund: diese Seite scrollt über Lenis. Ein
           * `position: fixed`-Pin und eine Bibliothek, die den Scroll selbst
           * fährt, treten sich gegenseitig auf die Füsse.
           */
          pinType: 'transform',
          /* `1` statt `true`: eine Sekunde Nachlauf. Starr gescrubbt ist
             technisch richtig und liest sich mechanisch. */
          scrub: 1,
          /* Ohne das springt der Pin bei schnellem Scrollen um einen Frame. */
          anticipatePin: 1,
          invalidateOnRefresh: true,
          /* `will-change` NUR solange der Abschnitt läuft. Gemessen: ohne diese
             Zeile kostete das Skalieren des grossen Ausschnitts am Handy eine
             lange Aufgabe von 56 ms und vier Frames über 33 ms. Dauerhaft
             gesetzt reserviert es dagegen für immer eine eigene Ebene — auf
             einer langen Seite ist das der Grund, warum Handys heiss werden. */
          onToggle: ({ isActive }) => {
            stueck.style.willChange = isActive ? 'transform' : ''
            fenster.style.willChange = isActive ? 'clip-path' : ''
          },
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
          { scale: 1.32, xPercent: 3, yPercent: 3 },
          /* Ruhelage ist 1,14, nicht 1 — siehe den Kommentar an
             `.schaustueck__stueck`: darunter kommt die Blechkante ins Bild. */
          { scale: 1.14, xPercent: 0, yPercent: 0, ease: 'none', duration: 1 },
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
        stueck.style.willChange = ''
        fenster.style.willChange = ''
        gsap.set([stueck, fenster, dampf, ...saetze], { clearProps: 'all' })
      }
    })

    return () => {
      tot = true
      abraeumen?.()
    }
  }, [])

  return (
    /* Der Glutgrund, und KEINE gepunktete Kante: der Farbwechsel ist die
       Kante. Eine Linie dazu wäre ein zweiter Schnitt an derselben Stelle. */
    <Sektion grund="nacht" klasse="schaustueck" beschriftetVon="schaustueck-titel">
      <div className="schaustueck__klebt" ref={wurzel}>
        <div className="schale schaustueck__innen">
          <header className="schaustueck__kopf">
            <Etikett>Ofenfrisch</Etikett>
            <h2 id="schaustueck-titel" className="lebt">
              <Auftritt>Ein Fata’er, aus der Nähe</Auftritt>
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
