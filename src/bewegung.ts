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
 * ═══ Zwei Nachlaufwerte, und beide haben eine Regel ═══
 *
 * Gemessen am 24.08. standen VIER verschiedene auf der Seite: `true`, `0.35`,
 * `0.4` und irgendwo noch eine `1` im Kommentar. Keiner davon hatte eine
 * Begründung, die über „hat sich damals gut angefühlt" hinausging.
 *
 * Es braucht zwei, nicht einen — aber jeder mit einem Grund:
 *
 *   FLAECHE   Bilder und Hintergründe, die dem Scroll folgen sollen. Sie sind
 *             keine Gegenstände, sie sind Grund. Ein Nachlauf macht sie zu
 *             etwas, das hinterherrutscht, und genau das hat Karol am 21.08.
 *             als „haperig" gemeldet. Kein Nachlauf; die Glättung liefert
 *             Lenis.
 *   KOERPER   Freigestellte Dinge, die im Raum fliegen. Sie haben Masse, und
 *             Masse heisst Trägheit. 0,4 Sekunden sind gemessen der Punkt, an
 *             dem es nach Gewicht aussieht und noch nicht nach Verzögerung:
 *             bei 0,35 kommen 52 % der Bewegung in den ersten 100 ms an, bei
 *             1,0 nur 16 %.
 *
 * Wer einen dritten Wert einträgt, soll ihn hier eintragen und begründen.
 */
export const SCRUB_FLAECHE = true
export const SCRUB_KOERPER = 0.4

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
export const werkzeugHolen = (): Promise<Werkzeug | null> => {
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
/**
 * ═══ Warum hier kaum noch geglättet wird ═══
 *
 * Lenis glättet den Scroll bereits über 1,1 Sekunden. Ein `scrub: 1` legt
 * darauf eine ZWEITE Glättung von rund einer Sekunde — und zwei gestapelte
 * Dämpfungen fühlen sich nicht doppelt weich an, sondern zäh.
 *
 * Gemessen am 21.08., ein Radstoss von 600 px in der Galerie:
 *
 *   100 ms   79 von 490 px    16 %
 *   300 ms   310 px           63 %
 *   500 ms   422 px           86 %
 *   1200 ms  489 px           voll
 *
 * Die ersten hundert Millisekunden sind das, was eine Hand spürt. Sechzehn
 * Prozent davon heisst: man schiebt, und es passiert fast nichts. Karol:
 * „aktuell Scrollgefühl sehr haperig."
 *
 * Der Nachlauf muss also von Lenis kommen, nicht vom Scrub. `0.35` lässt genug
 * Trägheit für die Tiefenwirkung und nimmt die zweite Sekunde weg.
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
            scrub: SCRUB_FLAECHE,
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

/**
 * Ein Element DREHT sich beim Scrollen.
 *
 * ═══ Warum das ein eigener Haken ist und nicht ein Zusatz zu `useVersatz` ═══
 *
 * Weil GSAP zwar `y` und `rotationY` auf demselben Knoten mischen kann, das
 * Ladenschild aber schon eine dritte Bewegung trägt: die Neigung zum Zeiger,
 * die in jedem Frame direkt `style.transform` setzt. Eine GSAP-Zeitleiste und
 * eine Schleife, die dieselbe Eigenschaft schreibt, überschreiben einander
 * still — sichtbar ist dann die letzte, und welche das ist, entscheidet die
 * Bildwiederholrate.
 *
 * Drei Bewegungen, drei Knoten. Das ist auf dieser Seite die Regel, seit
 * derselbe Fehler dem Hero einmal die Kamerafahrt gekostet hat.
 *
 * @param grad  Wie weit sich das Element über die volle Durchfahrt um die
 *              Hochachse dreht. Positiv = die rechte Kante kommt nach vorn.
 */
export function useDrehung<T extends HTMLElement>(grad: number) {
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
        { rotationY: 0 },
        {
          rotationY: grad,
          ease: 'none',
          scrollTrigger: {
            /* Ausgelöst von der Bühne, nicht vom Element: hinge der Bereich am
               Schild, verschöbe er sich mit jeder Drehung selbst. */
            trigger: '.backstube',
            start: 'top top',
            end: 'bottom top',
            scrub: SCRUB_KOERPER,
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
  }, [grad])

  return ref
}

/**
 * Ein Element verabschiedet sich beim Scrollen.
 *
 * Es hebt ab, kippt nach hinten weg und wird durchsichtig — fertig, bevor die
 * Sektion halb durch ist. Gedacht für das Ladenschild: es begrüsst und geht
 * dann aus dem Weg, statt bis zum Seitenende mitzufahren.
 *
 * Der Auslöser ist die Sektion, nicht das Element: hinge er am Schild, änderte
 * sich sein eigener Bereich mit dem Fortschritt.
 */
export function useAbgang<T extends HTMLElement>(buehneWahl: string) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const buehne = el.closest(buehneWahl) ?? el
    let tot = false
    let abraeumen: (() => void) | undefined

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      const { gsap } = werkzeug

      const tween = gsap.to(el, {
        y: () => -window.innerHeight * 0.3,
        rotateX: 26,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: buehne,
          start: 'top top',
          /* Nach sechzig Prozent der Sektion ist es weg. Bis zum Ende
             mitzufahren hiesse, es bis in die nächste Sektion zu schleppen. */
          end: '60% top',
          scrub: SCRUB_KOERPER,
          invalidateOnRefresh: true,
          onToggle: ({ isActive }) => {
            el.style.willChange = isActive ? 'transform, opacity' : ''
          },
        },
      })

      abraeumen = () => {
        tween.scrollTrigger?.kill()
        tween.kill()
        el.style.willChange = ''
        gsap.set(el, { clearProps: 'all' })
      }
    })

    return () => {
      tot = true
      abraeumen?.()
    }
  }, [buehneWahl])

  return ref
}

