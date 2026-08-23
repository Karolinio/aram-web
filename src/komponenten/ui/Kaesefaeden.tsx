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
 *
 * ═══ Warum die zweite Fassung mit Strichen scheitern MUSSTE ═══
 *
 * Karol nach dem Ansehen: „das der Käse schmelzen sieht auf jeden Fall so
 * anders, wie keine Ahnung was … das muss man dann besser sehen oder raus."
 *
 * Die Fäden waren gestrichene Kurven mit `lineWidth`. Ein Strich hat über
 * seine ganze Länge EINE Stärke — die Einschnürung, die den ganzen Punkt
 * ausmacht, lässt sich damit nicht zeichnen. Was blieb, waren elf gleich dicke
 * Linien nebeneinander: ein Kamm, kein Käse.
 *
 * Jeder Faden ist jetzt eine GEFÜLLTE Fläche. Die Kurve wird abgetastet, an
 * jeder Stelle wird eine eigene Halbbreite gerechnet, und daraus entsteht ein
 * Umriss: dick an den beiden Wurzeln, dünn in der Mitte. Das kostet zwanzig
 * Punkte statt zwei — und ist der Unterschied zwischen einem Strich und einem
 * Strang.
 *
 * Und es sind FÜNF statt elf. Elf gleichmässig verteilte Fäden lesen sich als
 * Raster; fünf verschieden dicke, dicht beieinander, als eine Käsemasse, die
 * auseinandergezogen wird.
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

