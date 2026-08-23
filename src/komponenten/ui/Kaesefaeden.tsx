import { useEffect, useRef } from 'react'

/**
 * Käsefäden — was beim Auseinanderziehen zwischen den Hälften stehen bleibt.
 *
 * ═══ Warum das den Unterschied macht ═══
 *
 * Zwei Bildhälften, die auseinandergehen, sind eine Bildbearbeitung. Was daraus
 * ein Abreissen macht, ist der WIDERSTAND: etwas hält noch, wird dünner, hängt
 * durch und reisst dann. Ohne diesen Widerstand sieht jede Trennung aus, als
 * hätte jemand zwei Ebenen verschoben — und genau das war der Einwand.
 *
 * Karol: „sodass es aussieht, als würde man wirklich damit so der Käse zerläuft
 * … als würde man ein Käseschiff so in ein Stück abreissen, wie im echten
 * Leben."
 *
 * ═══ Was einen Faden echt macht, in drei Punkten ═══
 *
 * ER HÄNGT DURCH. Ein Faden zwischen zwei Punkten ist keine Gerade, sondern
 * eine Kettenlinie. Der Durchhang nimmt ab, je weiter man zieht — straff
 * gespannt hängt nichts mehr durch. Das allein trennt „Käse" von „Strich".
 *
 * ER WIRD DÜNNER, UND ZWAR IN DER MITTE ZUERST. Geschmolzener Käse schnürt
 * sich ein, bevor er reisst. Deshalb ist die Strichstärke über die Länge nicht
 * konstant, sondern in der Mitte am geringsten.
 *
 * SIE REISSEN NACHEINANDER. Alle gleichzeitig wäre ein Schnitt. Jeder Faden
 * bekommt deshalb eine eigene Reisslänge — der kürzeste zuerst, der zäheste
 * zuletzt. Danach hängt er an beiden Seiten herunter und zieht sich zusammen.
 */

type Faden = {
  /** Ansatzpunkt an der linken Bruchfläche, 0…1 von oben nach unten. */
  oben: number
  /** Ansatzpunkt rechts — leicht versetzt, sonst laufen alle parallel. */
  obenRechts: number
  /** Bei welcher Spanne dieser Faden reisst. */
  reisst: number
  /** Wie fett er beginnt. */
  dicke: number
  /** Wie stark er durchhängt. */
  hang: number
  /** Eigene Phase, damit sie nicht im Gleichtakt zittern. */
  phase: number
}

type Props = {
  klasse?: string
  /** Wie viele Fäden. Am Handy weniger. */
  menge?: number
}