/**
 * Durch eine Bildfolge schalten, getrieben vom Scrollfortschritt.
 *
 * ═══ Warum gestapelt und nicht getauscht ═══
 *
 * Der naheliegende Weg wäre, `src` umzusetzen. Dann muss der Browser beim
 * ersten Wechsel jedes Bild erst dekodieren — mitten in der Bewegung, und genau
 * dort kostet es den Frame, den man sieht. Stattdessen liegen alle Ansichten
 * übereinander und werden nur ein- und ausgeblendet: dekodiert wird beim Laden,
 * geschaltet wird mit `opacity`, und das kostet nichts.
 *
 * ═══ Warum keine React-Zustände ═══
 *
 * Der Fortschritt ändert sich in jedem Frame. Ein `useState` darin würde die
 * Komponente sechzigmal pro Sekunde neu rendern. Hier wird direkt am Knoten
 * geschrieben — React sieht davon nichts, und das ist der Sinn.
 */
export function useBildfolge<T extends HTMLElement>(
  anzahl: number,
  buehneWahl: string,
  /**
   * Von wo bis wo gezählt wird.
   *
   * Der Standard `top bottom` → `bottom top` ist für Dinge gedacht, die durch
   * das Bild FLIEGEN: dort soll der Fortschritt schon laufen, während die
   * Bühne noch von unten hereinkommt.
   *
   * Für einen KLEBENDEN Ausschnitt ist das falsch. Gemessen am 03.09.: beim
   * Ofenmaul stand schon das dritte von vier Bildern, als der erste Satz
   * daneben zu lesen begann, und das vierte war erreicht, bevor das Maul
   * überhaupt losklebte. Der Grund ist einfach — die Strecke „von unten
   * hereingekommen bis oben hinausgegangen" ist rund eine Bildschirmhöhe
   * länger als die Strecke, auf der geklebt wird.
   *
   * Wer klebt, zählt `top top` → `bottom bottom`: von dem Moment, in dem die
   * Bühne oben anschlägt, bis zu dem, in dem ihr Fuss dort ankommt.
   */
  von = 'top bottom',
  bis = 'bottom top',
  /** Wähler für Elemente, die denselben Takt bekommen. Siehe unten. */
  mitWahl?: string,
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || anzahl < 2) return

    const bilder = [...el.querySelectorAll<HTMLElement>('[data-ansicht]')]
    if (bilder.length < 2) return

    const buehne = el.closest(buehneWahl) ?? el
    let tot = false
    let abraeumen: (() => void) | undefined
    let zuletzt = -1

    /**
     * Wer die Bildfolge schaltet, darf auch die Beschriftung schalten.
     *
     * `mit` benennt Elemente AUSSERHALB des Bildstapels, die denselben Takt
     * bekommen — beim Ofenmaul sind das die vier Sätze daneben. Ohne das
     * müsste ein zweiter ScrollTrigger auf derselben Bühne laufen, und zwei
     * Trigger auf derselben Strecke laufen auseinander, sobald einer
     * nachgerechnet wird.
     */
    const begleiter = mitWahl
      ? [...buehne.querySelectorAll<HTMLElement>(mitWahl)]
      : []

    const zeigen = (i: number) => {
      if (i === zuletzt) return
      zuletzt = i
      bilder.forEach((b, k) => {
        b.style.opacity = k === i ? '1' : '0'
      })
      begleiter.forEach((b, k) => {
        b.dataset.lauf = k === i ? 'ja' : 'nein'
      })
    }

    zeigen(0)

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      const st = werkzeug.ScrollTrigger.create({
        trigger: buehne,
        start: von,
        end: bis,
        onUpdate: ({ progress }) => {
          /* Der letzte Index darf nur bei genau 1 erreicht werden, sonst
             flackert die letzte Ansicht am Rand ein einzelnes Bild lang auf. */
          zeigen(Math.min(bilder.length - 1, Math.floor(progress * bilder.length)))
        },
      })
      abraeumen = () => st.kill()
    })

    return () => {
      tot = true
      abraeumen?.()
    }
  }, [anzahl, buehneWahl, von, bis, mitWahl])

  return ref
}

