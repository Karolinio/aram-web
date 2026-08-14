import { useEffect, useRef } from 'react'

/**
 * Mehlstaub in der Luft.
 *
 * Sehr fein, langsam fallend, warm angeleuchtet — als stünde man vor dem Ofen, wenn
 * jemand Mehl auf den Schieber wirft. Canvas, keine GIFs, kein Bild: ein PNG mit
 * Staub darauf sieht immer aus wie ein PNG mit Staub darauf.
 *
 * ═══ Warum es das überhaupt gibt ═══
 *
 * Die Direktion sagt: eine Lichtquelle, alles von unten. Staub macht Licht sichtbar —
 * ohne etwas in der Luft ist ein Lichtstrahl unsichtbar. Der Staub ist also nicht
 * Deko, er ist der Beweis für das Licht.
 *
 * ═══ Was es kostet ═══
 *
 * 70 Partikel, ein rAF, `position: fixed`. Es hält an, sobald das Fenster im
 * Hintergrund ist (`visibilitychange`) — sonst rechnet ein Handy in der Tasche weiter
 * und das merkt man am Akku. Bei `prefers-reduced-motion` wird gar nicht erst
 * gestartet und ein stehendes Staubfeld gezeichnet.
 */

type Korn = { x: number; y: number; r: number; v: number; drift: number; hell: number }

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

    const dichte = () => Math.round(Math.min(70, (window.innerWidth * window.innerHeight) / 26000))

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
        r: 0.4 + Math.random() * 1.5,
        v: 0.08 + Math.random() * 0.28,
        drift: (Math.random() - 0.5) * 0.16,
        hell: 0.12 + Math.random() * 0.4,
      }))
    }

    const zeichnen = () => {
      ctx.clearRect(0, 0, breite, hoehe)
      for (const k of koerner) {
        /* Warmes Licht: je tiefer im Bild, desto glutiger — das Feuer ist unten. */
        const tiefe = k.y / hoehe
        ctx.beginPath()
        ctx.arc(k.x, k.y, k.r, 0, Math.PI * 2)
        ctx.fillStyle = `oklch(${82 - tiefe * 10}% ${0.02 + tiefe * 0.09} ${70 - tiefe * 20} / ${k.hell})`
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
    if (ruhig) {
      zeichnen() /* stehendes Staubfeld — ersetzt, nicht weggelassen */
    } else {
      id = requestAnimationFrame(takt)
    }

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
