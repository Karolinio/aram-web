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

import { useEffect, useRef, useSyncExternalStore } from 'react'

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

type Flug = {
  /** Von wo nach wo, in Anteilen der Fensterhöhe. Negativ = weiter oben. */
  y: [von: number, bis: number]
  /** Seitlicher Drift, in Anteilen der Elementbreite. */
  x: [von: number, bis: number]
  /** Drehung in Grad. */
  dreh: [von: number, bis: number]
  /** Grösse. Ein Gegenstand, der näher kommt, wird grösser. */
  skala: [von: number, bis: number]
  /** Woran der Flug hängt. Steigt der Wähler ins Leere, hängt er am Element selbst. */
  buehne: string
  /** Ab welcher Fensterbreite überhaupt geflogen wird. */
  abBreite: number
}

/**
 * Gilt diese Medienabfrage gerade?
 *
 * `useSyncExternalStore` und nicht `useState` + Effekt: die Antwort steht schon
 * beim ersten Rendern fest, und beim Drehen des Geräts kommt sie ohne zweiten
 * Durchlauf nach.
 */
function useMedienabfrage(abfrage: string): boolean {
  return useSyncExternalStore(
    (melden) => {
      const mq = window.matchMedia(abfrage)
      mq.addEventListener('change', melden)
      return () => mq.removeEventListener('change', melden)
    },
    () => window.matchMedia(abfrage).matches,
    () => false,
  )
}

/**
 * Ein freigestelltes Gericht fliegt durch die Sektion.
 *
 * ═══ Der Unterschied zu `useVersatz` ═══
 *
 * `useVersatz` verschiebt ein Bild ein Stück gegen den Scroll — daraus entsteht
 * Rhythmus. Hier reist ein Gegenstand: von unten links nach oben, dabei dreht er
 * sich und wird grösser. Er ist kein Bild in einer Reihe, er ist ein Ding im
 * Raum, und deshalb ist er der einzige Teil dieser Seite mit einem Eigenschatten.
 *
 * ═══ Warum die Bühne und nicht das Element der Auslöser ist ═══
 *
 * Hinge der Trigger am Gericht selbst, würde sich sein eigener Bewegungsbereich
 * mit dem Fortschritt ändern — es zöge sich am eigenen Schopf. Der Fortschritt
 * muss von etwas Unbeweglichem kommen: der Sektion.
 *
 * Alles ist `transform` und sonst nichts. Keine Layout-Eigenschaft wird
 * angefasst, deshalb kostet die Reise auf dem Handy einen Compositor-Schritt
 * und keinen Umbruch.
 */
export function useFlug<T extends HTMLElement>(f: Flug) {
  const ref = useRef<T>(null)
  /**
   * Am Handy wird NICHT geflogen.
   *
   * Nicht aus Sparsamkeit, sondern weil es dort nicht funktioniert: auf 393 px
   * gibt es keine freie linke Bahn: gemessen flog das Gericht mitsamt seiner
   * Beschriftung über die Beschriftung des zweiten Schritts, und beides war
   * unlesbar. Ein Effekt, der Text verdeckt, ist kein Effekt, sondern ein Fehler.
   *
   * Zusammengelegt statt gestrichen: unterhalb dieser Breite steht das Gericht
   * als letzter Schritt der Folge — dieselbe Aussage, ohne die Reise.
   */
  const breitGenug = useMedienabfrage(`(min-width: ${f.abBreite}px)`)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!breitGenug) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const buehne = el.closest(f.buehne) ?? el
    let tot = false
    let abraeumen: (() => void) | undefined

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      const { gsap } = werkzeug

      const tween = gsap.fromTo(
        el,
        {
          y: () => f.y[0] * window.innerHeight,
          xPercent: f.x[0] * 100,
          rotate: f.dreh[0],
          scale: f.skala[0],
        },
        {
          y: () => f.y[1] * window.innerHeight,
          xPercent: f.x[1] * 100,
          rotate: f.dreh[1],
          scale: f.skala[1],
          ease: 'none',
          scrollTrigger: {
            trigger: buehne,
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
  }, [breitGenug, f.buehne, f.y, f.x, f.dreh, f.skala])

  return ref
}