/** Wie deckend ein Schritt ist, der gerade nicht laeuft. */
const SCHRITT_RUHE = 0.34

const klemmen = (x: number, min: number, max: number) =>
  x < min ? min : x > max ? max : x

/**
 * Der Ofenlauf — vier Aufnahmen fahren nacheinander durch dasselbe Maul.
 *
 * ═══ Warum dieser Haken existiert und `useBildfolge` hier nicht reicht ═══
 *
 * Karol am 05.09.: „Der Uebergang ist einfach nicht konsistent genug … es ist
 * noch nicht fliessend genug."
 *
 * Gemessen am 06.09. bei 1440 × 900 war das keine Geschmacksfrage, sondern
 * Arithmetik. Zwei Uhren liefen, verschieden geteilt:
 *
 *   Das Bild schaltete nach GLEICHEN Vierteln der Strecke — 302 px je Bild.
 *   Die vier Saetze daneben waren UNGLEICH hoch: 468, 612, 612, 414 px.
 *
 * Gleiche Schnitte auf einem ungleichen Lineal koennen nicht zusammenfallen.
 * Der Versatz betrug +256 px beim ersten Uebergang, −19 beim zweiten und
 * −280 beim dritten — fast eine ganze Bildlaenge, und das Vorzeichen kippte.
 * Genau deshalb las es sich als „mal zu spaet, mal zu frueh" statt als
 * gleichmaessige Verzoegerung, die niemand bemerkt haette.
 *
 * ═══ Die Loesung ist kein besserer Teiler, sondern ein einziger Wert ═══
 *
 * Es gibt hier genau EINEN Schreiber und EINE Zahl: den `laufwert`. Er wird
 * nicht aus einem Fortschritt geschaetzt, sondern aus der tatsaechlichen Lage
 * der Saetze im Fenster GEMESSEN — die Summe dessen, wie weit jeder Satz die
 * Uebergabelinie im Maul schon ueberschritten hat.
 *
 *   laufwert 0,0   Aufnahme 01 steht, Satz 01 ist hell
 *   laufwert 1,5   Aufnahme 02 faehrt heraus, 03 herein, beide Saetze halbhell
 *   laufwert 3,0   Aufnahme 04 steht, Satz 04 ist hell
 *
 * Weil Bild UND Schrift aus derselben Zahl gezeichnet werden, kann ein Versatz
 * nicht entstehen. Nicht „ist korrigiert" — er hat keinen Ort mehr, an dem er
 * entstehen koennte. Das war Weg 02.
 *
 * ═══ Warum es keinen Schaltmoment mehr gibt ═══
 *
 * Der `laufwert` ist stetig, nicht ganzzahlig. Die neue Aufnahme faehrt von
 * unten ins Maul ein und schiebt die vorige weiter hinein, wo sie dunkler wird
 * und im Ofen verschwindet — die Bewegung, die Schritt 04 zeigt. Es gibt keinen
 * Zeitpunkt, der falsch liegen koennte, weil es keinen Zeitpunkt gibt. Das war
 * Weg 03.
 *
 * ═══ Die Geometrie, die dazugehoert ═══
 *
 * Die Uebergabelinie liegt bei `LINIE` der Maulhoehe unter dessen Oberkante.
 * Damit der letzte Satz den Bogen noch erreicht, muss die Laufstrecke unten um
 * `(1 − LINIE) × Maulhoehe` laenger sein als die Summe der Saetze — sonst
 * loest sich der Bogen, bevor der letzte Satz an ihm angekommen ist. Genau
 * das war der zweite gemessene Fehler: Satz 04 haette den Bogen erst 150 px
 * NACH dessen Abloesung erreicht. Der Zuschlag steht in `sektionen.css` als
 * `padding-bottom` an `.prozess__lauf`; wer eine der beiden Stellen aendert,
 * muss die andere mitaendern.
 */