export default function Kaesefaeden({ klasse, menge = 9 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d', { alpha: true })
    if (!ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const faeden: Faden[] = Array.from({ length: menge }, (_, i) => {
      const t = (i + 0.5) / menge
      return {
        oben: 0.2 + t * 0.6 + (Math.random() - 0.5) * 0.06,
        obenRechts: 0.2 + t * 0.6 + (Math.random() - 0.5) * 0.1,
        /* Gestaffelt von 0,35 bis 0,95: der erste reisst früh, der letzte hält
           fast bis zum Schluss. Ein wenig Zufall darüber, damit die Reihenfolge
           nicht von oben nach unten durchläuft. */
        reisst: 0.35 + t * 0.55 + (Math.random() - 0.5) * 0.12,
        dicke: 0.004 + Math.random() * 0.007,
        hang: 0.1 + Math.random() * 0.16,
        phase: Math.random() * Math.PI * 2,
      }
    })

    let b = 0
    let h = 0

    const messen = () => {
      const r = c.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      b = Math.max(1, Math.round(r.width))
      h = Math.max(1, Math.round(r.height))
      c.width = Math.round(b * dpr)
      c.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    let id = 0
    let laeuft = false
    let zeit = 0

    const bild = (jetzt: number) => {
      zeit = jetzt / 1000
      /* Die Spanne kommt aus einer CSS-Variablen, die GSAP an der Bühne
         animiert. Über React zu gehen hiesse ein Neuzeichnen der Komponente je
         Frame — für etwas, das nur eine Leinwand betrifft. */
      const roh = getComputedStyle(c).getPropertyValue('--spanne').trim()
      const spanne = Math.max(0, Math.min(1, Number(roh) || 0))

      ctx.clearRect(0, 0, b, h)
      if (spanne > 0.001) {
        /* Die Ansatzpunkte wandern mit den Hälften auseinander: bei Spanne 1
           sitzen sie am äusseren Drittel, bei 0 in der Mitte. */
        const links = b * (0.5 - spanne * 0.3)
        const rechts = b * (0.5 + spanne * 0.3)

        for (const f of faeden) {
          const gerissen = spanne > f.reisst
          const y1 = h * f.oben
          const y2 = h * f.obenRechts
          /* Straffung: je weiter gezogen, desto weniger Durchhang. */
          const straff = Math.min(1, spanne / Math.max(f.reisst, 0.001))
          const hang = h * f.hang * (1 - straff * 0.8)
          /* Einschnürung: in der Mitte am dünnsten, und sie nimmt zu, je näher
             der Riss kommt. */
          const dick = b * f.dicke * (1 - straff * 0.65)

          ctx.beginPath()
          if (!gerissen) {
            const mx = (links + rechts) / 2
            const my = (y1 + y2) / 2 + hang + Math.sin(zeit * 1.4 + f.phase) * h * 0.004
            ctx.moveTo(links, y1)
            ctx.quadraticCurveTo(mx, my, rechts, y2)
            ctx.lineWidth = Math.max(0.6, dick)
          } else {
            /* Nach dem Riss: zwei kurze Enden, die zurückschnellen. Sie werden
               kürzer und blasser, je weiter man zieht — was gerissen ist,
               zieht sich zusammen. */
            const rest = Math.max(0, 1 - (spanne - f.reisst) * 5)
            if (rest <= 0.02) continue
            const laenge = b * 0.07 * rest
            ctx.moveTo(links, y1)
            ctx.quadraticCurveTo(links + laenge * 0.6, y1 + hang * 0.5, links + laenge, y1 + hang * 0.9)
            ctx.moveTo(rechts, y2)
            ctx.quadraticCurveTo(rechts - laenge * 0.6, y2 + hang * 0.5, rechts - laenge, y2 + hang * 0.9)
            ctx.lineWidth = Math.max(0.6, dick * rest)
            ctx.globalAlpha = rest
          }
          /* Warmes Cremeweiss mit einem Stich Gelb — geschmolzener Hirtenkäse
             ist nie reinweiss. Ein weisser Faden liest als Faden, ein
             gelblicher als Käse. */
          ctx.strokeStyle = 'oklch(93% 0.055 92 / 0.92)'
          ctx.lineCap = 'round'
          ctx.stroke()
          ctx.globalAlpha = 1
        }
      }
      id = requestAnimationFrame(bild)
    }

    const anhalten = () => {
      if (!laeuft) return
      laeuft = false
      cancelAnimationFrame(id)
    }

    messen()

    /**
     * ═══ Diese Schleife läuft IMMER, und das ist Absicht ═══
     *
     * Zwei Anläufe mit einem Sichtbarkeitsbeobachter sind gescheitert — erst an
     * der Leinwand selbst, dann an ihrem Elternblock. Gemessen: null
     * Durchläufe, obwohl die Leinwand im Bild stand und die Spanne bei ihr
     * ankam. Die Leinwand liegt absolut in einem KLEBENDEN Block, und die
     * Sichtbarkeitsmeldung dafür kommt unzuverlässig.
     *
     * Statt einen dritten Weg zu suchen, den ich nicht prüfen kann: die
     * Schleife läuft durchgehend. Im Ruhezustand kostet sie einen Blick auf
     * eine CSS-Variable und ein `clearRect` — das ist billiger als der
     * Beobachter, den sie ersetzt.
     *
     * Der Ausstieg steht in `bild()`: ist die Spanne null, wird nichts
     * gezeichnet. Es gibt also genau ein Bild, in dem etwas passiert, und das
     * ist das, in dem gerissen wird.
     */
    id = requestAnimationFrame(bild)
    laeuft = true

    const groesse = new ResizeObserver(messen)
    groesse.observe(c)

    return () => {
      anhalten()
      groesse.disconnect()
    }
  }, [menge])

  return <canvas ref={ref} className={`kaesefaeden${klasse ? ' ' + klasse : ''}`} aria-hidden="true" />
}
