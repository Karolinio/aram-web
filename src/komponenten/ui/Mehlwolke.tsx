import { useEffect, useRef } from 'react'

/**
 * Ein Stoss Mehl — eine WOLKE, kein Staub.
 *
 * ═══ Warum das nicht `Mehlstaub` mit anderen Werten ist ═══
 *
 * `Mehlstaub` ist Raumluft: 54 Körner von 0,4 bis 1,7 px, bei 3 bis 10 Prozent
 * Deckung, über den ganzen Bildschirm verteilt, die langsam sinken. Das ist
 * Atmosphäre, und als Atmosphäre ist es richtig — man sieht es nicht, man
 * spürt es.
 *
 * Ein Stoss ist das Gegenteil: er hat einen ZEITPUNKT, einen URSPRUNG und eine
 * Richtung. Mehl, das auf ein Blech schlägt, springt seitwärts und aufwärts
 * weg, wird schnell langsamer, dehnt sich aus und fällt dann. Nichts davon
 * kann ein Feld gleichmässig sinkender Körner.
 *
 * Gemessen an der alten Fassung in der Reise: 122 leuchtende Pixel auf einer
 * Leinwand von 1440×900. Das sind 0,009 Prozent der Fläche — unsichtbar, und
 * zwar nicht knapp.
 *
 * ═══ Die Physik in zwei Zeilen ═══
 *
 * Auswärtsgeschwindigkeit mal Bremsung, plus Schwerkraft nach unten. Die
 * Bremsung ist der Grund, dass eine Wolke nach aussen hin STEHT statt
 * davonzufliegen — und das Stehenbleiben ist das, was man als Wolke erkennt.
 *
 * Die Korngrösse hängt an der Leinwandbreite, nicht an festen Pixeln. Ein
 * Radius von drei Pixeln ist auf einem Handy ein Korn und auf einem grossen
 * Bildschirm nichts.
 */

type Korn = {
  winkel: number
  tempo: number
  r: number
  leben: number
  dauer: number
  dreh: number
}

type Props = {
  klasse?: string
  /**
   * Ein ZÄHLER, kein Schalter. Jede Erhöhung löst einen neuen Stoss aus.
   *
   * Ein Wahrheitswert wäre die naheliegende Wahl und war die falsche: er muss
   * zum Auslösen umgeschaltet werden, und beim Zurückschalten passiert nichts.
   * Wer die Stelle zweimal passiert, sieht den Stoss also genau einmal — und
   * beim ersten Zurückscrollen gar nicht mehr. Gemessen: null Körner.
   *
   * Ein Zähler kennt diesen Zustand nicht. Er geht nur nach oben.
   */
  stoss?: number
  /** Wie viele Körner. Am Handy weniger. */
  menge?: number
}

const SPRITE = 64

export default function Mehlwolke({ klasse, stoss = 0, menge = 90 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  /* Die Schleife liest den Zähler in jedem Bild und sät neu, wenn er sich
     geändert hat. Ein Ref statt eines Zustands im Inneren: die Leinwand
     zeichnet ohnehin selbst, ein Neuzeichnen der Komponente je Stoss wäre
     Arbeit für nichts. */
  const neustart = useRef(stoss)
  neustart.current = stoss

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d', { alpha: true })
    if (!ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    /* Das Korn einmal vormalen: ein weicher heller Fleck. Ein harter Kreis
       liest als Konfetti, ein Verlauf als Puder. */
    const korn = document.createElement('canvas')
    korn.width = korn.height = SPRITE
    const kctx = korn.getContext('2d')
    if (!kctx) return
    const v = kctx.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2)
    v.addColorStop(0, 'oklch(99% 0.008 85 / 0.9)')
    v.addColorStop(0.4, 'oklch(97% 0.012 82 / 0.42)')
    v.addColorStop(1, 'oklch(96% 0.014 80 / 0)')
    kctx.fillStyle = v
    kctx.fillRect(0, 0, SPRITE, SPRITE)

    let b = 0
    let h = 0
    const koerner: Korn[] = []
    let gesehen = -1  // garantiert ungleich dem Startwert des Zählers

    const messen = () => {
      const r = c.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      b = Math.max(1, Math.round(r.width))
      h = Math.max(1, Math.round(r.height))
      c.width = Math.round(b * dpr)
      c.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const saen = () => {
      koerner.length = 0
      for (let i = 0; i < menge; i++) {
        /* Nach oben gewichtet: Mehl, das auf ein Blech schlägt, springt nicht
           nach unten. Der Bogen geht von −170° bis −10°. */
        const winkel = (-170 + Math.random() * 160) * (Math.PI / 180)
        koerner.push({
          winkel,
          tempo: (0.3 + Math.random() * 1.0) * b,
          r: b * (0.006 + Math.random() * 0.022),
          leben: Math.random() * 0.12,
          /* 1,4 bis 3,0 s. Gemessen war die erste Fassung (0,7 bis 1,6 s)
             nach 250 ms vorbei — Spitze 3,7 % Deckung, dann nichts. Eine
             Mehlwolke hängt in der Luft; sie ist kein Blitz. */
          dauer: 1.4 + Math.random() * 1.6,
          dreh: (Math.random() - 0.5) * 0.4,
        })
      }
    }

    let id = 0
    let vorher = 0
    let laeuft = false

    const bild = (jetzt: number) => {
      const dt = vorher ? Math.min((jetzt - vorher) / 1000, 0.05) : 0.016
      vorher = jetzt

      if (neustart.current !== gesehen) {
        gesehen = neustart.current
        saen()
      }

      ctx.clearRect(0, 0, b, h)
      for (const k of koerner) {
        k.leben += dt
        const t = k.leben / k.dauer
        if (t >= 1 || t < 0) continue
        /* Weg = Anfangstempo mal (1 − e^(−3t)) / 3 — das ist die gebremste
           Bewegung. Sie legt am Anfang viel zurück und kommt dann zum Stehen. */
        const weg = (k.tempo * (1 - Math.exp(-3 * t))) / 3
        const x = b / 2 + Math.cos(k.winkel + k.dreh * t) * weg
        const y = h * 0.86 + Math.sin(k.winkel) * weg + 0.55 * h * t * t
        /* Die Wolke DEHNT sich: jedes Korn wird grösser und blasser, wie ein
           Tropfen, der sich verteilt. */
        const gr = k.r * (1 + t * 2.6)
        /* Schnell da, langsam weg. Der Exponent 1,4 statt 2 hält die Wolke
           sichtbar, statt sie nach einem Fünftel ihrer Lebenszeit
           verschwinden zu lassen. */
        const a = Math.min(1, t * 10) * Math.pow(1 - t, 1.4) * 0.95
        if (a <= 0.01) continue
        ctx.globalAlpha = a
        ctx.drawImage(korn, x - gr, y - gr, gr * 2, gr * 2)
      }
      ctx.globalAlpha = 1
      id = requestAnimationFrame(bild)
    }

    const anwerfen = () => {
      if (laeuft) return
      laeuft = true
      id = requestAnimationFrame(bild)
    }
    const anhalten = () => {
      if (!laeuft) return
      laeuft = false
      cancelAnimationFrame(id)
      vorher = 0
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

  return <canvas ref={ref} className={`mehlwolke${klasse ? ' ' + klasse : ''}`} aria-hidden="true" />
}