export function useOfenlauf<T extends HTMLElement>(o: {
  /** Der Bogen selbst — er gibt Hoehe und Klebeposition vor. */
  maulWahl: string
  /** Der klebende Rahmen um den Bogen. Aus seinem `top` kommt die Klebehoehe. */
  ofenWahl: string
  /** Die Saetze. Ihre Zahl muss der Zahl der Aufnahmen entsprechen. */
  schrittWahl: string
  /** Das Aufglimmen am Maulboden, wenn etwas einfaehrt. Darf fehlen. */
  glutWahl?: string
  /** Wie tief im Maul die Uebergabe liegt, als Anteil seiner Hoehe. */
  linie?: number
  /** Wie lang ein Uebergang dauert, als Anteil der Maulhoehe. */
  weite?: number
}) {
  const ref = useRef<T>(null)
  const { maulWahl, ofenWahl, schrittWahl, glutWahl, linie = 0.5, weite = 0.3 } = o

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const maul = el.querySelector<HTMLElement>(maulWahl)
    const ofen = el.querySelector<HTMLElement>(ofenWahl)
    const glut = glutWahl ? el.querySelector<HTMLElement>(glutWahl) : null
    const bilder = [...el.querySelectorAll<HTMLElement>('[data-ansicht]')]
    const schritte = [...el.querySelectorAll<HTMLElement>(schrittWahl)]
    if (!maul || !ofen || bilder.length < 2 || schritte.length !== bilder.length) return

    const sanft = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /**
     * Die Uebergabelinie in Fensterkoordinaten.
     *
     * Nicht aus `getBoundingClientRect`: der Bogen klebt, und beim Neuvermessen
     * steht die Seite womoeglich ganz woanders — dann waere der gemessene Wert
     * die Lage im Anflug statt die im geklebten Zustand. Das aufgeloeste `top`
     * aus dem Stilblatt gilt dagegen immer, und `offsetHeight` haengt nicht am
     * Scroll.
     */
    const linieY = () =>
      (parseFloat(getComputedStyle(ofen).top) || 0) + maul.offsetHeight * linie
    const weiteY = () => Math.max(80, maul.offsetHeight * weite)

    /**
     * Wie weit die Folge steht — gemessen, nicht geschaetzt.
     *
     * Jeder Satz ab dem zweiten steuert zwischen 0 und 1 bei, je nachdem, wie
     * weit seine Oberkante die Uebergabelinie schon passiert hat. Die Summe
     * ist stetig, waechst monoton mit dem Scroll und kann nie mehr als
     * `bilder.length − 1` werden.
     */
    const laufwert = () => {
      const mitte = linieY()
      const w = weiteY()
      let t = 0
      for (let k = 1; k < schritte.length; k++) {
        const oben = schritte[k].getBoundingClientRect().top
        t += klemmen((mitte + w / 2 - oben) / w, 0, 1)
      }
      return t
    }

    /**
     * Alles aus einer Zahl.
     *
     * `d = t − i` ist die Lage der Aufnahme i in der Folge:
     *   d ≤ −1   wartet unterhalb des Mauls, unsichtbar hinter dem Beschnitt
     *   −1 < d < 0   faehrt gerade ein
     *   0 ≤ d < 1    steht und wird von der naechsten hineingeschoben
     *   d ≥ 1    ist im Ofen verschwunden
     */
    const zeichnen = () => {
      const t = laufwert()

      if (sanft) {
        const r = Math.round(t)
        bilder.forEach((b, i) => {
          b.style.transform = 'none'
          b.style.opacity = i === r ? '1' : '0'
        })
        return
      }

      bilder.forEach((b, i) => {
        const d = t - i
        let y: number
        let s: number
        let deck: number
        if (d <= -1) {
          y = 100
          s = 1.05
          deck = 1
        } else if (d < 0) {
          const p = d + 1
          y = 100 - p * 100
          s = 1.05 - p * 0.05
          deck = 1
        } else if (d < 1) {
          y = -16 * d
          s = 1 + 0.06 * d
          /* Die weichende Aufnahme wird nicht weggeblendet, sondern DUNKEL:
             hinter ihr liegt der tiefe Grund des Mauls, und was dort
             verschwindet, verschwindet im Ofen.

             Die Wurzelkurve statt einer Geraden: linear war die vorige
             Aufnahme auf halbem Weg noch bei 0,59 und sah damit aus wie ein
             zweites, gleichwertiges Foto — im Screenshot lagen zwei helle
             Bilder uebereinander. Mit `d ** 0.7` steht dort 0,45, und das
             Auge liest ein Vorne und ein Hinten statt einer Teilung. */
          deck = 1 - 0.9 * d ** 0.7
        } else {
          y = -16
          s = 1.06
          deck = 0.1
        }
        b.style.transform = `translate3d(0, ${y}%, 0) scale(${s})`
        b.style.opacity = String(deck)
      })

      /* Der Satz traegt dasselbe Gewicht wie seine Aufnahme. Bei t = 1,5 sind
         zwei Saetze halbhell — genau dann, wenn zwei Aufnahmen im Maul sind. */
      schritte.forEach((sch, i) => {
        const naehe = Math.max(0, 1 - Math.abs(t - i))
        sch.style.opacity = String(SCHRITT_RUHE + (1 - SCHRITT_RUHE) * naehe)
      })

      /**
       * ═══ Die Glut sitzt AUF DER NAHT, nicht am Boden ═══
       *
       * Im ersten Bau lag sie unten im Maul. Der Screenshot bei halbem
       * Uebergang zeigte daraufhin genau das Problem, das sie loesen sollte:
       * eine rasiermesserscharfe waagerechte Kante quer durch den Bogen — zwei
       * gestapelte Fotos, kein Ofen.
       *
       * Jetzt laeuft sie mit der Kante mit. Die einfahrende Aufnahme steht bei
       * `(1 − Bruch)` ihrer Hoehe, dort liegt die Naht, und dort schlaegt die
       * Hitze hoch. Damit ist die Kante nicht mehr versteckt, sondern der
       * Grund, warum sich etwas bewegt: es kommt aus dem Feuer.
       */
      if (glut) {
        const bruch = t - Math.floor(t)
        if (bruch < 0.001 || t >= bilder.length - 1) {
          glut.style.opacity = '0'
        } else {
          const naht = maul.offsetHeight * (1 - bruch)
          glut.style.transform = `translate3d(0, ${naht - glut.offsetHeight / 2}px, 0)`
          glut.style.opacity = String(Math.sin(Math.PI * bruch) * 0.85)
        }
      }
    }

    zeichnen()

    let tot = false
    let abraeumen: (() => void) | undefined

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return

      /**
       * ═══ Eine Bildschirmhoehe im Voraus dekodieren ═══
       *
       * Die vier Aufnahmen liegen gestapelt und wiegen zusammen 376 kB. Eifrig
       * geladen naehmen sie dem Hero auf einer gedrosselten Leitung fast zwei
       * Sekunden Bandbreite weg — sie bleiben also `lazy`.
       *
       * Der Ruckler, den man beim Einfahren saehe, kommt aber nicht vom Laden,
       * sondern vom DEKODIEREN: es passiert im ersten Bild, in dem die Aufnahme
       * gebraucht wird, und genau dort kostet es den Frame, den man sieht. In
       * diesem Projekt ist das schon einmal gemessen worden.
       *
       * `decode()` zieht beides eine Bildschirmhoehe vor die Sektion — dort ist
       * der Hero laengst gezeichnet, und wenn das Maul anklebt, liegen alle
       * vier fertig im Speicher.
       */
      const warm = werkzeug.ScrollTrigger.create({
        trigger: el,
        start: 'top bottom+=100%',
        once: true,
        onEnter: () => {
          bilder.forEach((b) => {
            if (b instanceof HTMLImageElement) void b.decode().catch(() => {})
          })
        },
      })

      const st = werkzeug.ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        invalidateOnRefresh: true,
        onUpdate: zeichnen,
        onRefresh: zeichnen,
        onToggle: ({ isActive }) => {
          bilder.forEach((b) => {
            b.style.willChange = isActive && !sanft ? 'transform, opacity' : ''
          })
        },
      })
      abraeumen = () => {
        warm.kill()
        st.kill()
      }
    })

    return () => {
      tot = true
      abraeumen?.()
      bilder.forEach((b) => {
        b.style.willChange = ''
      })
    }
  }, [maulWahl, ofenWahl, schrittWahl, glutWahl, linie, weite])

  return ref
}

