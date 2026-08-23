import { useEffect, useRef } from 'react'

/**
 * Käse, der tropft.
 *
 * ═══ Warum ein Tropfen kein fallender Punkt ist ═══
 *
 * Karol: „und dann auch der Käse tropft. Es ist heiss, es dampft."
 *
 * Der naheliegende Bau wäre ein Feld kleiner Kreise, das nach unten fällt.
 * Das sieht aus wie Regen. Was geschmolzenen Käse von Regen unterscheidet,
 * ist die ZÄHIGKEIT, und die zeigt sich in drei Schritten, die jeder Tropfen
 * einzeln durchläuft:
 *
 *   HÄNGEN     Er wächst an Ort und Stelle. Erst eine Beule, dann ein Zapfen.
 *              Ein Tropfen, der sofort fällt, ist Wasser.
 *   EINSCHNÜREN Kurz vor dem Lösen wird der Hals dünn, während die Kugel unten
 *              schon voll ist. Das ist der Moment, an dem das Auge „zäh" liest.
 *   FALLEN     Erst dann löst er sich, mit einem Faden hinterher, der noch
 *              einen Augenblick nachhängt und sich dann zurückzieht.
 *
 * Ohne Schritt zwei fehlt alles. Mit ihm braucht es keine zwanzig Tropfen —
 * sechs reichen, weil jeder einzelne etwas erzählt.
 *
 * ═══ Warum sie beim Riss VERSCHWINDEN ═══
 *
 * Sie hingen zuerst durchgehend, auch während das Gebäck auseinanderging.
 * Sichtbar war das als fünf gelbe Mandeln, die mitten im leeren Raum zwischen
 * den Hälften schwebten — Karol: „das der Käse schmelzen sieht auf jeden Fall
 * so anders, wie keine Ahnung was."
 *
 * Er hatte recht, und der Grund ist einfach: ein Tropfen braucht etwas, von
 * dem er tropft. Sobald die Hälften auseinander sind, ist unter der Mitte
 * nichts mehr. Die Tropfen laufen deshalb mit der Spanne aus — erst tropft es,
 * dann reisst es. Zwei Vorgänge nacheinander, nie beide zugleich.
 *
 * ═══ Was er kostet ═══
 *
 * Keine Sprites, keine Weichzeichner: je Tropfen zwei gefüllte Pfade. Am
 * Handy läuft er gar nicht (siehe Kaeseschiff.tsx) — dort ist der Platz unter
 * dem Schiff ohnehin zu knapp, als dass ein Tropfen Weg hätte.
 */

type Tropfen = {
  /** Ansatzpunkt, 0…1 über die Breite. Nur die Mitte — dort liegt der Käse. */
  x: number
  /** Wie lange dieser Tropfen schon lebt, in Sekunden. */
  leben: number
  /** Wie lange er hängt, bevor er sich löst. */
  reift: number
  /** Grösse der Kugel, in Anteilen der Leinwandbreite. */
  gross: number
  /** Fallgeschwindigkeit in Anteilen der Leinwandhöhe je Sekunde. */
  tempo: number
  /** Wartezeit bis zum nächsten Anlauf. */
  pause: number
}

type Props = {
  klasse?: string
  menge?: number
}

/** Wie weit ein Tropfen fällt, bevor er verschwindet. Anteil der Leinwandhöhe. */
const WEG = 0.86

function neu(vorlauf: boolean): Tropfen {
  return {
    /* 0,22 bis 0,78: der Rand des Gebäcks ist Teig, nur die Mitte ist Käse.
       Ein Tropfen, der aus der Kruste kommt, verrät den Trick sofort. */
    x: 0.22 + Math.random() * 0.56,
    leben: 0,
    reift: 0.7 + Math.random() * 1.3,
    /* Gemessen: mit 0,012…0,028 kamen höchstens 178 von 39 000 Pixeln zusammen
       — 0,45 % der Fläche, also praktisch unsichtbar. Karol wollte sehen, dass
       der Käse tropft, nicht ahnen. */
    gross: 0.013 + Math.random() * 0.015,
    tempo: 0.22 + Math.random() * 0.2,
    /* Beim ersten Aufbau streuen, sonst lösen sich alle sechs im Gleichtakt. */
    pause: vorlauf ? Math.random() * 2.6 : Math.random() * 1.3,
  }
}

