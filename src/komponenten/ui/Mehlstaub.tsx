import { useEffect, useRef } from 'react'

/**
 * Mehlstaub in der Luft.
 *
 * ═══ Was sich gegenüber Fassung 1 umgekehrt hat ═══
 *
 * Fassung 1 stand auf sehr dunklem Grund und zeichnete HELLE Körner — leuchtender
 * Staub vor dem Ofenloch. Auf Creme ist das unsichtbar. Also zeichnet diese
 * Fassung DUNKLERE Körner: warmes Braun mit sehr wenig Deckkraft, wie Mehl, das
 * im Gegenlicht als Schatten durch den Raum fällt.
 *
 * Wer nur die Farbe getauscht und die Deckkraft gelassen hätte, bekäme einen
 * gesprenkelten Grund. Deshalb ist die Deckkraft hier eine Grössenordnung
 * kleiner als vorher.
 *
 * ═══ Was es kostet ═══
 *
 * Höchstens 54 Partikel, ein rAF, `position: fixed`. Es hält an, sobald das
 * Fenster in den Hintergrund geht — sonst rechnet ein Handy in der Tasche
 * weiter, und das merkt man am Akku. Bei `prefers-reduced-motion` wird gar nicht
 * erst gestartet, sondern ein stehendes Staubfeld gezeichnet: ersetzt, nicht
 * weggelassen.
 */

type Korn = { x: number; y: number; r: number; v: number; drift: number; deckung: number }

export default function Mehlstaub() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d', { alpha: true })
    if (!ctx) return

    const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let breite = 0
    let hoehe = 0
    let koerner: Korn[] = []
    let id = 0
    let laeuft = true

    const dichte = () =>
      Math.round(Math.min(54, (window.innerWidth * window.innerHeight) / 34000))

    const messen = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      breite = window.innerWidth
      hoehe = window.innerHeight
      c.width = breite * dpr
      c.height = hoehe * dpr
      c.style.width = breite + 'px'
      c.style.height = hoehe + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      koerner = Array.from({ length: dichte() }, () => ({
        x: Math.random() * breite,
        y: Math.random() * hoehe,
        r: 0.4 + Math.random() * 1.3,
        v: 0.06 + Math.random() * 0.22,
        /* Die Drift geht leicht nach rechts: das Licht kommt vom Fenster links
           oben, und die Luft zieht in dieselbe Richtung wie die Schatten. */
        drift: -0.02 + Math.random() * 0.14,
        deckung: 0.03 + Math.random() * 0.07,
      }))
    }

    const zeichnen = () => {
      ctx.clearRect(0, 0, breite, hoehe)
      for (const k of koerner) {
        ctx.beginPath()
        ctx.arc(k.x, k.y, k.r, 0, Math.PI * 2)
        /* Dunkles warmes Braun — dieselbe Familie wie --russ, nie Grau. */
        ctx.fillStyle = `oklch(38% 0.035 50 / ${k.deckung})`
        ctx.fill()
      }
    }

    const takt = () => {
      if (!laeuft) return
      for (const k of koerner) {
        k.y += k.v
        k.x += k.drift
        if (k.y > hoehe + 4) {
          k.y = -4
          k.x = Math.random() * breite
        }
        if (k.x < -4) k.x = breite + 4
        if (k.x > breite + 4) k.x = -4
      }
      zeichnen()
      id = requestAnimationFrame(takt)
    }

    messen()
    if (ruhig) zeichnen()
    else id = requestAnimationFrame(takt)

    const sichtbarkeit = () => {
      if (ruhig) return
      if (document.hidden) {
        laeuft = false
        cancelAnimationFrame(id)
      } else if (!laeuft) {
        laeuft = true
        id = requestAnimationFrame(takt)
      }
    }

    window.addEventListener('resize', messen)
    document.addEventListener('visibilitychange', sichtbarkeit)
    return () => {
      laeuft = false
      cancelAnimationFrame(id)
      window.removeEventListener('resize', messen)
      document.removeEventListener('visibilitychange', sichtbarkeit)
    }
  }, [])

  return <canvas ref={ref} className="mehlstaub" aria-hidden="true" />
}
