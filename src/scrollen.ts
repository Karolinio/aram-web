/**
 * Weiches Scrollen — und die Brücke zu ScrollTrigger.
 *
 * ═══ Der Fehler, den diese Datei behebt ═══
 *
 * Vorher lief Lenis in einer eigenen `requestAnimationFrame`-Schleife und
 * ScrollTrigger in seiner. Zwei Uhren für dieselbe Bewegung driften
 * auseinander: eine gescrubbte Bahn hinkt dem Scroll um Frames hinterher, und
 * eine gepinnte Sektion zittert an der Kante. Das ist der Unterschied, den man
 * nicht benennen kann, aber sofort sieht — es fühlt sich billig an.
 *
 * Die Reparatur ist klein und muss vollständig sein:
 *
 *   1. Lenis meldet jeden Scrollschritt an ScrollTrigger (`ScrollTrigger.update`)
 *   2. Lenis läuft NICHT mehr selbst, sondern auf GSAPs Ticker
 *   3. `lagSmoothing(0)` — GSAP darf keine Frames zusammenfassen, sonst springt
 *      der Fortschritt bei einem Ruckler statt langsamer zu werden
 *
 * ═══ Warum ein Modul und kein Hook ═══
 *
 * Es darf genau EINE Instanz geben. Zwei Lenis-Instanzen kämpfen um dasselbe
 * Scrollrad, und das Ergebnis ist eine Seite, die sich beim Scrollen wehrt.
 */

type Aufräumen = () => void

let laeuft = false

/**
 * Die laufende Instanz — nur für die Sperre unten, für nichts sonst.
 *
 * Sie ist bewusst nicht exportiert: wer Lenis von aussen bedienen darf, baut
 * früher oder später eine zweite Stelle, die den Scroll anfasst, und dann
 * kämpfen zwei Regler um dasselbe Rad.
 */
let instanz: { stop: () => void; start: () => void } | null = null

/**
 * Den Scroll sperren, solange etwas darüber liegt.
 *
 * ═══ Warum das zwei Dinge tun muss ═══
 *
 * Hinter einem geöffneten Menü darf die Seite nicht mitscrollen. Nur
 * `overflow: hidden` zu setzen genügt hier NICHT: Lenis bewegt die Seite mit
 * eigener Mechanik weiter und ignoriert das. Nur Lenis anzuhalten genügt
 * ebenfalls nicht: bei reduzierter Bewegung oder ausgefallenem Nachladen läuft
 * Lenis gar nicht, und dann scrollt der Browser wie immer.
 *
 * Also beides — und `overflow` am `<html>`, nicht am `<body>`: am Body
 * springt iOS beim Schliessen an den Seitenanfang zurück.
 */
export function scrollenSperren(sperren: boolean): void {
  if (sperren) instanz?.stop()
  else instanz?.start()
  document.documentElement.style.overflow = sperren ? 'hidden' : ''
}

export async function scrollenStarten(): Promise<Aufräumen | null> {
  if (laeuft) return null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  laeuft = true

  try {
    const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
      import('lenis'),
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ])
    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })

    /* Ohne diese Zeile misst ScrollTrigger die alte Position weiter, während
       Lenis die Seite schon bewegt hat. */
    lenis.on('scroll', ScrollTrigger.update)

    const takt = (zeit: number) => lenis.raf(zeit * 1000)
    gsap.ticker.add(takt)
    gsap.ticker.lagSmoothing(0)
    instanz = lenis

    return () => {
      gsap.ticker.remove(takt)
      lenis.destroy()
      instanz = null
      laeuft = false
    }
  } catch {
    /* Funkloch oder blockiertes Netz: der Browser scrollt eben selbst. Weiches
       Scrollen ist Komfort, nicht Inhalt. */
    laeuft = false
    return null
  }
}
