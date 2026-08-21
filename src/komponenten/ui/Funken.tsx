import { useEffect, useRef } from 'react'

/**
 * Ofenfunken — Asche, die aus der Glut aufspringt.
 *
 * ═══ Warum das nicht derselbe Code wie der Dampf ist ═══
 *
 * Dampf und Funken sehen aus wie zwei Einstellungen desselben Systems. Sie
 * sind es nicht, und der Unterschied ist Physik, nicht Geschmack:
 *
 *   DAMPF    dehnt sich aus, wird grösser und blasser, steigt gleichmässig.
 *            Er ist ein Gas. Seine Bahn ist glatt.
 *   FUNKEN   schrumpfen, werden dunkler und fallen am Ende. Sie sind Materie
 *            mit Schwung: erst schiesst sie hoch, dann bremst die Schwerkraft,
 *            dann sinkt sie. Ihre Bahn ist eine Wurfparabel.
 *
 * Ein Funke, der wie Dampf gleichmässig nach oben zieht, liest sofort als
 * Fehler — man weiss nicht warum, aber es stimmt nicht. Deshalb steht hier
 * eine Beschleunigung und im Dampf keine.
 *
 * ═══ Und warum sie flackern ═══
 *
 * Eine glühende Asche dreht sich im Aufsteigen und zeigt mal die heisse
 * Fläche, mal die Kante. Das ist der Grund, dass echte Funken blinken. Die
 * Deckkraft schwingt deshalb mit einer eigenen, für jeden Funken anderen
 * Frequenz — ohne das sieht ein Funkenfeld aus wie ein Sternenhimmel.
 *
 * ═══ Kosten ═══
 *
 * Ein vorgemaltes Sprite, rund 40 Zeichnungen je Bild, eine Leinwand. Der
 * Beobachter hält sie an, sobald sie aus dem Bild ist — ein Partikelfeld, das
 * unsichtbar weiterrechnet, ist der teuerste Weg, einen Akku zu leeren.
 */

type Funke = {
  x: number
  y: number
  r: number
  leben: number
  dauer: number
  /** Anfangsgeschwindigkeit nach oben, in Anteilen der Höhe je Sekunde. */
  stoss: number
  seit: number
  /** Eigene Flackerfrequenz, damit das Feld nicht im Gleichtakt blinkt. */
  takt: number
  phase: number
  hitze: number
}

type Props = {
  klasse?: string
  /** Wie viele Funken gleichzeitig unterwegs sind. */
  menge?: number
}

const SPRITE = 32

export default function Funken({ klasse, menge = 40 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d', { alpha: true })
    if (!ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    /* Der Funke einmal vormalen. Ein Verlauf je Partikel und Bild wäre bei
       40 Partikeln und 60 Bildern 2400 Verläufe je Sekunde. */
    const korn = document.createElement('canvas')
    korn.width = korn.height = SPRITE
    const kctx = korn.getContext('2d')
    if (!kctx) return
    const v = kctx.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2)
    /* Weisser Kern, oranger Saum, dunkelroter Auslauf — die Farbfolge einer
       abkühlenden Asche. Reines Orange ohne hellen Kern liest als Konfetti. */
    v.addColorStop(0, 'oklch(97% 0.06 80 / 0.95)')
    v.addColorStop(0.28, 'oklch(80% 0.19 55 / 0.75)')
    v.addColorStop(0.62, 'oklch(62% 0.20 42 / 0.30)')
    v.addColorStop(1, 'oklch(50% 0.16 38 / 0)')
    kctx.fillStyle = v
    kctx.fillRect(0, 0, SPRITE, SPRITE)

    let b = 0
    let h = 0
    let dpr = 1
    const funken: Funke[] = []

    const messen = () => {
      const r = c.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      b = Math.max(1, Math.round(r.width))
      h = Math.max(1, Math.round(r.height))
      c.width = Math.round(b * dpr)
      c.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const saen = (f: Funke, frisch: boolean) => {
      /* Sie starten am unteren Rand, gestreut über die mittlere Hälfte — dort
         liegt in jeder Aufnahme die Glut. */
      f.x = b * (0.25 + Math.random() * 0.5)
      f.y = h * (0.94 + Math.random() * 0.1)
      f.r = 1.4 + Math.random() * 3.2
      f.dauer = 1.6 + Math.random() * 1.9
      /* Beim ersten Bild über die Lebensdauer verteilt, sonst springt das ganze
         Feld gleichzeitig los. */
      f.leben = frisch ? Math.random() * f.dauer : 0
      f.stoss = 0.55 + Math.random() * 0.5
      f.seit = (Math.random() - 0.5) * 0.22
      f.takt = 5 + Math.random() * 7
      f.phase = Math.random() * Math.PI * 2
      f.hitze = 0.5 + Math.random() * 0.5
    }

    for (let i = 0; i < menge; i++) {
      const f = { x: 0, y: 0, r: 0, leben: 0, dauer: 0, stoss: 0, seit: 0, takt: 0, phase: 0, hitze: 0 }
      saen(f, true)
      funken.push(f)
    }

    let id = 0
    let vorher = 0
    let laeuft = false

    const bild = (jetzt: number) => {
      const dt = vorher ? Math.min((jetzt - vorher) / 1000, 0.05) : 0.016
      vorher = jetzt
      ctx.clearRect(0, 0, b, h)
      /* Additiv: zwei Funken übereinander werden heller, nicht undurchsichtiger.
         Das ist der Unterschied zwischen Glut und Aufklebern. */
      ctx.globalCompositeOperation = 'lighter'

      for (const f of funken) {
        f.leben += dt
        if (f.leben >= f.dauer) saen(f, false)
        const t = f.leben / f.dauer

        /* Wurfparabel: der Stoss nach oben, gegen eine Beschleunigung nach
           unten. Bei t = 1 ist der Funke wieder etwa auf Starthöhe — deshalb
           sieht man sie am Ende sinken statt verschwinden. */
        const steig = f.stoss * t - 0.62 * t * t
        const y = f.y - steig * h
        const x = f.x + f.seit * b * t + Math.sin(f.phase + t * 4) * b * 0.012

        /* Flackern mal Ausblenden. Der zweite Faktor sorgt dafür, dass kein
           Funke mitten im Bild hart verschwindet. */
        const flackern = 0.55 + 0.45 * Math.sin(f.phase + f.leben * f.takt)
        const aus = Math.min(1, t * 6) * Math.max(0, 1 - t * t)
        const a = flackern * aus * f.hitze
        if (a <= 0.01) continue

        /* Funken SCHRUMPFEN — sie kühlen ab und verglühen. Dampf wächst. */
        const gr = f.r * (1.25 - 0.5 * t)
        ctx.globalAlpha = a
        ctx.drawImage(korn, x - gr, y - gr, gr * 2, gr * 2)
      }

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'
      id = requestAnimationFrame(bild)
    }

    const anhalten = () => {
      if (!laeuft) return
      laeuft = false
      cancelAnimationFrame(id)
      vorher = 0
    }
    const anwerfen = () => {
      if (laeuft) return
      laeuft = true
      id = requestAnimationFrame(bild)
    }

    messen()
    const beob = new IntersectionObserver(([e]) => (e?.isIntersecting ? anwerfen() : anhalten()), {
      threshold: 0,
    })
    beob.observe(c)
    const groesse = new ResizeObserver(messen)
    groesse.observe(c)

    return () => {
      anhalten()
      beob.disconnect()
      groesse.disconnect()
    }
  }, [menge])

  return <canvas ref={ref} className={`funken${klasse ? ' ' + klasse : ''}`} aria-hidden="true" />
}
