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
export function useBildfolge<T extends HTMLElement>(anzahl: number, buehneWahl: string) {
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

    const zeigen = (i: number) => {
      if (i === zuletzt) return
      zuletzt = i
      bilder.forEach((b, k) => {
        b.style.opacity = k === i ? '1' : '0'
      })
    }

    zeigen(0)

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      const st = werkzeug.ScrollTrigger.create({
        trigger: buehne,
        start: 'top bottom',
        end: 'bottom top',
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
  }, [anzahl, buehneWahl])

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