type Flug = {
  /** Von wo nach wo, in Anteilen der Fensterhöhe. Negativ = weiter oben. */
  y: [von: number, bis: number]
  /** Seitlicher Drift, in Anteilen der Elementbreite. */
  x: [von: number, bis: number]
  /** Drehung in der Bildebene, in Grad. */
  dreh: [von: number, bis: number]
  /** Drehung um die Hochachse — das Kippen nach links und rechts. */
  drehY: [von: number, bis: number]
  /** Drehung um die Querachse — das Neigen nach vorn und hinten. */
  drehX: [von: number, bis: number]
  /** Tiefe in Pixeln. Braucht `perspective` am Vorfahren, sonst passiert nichts. */
  z: [von: number, bis: number]
  /** Grösse. Ein Gegenstand, der näher kommt, wird grösser. */
  skala: [von: number, bis: number]
  /** Woran der Flug hängt. Steigt der Wähler ins Leere, hängt er am Element selbst. */
  buehne: string
  /** Ab welcher Fensterbreite überhaupt geflogen wird. */
  abBreite: number
  /**
   * Wohin die DREHUNGEN gehen, wenn nicht auf dasselbe Element.
   *
   * Ohne diesen Wähler liegt alles auf einem Knoten, und dann dreht sich mit
   * dem Gebäck auch alles, was daneben hängt. Der Dampf über einem taumelnden
   * Gebäck taumelt dann mit — und Dampf, der sich um 40 Grad legt, ist kein
   * Dampf mehr, sondern eine Fahne.
   *
   * Ist er gesetzt, trägt das äussere Element nur noch Weg, Tiefe und Grösse;
   * die drei Drehachsen wandern auf das benannte Kind. `preserve-3d` auf dem
   * äusseren Element ist dafür Bedingung, sonst fällt `rotateY` in die Fläche
   * zurück — die Perspektive liegt eine Ebene höher.
   */
  drehZiel?: string
}

