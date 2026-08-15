/**
 * Der Savor-Rhythmus: Bilder ziehen beim Scrollen ungleich schnell hoch.
 *
 * ═══ Warum das der billigste Effekt der ganzen Seite ist ═══
 *
 * Die Bilder liegen versetzt und überlappend, jedes anders breit, keins mittig.
 * Beim Scrollen bewegt sich eins etwas langsamer als der Scroll, das nächste
 * etwas schneller. Daraus entsteht Bewegung, ohne dass sich ein einziges
 * Element dreht oder skaliert — und ohne einen Rahmen, einen Schatten oder
 * einen Kasten.
 *
 * ═══ Zwei Entscheidungen ═══
 *
 * 1. GSAP wird NACHGELADEN, nicht mitgeliefert. Die Bibliothek wiegt mehr als
 *    das gesamte übrige Bündel; sie gehört nicht in den ersten Ladevorgang
 *    einer Seite, deren wichtigste Zeile eine Telefonnummer ist.
 *
 * 2. `will-change` wird erst gesetzt, wenn das Element in Sicht kommt, und
 *    wieder abgeräumt, wenn es raus ist. Dauerhaft gesetzt reserviert es auf
 *    dem Handy für jedes Bild eine eigene Ebene — auch für die zwölf, die
 *    gerade niemand sieht.
 */

import { useEffect, useRef } from 'react'

type Werkzeug = {
  gsap: typeof import('gsap').gsap
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
}

let lader: Promise<Werkzeug | null> | null = null

/**
 * GSAP holen — genau einmal, und mit Auffangnetz.
 *
 * ═══ Warum EIN geteilter Ladevorgang ═══
 *
 * Jedes versetzte Bild rief vorher seinen eigenen `import()` auf. Vier Bilder,
 * unter React StrictMode acht Aufrufe — und bei einer langsamen Verbindung acht
 * Fehlschläge statt einem. Der Prüfer hat genau das gemessen.
 *
 * ═══ Warum `catch` und nicht durchreichen ═══
 *
 * Schlägt der Nachladevorgang fehl (Funkloch im Bus, blockierendes Netz), ist
 * die richtige Antwort: keine Parallaxe. Nicht: eine unbehandelte Ablehnung in
 * der Konsole und ein Bild, das nie erscheint. Die Seite muss ohne diese
 * Bibliothek vollständig lesbar sein — sie ist Schmuck, nicht Inhalt.
 */
const werkzeugHolen = (): Promise<Werkzeug | null> => {
  lader ??= Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
    .then(([{ gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger)
      return { gsap, ScrollTrigger }
    })
    .catch(() => null)
  return lader
}

/**
 * @param tempo  Wie weit das Element gegen den Scroll versetzt wird, in Anteilen
 *               der Fensterhöhe über die ganze Durchfahrt. Negativ = zieht
 *               langsamer nach (bleibt zurück), positiv = eilt vor.
 */
export function useVersatz<T extends HTMLElement>(tempo: number) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let tot = false
    let abraeumen: (() => void) | undefined

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      const { gsap } = werkzeug

      const tween = gsap.fromTo(
        el,
        { y: 0 },
        {
          /* Als Funktion, damit bei Drehung des Geräts neu gerechnet wird
             statt einen Wert von vorhin weiterzuverwenden. */
          y: () => tempo * window.innerHeight,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
            onToggle: ({ isActive }) => {
              el.style.willChange = isActive ? 'transform' : ''
            },
          },
        },
      )

      abraeumen = () => {
        tween.scrollTrigger?.kill()
        tween.kill()
        el.style.willChange = ''
        el.style.transform = ''
      }
    })

    return () => {
      tot = true
      abraeumen?.()
    }
  }, [tempo])

  return ref
}