export default function Kaesetropfen({ klasse, menge = 9 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d', { alpha: true })
    if (!ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const tropfen = Array.from({ length: menge }, () => neu(true))

    let b = 0
    let h = 0
    const messen = () => {
      /**
       * ═══ `offsetWidth`, NICHT `getBoundingClientRect` ═══
       *
       * Die Leinwand liegt im Käseschiff, und das Schiff wird über die ganze
       * Reise von 0,26 auf 1,0 skaliert. `getBoundingClientRect` liefert die
       * TRANSFORMIERTE Grösse — beim Einhängen also 158 px statt 608. Die
       * Leinwand bekam damit ihren Speicher für die kleinste Stufe und wurde
       * bis zum Riss auf das Vierfache gestreckt.
       *
       * `offsetWidth` gibt die Layoutgrösse, auf die sich die Transformation
       * erst anwendet. Die Leinwand ist damit immer für die VOLLE Grösse
       * gerechnet; auf den kleinen Stufen ist sie überabgetastet, und das
       * kostet nichts, weil der Compositor sie ohnehin skaliert.
       *
       * Ein ResizeObserver hätte das nicht gerettet: er meldet Layoutgrössen,
       * und eine Transformation ändert die nicht.
       */
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      b = Math.max(1, c.offsetWidth)
      h = Math.max(1, c.offsetHeight)
      c.width = Math.round(b * dpr)
      c.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    let id = 0
    let vorher = 0

    const bild = (jetzt: number) => {
      const dt = vorher === 0 ? 0.016 : Math.min(0.05, (jetzt - vorher) / 1000)
      vorher = jetzt
      ctx.clearRect(0, 0, b, h)

      /* Dieselbe Spanne, die auch die Hälften und die Fäden führen — gesetzt
         vom Käseschiff, gelesen aus dem berechneten Stil. Bei voller Trennung
         tropft nichts mehr. */
      const roh = getComputedStyle(c).getPropertyValue('--spanne').trim()
      const uebrig = 1 - Math.max(0, Math.min(1, Number(roh) || 0))
      if (uebrig <= 0.02) {
        id = requestAnimationFrame(bild)
        return
      }

      /* Warmes Cremegelb — derselbe Ton wie die Käsefäden. Geschmolzener
         Hirtenkäse ist nie reinweiss; ein weisser Tropfen liest als Milch. */
      ctx.fillStyle = `oklch(92% 0.07 90 / ${(0.95 * uebrig).toFixed(3)})`

      for (let i = 0; i < tropfen.length; i++) {
        const t = tropfen[i]!
        t.leben += dt

        if (t.leben < t.pause) continue
        const alter = t.leben - t.pause
        const x = b * t.x
        const kugel = b * t.gross

        if (alter < t.reift) {
          /* ── Hängen und einschnüren ────────────────────────────────────
             `w` läuft von 0 auf 1. Der Zapfen wächst linear, der Hals wird
             erst am Ende dünn — deshalb die vierte Potenz: bis 0,7 passiert
             am Hals fast nichts, danach schnürt er schnell ein. */
          const w = alter / t.reift
          const laenge = kugel * (0.4 + w * 2.6)
          const hals = kugel * 0.42 * (1 - w ** 4 * 0.82)
          const yk = laenge

          ctx.beginPath()
          ctx.moveTo(x - hals, 0)
          ctx.quadraticCurveTo(x - hals * 0.7, yk * 0.6, x - kugel * (0.4 + w * 0.6), yk)
          ctx.lineTo(x + kugel * (0.4 + w * 0.6), yk)
          ctx.quadraticCurveTo(x + hals * 0.7, yk * 0.6, x + hals, 0)
          ctx.closePath()
          ctx.fill()

          ctx.beginPath()
          ctx.arc(x, yk, kugel * (0.4 + w * 0.6), 0, Math.PI * 2)
          ctx.fill()
          continue
        }

        /* ── Fallen ────────────────────────────────────────────────────────
           Der Faden hinterher zieht sich in den ersten Zehnteln zurück; danach
           fällt nur noch die Kugel. Ohne diesen Rest sähe das Lösen aus wie
           ein Schnitt. */
        const fall = alter - t.reift
        const y = kugel * 3 + h * t.tempo * fall * (1 + fall * 0.9)
        const rest = Math.max(0, 1 - fall * 3.5)
        const weg = y / (h * WEG)
        if (weg >= 1) {
          tropfen[i] = neu(false)
          continue
        }

        ctx.globalAlpha = Math.min(1, (1 - weg) * 2.4)
        if (rest > 0.02) {
          ctx.beginPath()
          ctx.moveTo(x - kugel * 0.16 * rest, 0)
          ctx.lineTo(x + kugel * 0.16 * rest, 0)
          ctx.lineTo(x, y * 0.55)
          ctx.closePath()
          ctx.fill()
        }
        /**
         * Ein fallender Tropfen ist unten RUND und oben spitz.
         *
         * Die erste Fassung zog zwei gleiche Kurven um eine Mitte — das ergibt
         * eine Form, die an beiden Enden spitz ist, und die liest sich als
         * Blatt oder Kern, nicht als Tropfen. Fünf davon im leeren Raum sahen
         * aus wie herabfallende Mandeln.
         *
         * Unten ein halber Kreis, oben eine Spitze: das ist die Form, an der
         * das Auge einen Tropfen erkennt, und sie kostet einen Bogen mehr.
         */
        ctx.beginPath()
        ctx.arc(x, y, kugel, 0, Math.PI)
        ctx.quadraticCurveTo(x - kugel * 0.8, y - kugel * 1.05, x, y - kugel * 2.1)
        ctx.quadraticCurveTo(x + kugel * 0.8, y - kugel * 1.05, x + kugel, y)
        ctx.closePath()
        ctx.fill()
        ctx.globalAlpha = 1
      }

      id = requestAnimationFrame(bild)
    }

    messen()
    id = requestAnimationFrame(bild)
    const groesse = new ResizeObserver(messen)
    groesse.observe(c)

    return () => {
      cancelAnimationFrame(id)
      groesse.disconnect()
    }
  }, [menge])

  return <canvas ref={ref} className={klasse} aria-hidden="true" />
}