/**
 * Gilt diese Medienabfrage gerade?
 *
 * `useSyncExternalStore` und nicht `useState` + Effekt: die Antwort steht schon
 * beim ersten Rendern fest, und beim Drehen des Geräts kommt sie ohne zweiten
 * Durchlauf nach.
 */
export function useMedienabfrage(abfrage: string): boolean {
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

      /* Wenn ein Drehziel benannt ist, bleiben hier nur Weg, Tiefe und Grösse;
         sonst liegt wie bisher alles auf einem Knoten. */
      const dreher = f.drehZiel ? el.querySelector<HTMLElement>(f.drehZiel) : null
      const drehVon = dreher
        ? {}
        : { rotate: f.dreh[0], rotateY: f.drehY[0], rotateX: f.drehX[0] }
      const drehNach = dreher
        ? {}
        : { rotate: f.dreh[1], rotateY: f.drehY[1], rotateX: f.drehX[1] }

      const tween = gsap.fromTo(
        el,
        {
          y: () => f.y[0] * window.innerHeight,
          xPercent: f.x[0] * 100,
          ...drehVon,
          z: f.z[0],
          scale: f.skala[0],
        },
        {
          y: () => f.y[1] * window.innerHeight,
          xPercent: f.x[1] * 100,
          ...drehNach,
          z: f.z[1],
          scale: f.skala[1],
          /* Linear. Die Beschleunigung liefert der Daumen des Nutzers; eine
             Kurve obendrauf kämpft dagegen und liest sich als Verzögerung. */
          ease: 'none',
          scrollTrigger: {
            trigger: buehne,
            start: 'top bottom',
            end: 'bottom top',
            /* `1` statt `true`: eine Sekunde Nachlauf. Starr gescrubbt ist
               technisch richtig und fühlt sich mechanisch an — das ist der
               Unterschied, der eine Seite teuer wirken lässt. */
            scrub: SCRUB_KOERPER,
            invalidateOnRefresh: true,
            onToggle: ({ isActive }) => {
              el.style.willChange = isActive ? 'transform' : ''
            },
          },
        },
      )

      /* Die Drehung hängt am SELBEN Fortschritt — kein zweiter ScrollTrigger.
         Zwei Trigger auf derselben Bühne laufen auseinander, sobald einer
         nachgerechnet wird, und dann dreht sich das Gebäck neben seiner
         eigenen Bahn. */
      const drehung = dreher
        ? gsap.fromTo(
            dreher,
            { rotate: f.dreh[0], rotateY: f.drehY[0], rotateX: f.drehX[0] },
            {
              rotate: f.dreh[1],
              rotateY: f.drehY[1],
              rotateX: f.drehX[1],
              ease: 'none',
              scrollTrigger: {
                trigger: buehne,
                start: 'top bottom',
                end: 'bottom top',
                scrub: SCRUB_KOERPER,
                invalidateOnRefresh: true,
              },
            },
          )
        : null

      abraeumen = () => {
        tween.scrollTrigger?.kill()
        tween.kill()
        drehung?.scrollTrigger?.kill()
        drehung?.kill()
        el.style.willChange = ''
        el.style.transform = ''
        if (dreher) dreher.style.transform = ''
      }
    })

    return () => {
      tot = true
      abraeumen?.()
    }
  }, [breitGenug, f.buehne, f.drehZiel, f.y, f.x, f.dreh, f.drehY, f.drehX, f.z, f.skala])

  return ref
}


