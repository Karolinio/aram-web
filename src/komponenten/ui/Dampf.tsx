import { useEffect, useRef } from 'react'

/**
 * Dampf, der wirklich zieht.
 *
 * ═══ Warum das keine Grafik sein darf ═══
 *
 * Die Direktion hat dazu eine eigene Zeile: „Kein Rauch als PNG. Rauch, der als
 * Bild über der Seite liegt, sieht immer aus wie ein Bild über einer Seite."
 * Das gilt auch für ein Video — ein Rechteck mit weichem Rand bleibt ein
 * Rechteck. Dampf muss gerechnet werden, sonst ist er Deko.
 *
 * ═══ Wie er entsteht ═══
 *
 * EIN Wölkchen wird beim Start in eine kleine Nebenleinwand gemalt: ein
 * weicher Farbverlauf von der Mitte nach aussen. Danach wird nur noch dieses
 * eine Bild wieder und wieder gezeichnet — gedreht, skaliert, unterschiedlich
 * durchsichtig. Das ist der Unterschied zwischen vierzehn Zeichenbefehlen pro
 * Bild und vierzehn Weichzeichnern pro Bild; der zweite Weg kostet auf dem
 * Handy jeden Frame.
 *
 * Damit daraus Dampf wird und nicht ein Feld aus Punkten, kommen drei Dinge
 * zusammen, und alle drei sind nötig:
 *
 *   steigen   nach oben, jede Schwade unterschiedlich schnell
 *   wiegen    seitlich, und der Ausschlag WÄCHST mit der Höhe — unten steht
 *             die Luft, oben verwirbelt sie
 *   wachsen   der Radius geht auf das Dreifache, während die Deckkraft in der
 *             Mitte ihres Lebens am höchsten ist und zu beiden Enden auf null
 *             läuft. Etwas, das mit voller Deckkraft erscheint, ist ein Fleck.
 *
 * ═══ Zwei Töne, weil es zwei Gründe gibt ═══
 *
 *   hell   über der Fotografie. Dort ist es dunkel genug, dass weisser Dampf
 *          leuchtet — so, wie man Dampf kennt.
 *   warm   über Creme. Dort wäre Weiss auf Weiss unsichtbar. Gezeichnet wird
 *          eine Spur DUNKLER als der Grund, warm und sehr schwach: so sieht
 *          Dampf aus, wenn er nicht von hinten angeleuchtet wird. Derselbe
 *          Kniff wie beim Mehlstaub, und aus demselben Grund.
 *
 * ═══ Was er kostet ═══
 *
 * Höchstens vierzehn Schwaden, ein rAF, und der läuft NUR, solange die Leinwand
 * im Bild ist. Ein Dampf, der unter dem Fuss weiterrechnet, während oben
 * gelesen wird, ist der Grund, warum schöne Seiten auf Handys heiss werden.
 */

type Schwade = {
  x: number
  y: number
  r: number
  /** Wie lange diese Schwade schon lebt, in Sekunden. */
  leben: number
  dauer: number
  /** Steiggeschwindigkeit in Anteilen der Leinwandhöhe je Sekunde. */
  steigen: number
  wiegen: number
  phase: number
  dreh: number
  deckung: number
}

type Props = {
  klasse?: string
  /** `hell` über Fotografie, `warm` über Creme. Siehe Kopf. */
  ton?: 'hell' | 'warm' | 'ofen'
}

/** Kantenlänge des vorgemalten Wölkchens. Genug für weiche Ränder, wenig genug
 *  für den Speicher — es wird ohnehin nie grösser gezeichnet als die Leinwand. */
const SPRITE = 96