export default function Kaesefaeden({ klasse, menge = 5 }: Props) {
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
        /* 0,10 bis 0,40 der Leinwand — und die Leinwand ist doppelt so hoch
           wie das Gebäck. Die Fäden setzen damit zwischen 20 und 80 % der
           GEBÄCKHÖHE an, also auf der Bruchkante, und haben die untere Hälfte
           der Leinwand zum Durchhängen.
           Vorher spannte sich 0,2…0,8 über eine anderthalbfache Leinwand: die
           Fäden hingen dann unter dem Gebäck in der Luft. */
        /* Ein enges Band statt einer gleichmässigen Verteilung: 0,15…0,33 der
           Leinwand, und die Leinwand ist doppelt so hoch wie das Gebäck. Die
           Fäden sitzen damit zwischen 30 und 66 % der Gebäckhöhe — dort, wo im
           Bild der Käse liegt, und nicht über die ganze Kante verteilt. */
        oben: 0.15 + t * 0.18 + (Math.random() - 0.5) * 0.03,
        obenRechts: 0.15 + t * 0.18 + (Math.random() - 0.5) * 0.05,
        /* Gestaffelt von 0,35 bis 0,95: der erste reisst früh, der letzte hält
           fast bis zum Schluss. Ein wenig Zufall darüber, damit die Reihenfolge
           nicht von oben nach unten durchläuft. */
        reisst: 0.35 + t * 0.55 + (Math.random() - 0.5) * 0.12,
        /* Deutlich dicker als vorher (0,004…0,011) und viel weiter gestreut:
           auf 608 px Gebäckbreite sind das Wurzeln von 7 bis 20 px. Gleich
           dicke Fäden lesen sich als Kamm; verschieden dicke als Käse. */
        dicke: 0.012 + Math.random() * 0.022,
        hang: 0.055 + Math.random() * 0.075,
        phase: Math.random() * Math.PI * 2,
      }
    })

    let b = 0
    let h = 0

    /** Ein Punkt auf einer quadratischen Bézierkurve. */
    const punkt = (
      x1: number, ay: number, mx: number, my: number, x2: number, by: number, t: number,
    ): [number, number] => {
      const u = 1 - t
      return [
        u * u * x1 + 2 * u * t * mx + t * t * x2,
        u * u * ay + 2 * u * t * my + t * t * by,
      ]
    }

    /**
     * Ein Band zeichnen: die Kurve wird abgetastet, und an jeder Stelle sagt
     * `breite(t)`, wie dick der Faden dort ist. Der Umriss läuft auf der
     * Oberkante hin und auf der Unterkante zurück.
     *
     * Senkrecht versetzt und nicht entlang der Normalen — die Fäden liegen
     * annähernd waagerecht, und der Unterschied wäre bei dieser Neigung
     * kleiner als ein Pixel. Die Normale zu rechnen kostet je Punkt eine
     * Wurzel; das ist der Preis für nichts.
     */
    const ABTASTUNG = 20
    const band = (
      bahn: (t: number) => [number, number],
      breite: (t: number) => number,
    ) => {
      ctx.beginPath()
      for (let i = 0; i <= ABTASTUNG; i++) {
        const t = i / ABTASTUNG
        const [x, y] = bahn(t)
        const w = Math.max(0.35, breite(t))
        if (i === 0) ctx.moveTo(x, y - w)
        else ctx.lineTo(x, y - w)
      }
      for (let i = ABTASTUNG; i >= 0; i--) {
        const t = i / ABTASTUNG
        const [x, y] = bahn(t)
        ctx.lineTo(x, y + Math.max(0.35, breite(t)))
      }
      ctx.closePath()
      ctx.fill()
    }

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
    let laeuft = false
    let zeit = 0

    const bild = (jetzt: number) => {
      zeit = jetzt / 1000
      /* Die Spanne kommt aus einer CSS-Variablen, die GSAP an der Bühne
         animiert. Über React zu gehen hiesse ein Neuzeichnen der Komponente je
         Frame — für etwas, das nur eine Leinwand betrifft. */
      const roh = getComputedStyle(c).getPropertyValue('--spanne').trim()
      const spanne = Math.max(0, Math.min(1, Number(roh) || 0))

      /* Warmes Cremeweiss mit einem Stich Gelb — geschmolzener Hirtenkäse
         ist nie reinweiss. Ein weisser Strang liest als Faden, ein gelblicher
         als Käse. */
      ctx.fillStyle = 'oklch(94% 0.055 92 / 0.94)'
      ctx.clearRect(0, 0, b, h)
      if (spanne > 0.001) {
        /* Die Ansatzpunkte wandern mit den Hälften auseinander: bei Spanne 1
           sitzen sie am äusseren Drittel, bei 0 in der Mitte. Die 0,3 ist
           dieselbe Zahl, mit der Kaeseschiff.tsx die Hälften verschiebt —
           weichen sie ab, hängen die Fäden neben der Bruchkante. */
        const links = b * (0.5 - spanne * 0.3)
        const rechts = b * (0.5 + spanne * 0.3)

        for (const f of faeden) {
          const gerissen = spanne > f.reisst
          const y1 = h * f.oben
          const y2 = h * f.obenRechts
          /* Straffung: je weiter gezogen, desto weniger Durchhang. */
          const straff = Math.min(1, spanne / Math.max(f.reisst, 0.001))
          const hang = h * f.hang * (1 - straff * 0.72)
          const wurzel = b * f.dicke * (1 - straff * 0.28)

          if (!gerissen) {
            const mx = (links + rechts) / 2
            const my = (y1 + y2) / 2 + hang + Math.sin(zeit * 1.3 + f.phase) * h * 0.004
            band(
              (t) => punkt(links, y1, mx, my, rechts, y2, t),
              /* Die Einschnürung. `sin(pi t)` ist in der Mitte 1 und an beiden
                 Enden 0; die Wurzel 0,55 zieht sie zu den Enden hin schneller
                 hoch, sodass der Faden nicht spindelförmig, sondern wie ein
                 zäher Strang aussieht: kurze dicke Ansätze, langer dünner
                 Mittelteil. Und sie NIMMT ZU, je näher der Riss kommt. */
              (t) => wurzel * (1 - Math.sin(Math.PI * t) ** 0.55 * (0.5 + straff * 0.42)),
            )
          } else {
            /* Nach dem Riss: zwei Enden, die zurückschnellen und nach unten
               hängen. Sie werden kürzer und blasser, je weiter man zieht —
               was gerissen ist, zieht sich zusammen. */
            const rest = Math.max(0, 1 - (spanne - f.reisst) * 4)
            if (rest <= 0.02) continue
            const lang = b * 0.1 * rest
            const tief = hang * 1.6 + h * 0.03
            ctx.globalAlpha = rest
            band(
              (t) => punkt(links, y1, links + lang * 0.55, y1 + tief * 0.5, links + lang * 0.7, y1 + tief, t),
              (t) => wurzel * rest * (1 - t * 0.86),
            )
            band(
              (t) => punkt(rechts, y2, rechts - lang * 0.55, y2 + tief * 0.5, rechts - lang * 0.7, y2 + tief, t),
              (t) => wurzel * rest * (1 - t * 0.86),
            )
            ctx.globalAlpha = 1
          }
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