/**
 * Die Kamerafahrt über dem Ladenfoto.
 *
 * ═══ Wofür das hier der Ersatz ist ═══
 *
 * Karol wollte auf der Startseite „ein Bild vom Laden ganzflächig oder sogar
 * ein Video von oben wie Drohnenfahrt". Eine Drohnenaufnahme ihres Ladens gibt
 * es nicht, und aus dem Netz genommenes Material ist fremdes Material — dafür
 * fehlt jedes Nutzungsrecht. Was BLEIBT, ist ihr eigenes Foto und die Frage,
 * wie man ihm Bewegung gibt, ohne etwas zu erfinden.
 *
 * Die Antwort ist eine Kamerafahrt statt eines Films: das Foto steht beim
 * Laden zu gross und läuft in seine Ruhelage — das ist die CSS-Animation am
 * Rahmen, nicht hier — und schiebt beim Scrollen weiter hinein. Der Zuschauer
 * liest daraus eine Kamera, obwohl sich nur ein Standbild skaliert.
 *
 * ═══ Warum zwei Ebenen ═══
 *
 * Die Einfahrt beim Laden gehört dem Rahmen (CSS), die Fahrt beim Scrollen dem
 * Bild (GSAP). Lägen beide auf demselben Knoten, würde die eine `transform`
 * die andere überschreiben — und zwar still, ohne Fehlermeldung.
 *
 * Anders als `useFlug` läuft das hier AUCH am Handy. Es verdeckt keinen Text
 * und braucht keine freie Bahn; es ist der Grund selbst.
 */
export function useKamerafahrt<T extends HTMLElement>(
  buehneWahl: string,
  von = 1.04,
  bis = 1.13,
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const buehne = el.closest(buehneWahl) ?? el
    let tot = false
    let abraeumen: (() => void) | undefined

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      const { gsap } = werkzeug

      const tween = gsap.fromTo(
        el,
        { scale: von },
        {
          scale: bis,
          /* Ein Hauch Versatz nach oben. Ohne ihn wirkt das Zoomen wie eine
             Lupe; mit ihm wie eine Kamera, die sich hebt. */
          yPercent: -2.5,
          ease: 'none',
          scrollTrigger: {
            trigger: buehne,
            start: 'top top',
            end: 'bottom top',
            scrub: SCRUB_KOERPER,
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
        gsap.set(el, { clearProps: 'all' })
      }
    })

    return () => {
      tot = true
      abraeumen?.()
    }
  }, [buehneWahl, von, bis])

  return ref
}

/** Kurzform für „breiter als ein Telefon". Spart die Zeichenkette an drei Stellen. */
export const useMedienabfrageBreit = (): boolean => useMedienabfrage('(min-width: 1000px)')