export default function Dampf({ klasse, ton = 'hell' }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d', { alpha: true })
    if (!ctx) return

    /* Das Wölkchen einmal vormalen. */
    const wolke = document.createElement('canvas')
    wolke.width = SPRITE
    wolke.height = SPRITE
    const wctx = wolke.getContext('2d')
    if (!wctx) return
    const v = wctx.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2)
    if (ton === 'ofen') {
      /**
       * ═══ Warum es einen dritten Ton braucht ═══
       *
       * Der Ton `warm` hat einen hellen Kern UND einen dunkleren Saum — genau
       * dafür gebaut, dass er auf hellen wie dunklen Gründen steht.
       *
       * Über dem Clay der Sektionen kippt das: der helle Kern verschwindet im
       * fast gleich hellen Grund, und übrig bleibt der dunkle Saum. Sichtbar
       * ist dann nicht eine Schwade, sondern ein RING — gemessen als graue
       * Kringel über dem Käseschiff, und genau so hat Karol es auch genannt
       * („diese Blasen im Hintergrund, keine Ahnung, was das sein soll").
       *
       * Ein Farbverlauf, dessen Deckkraft von innen nach aussen STRENG fällt,
       * kann keinen Ring machen. Das ist die ganze Regel. Warm und heller als
       * jeder Grund dieser Seite — so sieht Dampf aus, durch den Ofenlicht
       * fällt.
       */
      v.addColorStop(0, 'oklch(99% 0.032 88 / 0.74)')
      v.addColorStop(0.4, 'oklch(97% 0.038 84 / 0.34)')
      v.addColorStop(0.72, 'oklch(96% 0.042 82 / 0.12)')
      v.addColorStop(1, 'oklch(96% 0.042 82 / 0)')
    } else if (ton === 'hell') {
      /* Für dunkle Gründe: nur Kern, kein Saum. Nicht reinweiss — ein Hauch
         Wärme, sonst liegt ein kühler Fleck auf einer Seite, die keinen
         einzigen kühlen Ton kennt. */
      v.addColorStop(0, 'oklch(99% 0.012 85 / 0.85)')
      v.addColorStop(0.45, 'oklch(98% 0.014 82 / 0.28)')
      v.addColorStop(1, 'oklch(98% 0.012 85 / 0)')
    } else {
      /**
       * ═══ Heller Kern MIT warmem Saum — und das ist der ganze Trick ═══
       *
       * Zwei Anläufe sind vorher gescheitert, beide aus demselben Grund:
       *
       *   weisser Dampf   auf einem Foto, das unter dem Cremeschleier fast
       *                   weiss ist. Weiss auf Weiss. Unsichtbar.
       *   warmer Dampf    nur dunkler, ohne Kern. Das las sich nicht als
       *                   Dampf, sondern als Schmutz auf der Linse.
       *
       * Echter Dampf hat BEIDES: einen hellen Kern, wo das Licht durchgeht,
       * und einen dunkleren Saum, wo er den Grund verschattet. Ein einziger
       * Farbverlauf kann das — er läuft von hell über warm-dunkel nach
       * durchsichtig. Damit steht der Dampf auf jedem Grund, hell wie dunkel,
       * ohne dass man ihn je nach Sektion umfärben müsste.
       */
      v.addColorStop(0, 'oklch(99% 0.015 88 / 0.62)')
      v.addColorStop(0.3, 'oklch(92% 0.030 70 / 0.30)')
      v.addColorStop(0.58, 'oklch(58% 0.055 52 / 0.26)')
      v.addColorStop(1, 'oklch(58% 0.055 52 / 0)')
    }
    wctx.fillStyle = v
    wctx.fillRect(0, 0, SPRITE, SPRITE)

    const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let breite = 0
    let hoehe = 0
    let schwaden: Schwade[] = []
    let id = 0
    let laeuft = false
    let imBild = false
    let zuletzt = 0

    const dichte = () => (window.innerWidth < 700 ? 12 : 20)

    /* `neu` bekommt `erstFuellung`: beim Start sollen die Schwaden über ihr
       ganzes Leben verteilt sein. Sonst startet der Dampf als eine einzige
       Wolke, die geschlossen nach oben fährt — ein Rauchring, kein Dampf. */
    const neu = (s: Schwade, erstFuellung = false): Schwade => {
      s.dauer = 3.2 + Math.random() * 3.4
      s.leben = erstFuellung ? Math.random() * s.dauer : 0
      /* Die Quelle ist ein schmaler Streifen unten in der Mitte — dort liegt
         das Gebäck. Von der ganzen Breite aufzusteigen wäre Nebel, kein Dampf. */
      s.x = breite * (0.4 + Math.random() * 0.2)
      s.y = hoehe
      /* Klein anfangen. Erster Versuch stand bei 7–13 % der Breite; daraus
         wurden Wolken von 190 px, und zwanzig davon übereinander ergeben
         Nebel statt Dampf — die Fotografie dahinter war weggewaschen. */
      s.r = breite * (0.032 + Math.random() * 0.03)
      /**
       * ═══ Der Fehler, den nur eine Messung gefunden hat ═══
       *
       * Erster Versuch: eine feste Geschwindigkeit von 0,16–0,30 Leinwandhöhen
       * je Sekunde, bei einer Lebensdauer bis 6,6 s. Macht bis zu ZWEI
       * Leinwandhöhen Weg — die Schwaden waren nach einem Drittel ihres Lebens
       * oben raus und lösten sich ausserhalb des Bildes auf. Sichtbar war nur
       * das erste Drittel, also ein dünner Streifen dicht über dem Gebäck.
       *
       * Jetzt hängt die Geschwindigkeit an der Lebensdauer: jede Schwade legt
       * über ihr ganzes Leben 0,8 bis 1,2 Leinwandhöhen zurück, egal wie lange
       * sie lebt. Damit füllt der Dampf den Ausschnitt, für den er gebaut ist.
       */
      s.steigen = (0.8 + Math.random() * 0.4) / s.dauer
      s.wiegen = breite * (0.025 + Math.random() * 0.06)
      s.phase = Math.random() * Math.PI * 2
      s.dreh = Math.random() * Math.PI * 2
      s.deckung = 0.55 + Math.random() * 0.45
      return s
    }

    const messen = () => {
      const r = c.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      breite = r.width
      hoehe = r.height
      c.width = Math.round(breite * dpr)
      c.height = Math.round(hoehe * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      schwaden = Array.from({ length: dichte() }, () =>
        neu({} as Schwade, true),
      )
    }

    const zeichnen = () => {
      ctx.clearRect(0, 0, breite, hoehe)
      for (const s of schwaden) {
        const l = s.leben / s.dauer
        /* Auf- und abschwellen. Der Sinus über das ganze Leben ist der
           billigste Weg zu „taucht auf, wird dicht, löst sich auf". */
        const deck = Math.sin(Math.PI * l) ** 1.3 * s.deckung
        if (deck <= 0.004) continue
        const r = s.r * (0.5 + l * 1.7)
        const x = s.x + Math.sin(l * 3.4 + s.phase) * s.wiegen * (0.25 + l)
        const y = s.y - hoehe * s.steigen * s.leben
        ctx.globalAlpha = deck
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(s.dreh + l * 0.7)
        /* HOCHKANT gezeichnet, nicht rund: 0,78 breit gegen 1,3 hoch. Runde
           Wölkchen lesen sich als Rauchpilz, längliche als Schwade — das ist
           der Unterschied zwischen Lagerfeuer und Backblech. */
        ctx.drawImage(wolke, -r * 0.78, -r * 1.3, r * 1.56, r * 2.6)
        ctx.restore()
      }
      ctx.globalAlpha = 1
    }

    const takt = (jetzt: number) => {
      if (!laeuft) return
      /* Zeitbasiert, nicht bildbasiert. Auf einem 120-Hz-Schirm zöge der Dampf
         sonst doppelt so schnell. Der Deckel bei 50 ms fängt den Sprung ab,
         wenn der Tab kurz weg war. */
      const dt = Math.min(0.05, zuletzt ? (jetzt - zuletzt) / 1000 : 0.016)
      zuletzt = jetzt
      for (const s of schwaden) {
        s.leben += dt
        if (s.leben >= s.dauer) neu(s)
      }
      zeichnen()
      id = requestAnimationFrame(takt)
    }

    const starten = () => {
      if (ruhig || laeuft || !imBild || document.hidden) return
      laeuft = true
      zuletzt = 0
      id = requestAnimationFrame(takt)
    }

    const anhalten = () => {
      laeuft = false
      cancelAnimationFrame(id)
    }

    messen()
    /* Bei reduzierter Bewegung ein STEHENDES Bild, kein leerer Kasten.
       Ersetzt, nicht weggelassen — dieselbe Regel wie beim Mehlstaub. */
    if (ruhig) zeichnen()

    const beobachter = new IntersectionObserver(([e]) => {
      imBild = e?.isIntersecting ?? false
      if (imBild) starten()
      else anhalten()
    })
    beobachter.observe(c)

    const sichtbarkeit = () => (document.hidden ? anhalten() : starten())
    const groesse = new ResizeObserver(() => {
      messen()
      if (ruhig) zeichnen()
    })
    groesse.observe(c)
    document.addEventListener('visibilitychange', sichtbarkeit)

    return () => {
      anhalten()
      beobachter.disconnect()
      groesse.disconnect()
      document.removeEventListener('visibilitychange', sichtbarkeit)
    }
  }, [ton])

  return <canvas ref={ref} className={`dampf${klasse ? ' ' + klasse : ''}`} aria-hidden="true" />
}