/**
 * Auftauchen — ein Block kommt aus der Tiefe an seinen Platz.
 *
 * ═══ Wofür das da ist ═══
 *
 * Die Seite zerfiel in zwei Hälften: oben ein Raum, in dem Gegenstände fliegen,
 * sich drehen und Schatten werfen — unten ein Dokument. Speisekarte, Laden und
 * Bestellen hatten KEINE einzige Bewegung ausser dem Auftritt ihrer
 * Überschriften.
 *
 * Genau das liest sich als „nicht konsistent", ohne dass man es benennen kann:
 * nicht die Werte waren verschieden, sondern die WELT. Ein Gegenstand, der in
 * der Galerie Tiefe hat und in der Karte keine, war nie in einem Raum.
 *
 * ═══ Warum es so klein ist ═══
 *
 * 6 % Grösse und 4 % Fensterhöhe. Das ist bewusst an der Schwelle: man soll es
 * nicht als Animation bemerken, sondern nur merken, dass der Block ankommt
 * statt dazustehen. Eine Speisekarte, deren Gruppen hereinfliegen, ist eine
 * Speisekarte, die man nicht lesen kann.
 *
 * ═══ Warum kein `once` ═══
 *
 * Weil es gescrubbt ist und nicht abgespielt. Ein Auftritt, der einmal läuft,
 * gehört der Überschrift (siehe Auftritt.tsx); dieser hier gehört dem Scroll
 * und läuft rückwärts mit, wenn man zurückscrollt. Beides auf derselben Seite
 * ist kein Widerspruch: das eine ist ein Ereignis, das andere ein Zustand.
 */
export function useAuftauchen<T extends HTMLElement>(tiefe = 1) {
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
        { y: () => 0.04 * tiefe * window.innerHeight, scale: 1 - 0.06 * tiefe, autoAlpha: 0.45 },
        {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            /* Von „taucht am unteren Rand auf" bis „steht im unteren Drittel".
               Nicht bis zur Mitte: dann wäre die halbe Sektion vorbei, bevor
               der Block angekommen ist. */
            start: 'top bottom',
            end: 'top 68%',
            scrub: SCRUB_KOERPER,
            invalidateOnRefresh: true,
            onToggle: ({ isActive }) => {
              el.style.willChange = isActive ? 'transform, opacity' : ''
            },
          },
        },
      )

      abraeumen = () => {
        tween.scrollTrigger?.kill()
        tween.kill()
        el.style.willChange = ''
        gsap.set(el, { clearProps: 'all' })
      }
    })

    return () => {
      tot = true
      abraeumen?.()
    }
  }, [tiefe])

  return ref
}

/**
 * Ein Band wandert WAAGERECHT, während seine Sektion durchs Bild fährt.
 *
 * ═══ Der Unterschied zu `useVersatz` ═══
 *
 * Derselbe Gedanke, andere Achse: dort verschiebt der Scroll ein Element auf
 * der Hochachse, hier auf der Querachse. Getrennte Haken und keine Achse als
 * Parameter, weil beide etwas anderes bedeuten — der eine macht Rhythmus in
 * einer Spalte, der andere führt eine Reihe an einem vorbei.
 *
 * ═══ Warum das KEIN angeheftetes waagerechtes Scrollen ist ═══
 *
 * Die übliche Bauform wäre: Sektion anheften, den Scrollweg in eine
 * waagerechte Fahrt umrechnen. Das hat auf dieser Seite schon einmal drei
 * Runden gekostet — eine angeheftete Sektion HÄLT AN, und der Wechsel von
 * „scrollt" auf „steht" ist ein Bruch, den keine Dämpfung glättet. Karol hat
 * ihn dreimal als „haperig" gemeldet.
 *
 * Hier hält nichts an. Das Band ist breiter als das Fenster und verschiebt
 * sich, solange die Sektion in Sicht ist; die Seite scrollt dabei normal
 * weiter. Man geht an einer Arkade vorbei, statt vor ihr stehenzubleiben.
 *
 * @param tempo Wie weit verschoben wird, in Anteilen der EIGENEN Breite über
 *              die ganze Durchfahrt. Negativ = nach links.
 */
export function useSchub<T extends HTMLElement>(tempo: number) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const buehne = el.closest('section') ?? el
    let tot = false
    let abraeumen: (() => void) | undefined

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      const { gsap } = werkzeug

      const tween = gsap.fromTo(
        el,
        { xPercent: 0 },
        {
          xPercent: tempo * 100,
          ease: 'none',
          scrollTrigger: {
            /* Die SEKTION ist der Auslöser, nicht das Band: hinge er am Band,
               verschöbe sich sein eigener Bereich mit jeder Bewegung. */
            trigger: buehne,
            start: 'top bottom',
            end: 'bottom top',
            /* Eine Fläche, kein Körper — siehe BEWEGUNG.md, Regel 3. */
            scrub: SCRUB_FLAECHE,
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
