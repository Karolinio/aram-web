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
const werkzeugHolen = (): Promise<Werkzeug | null> => {
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
            scrub: true,
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
          scrub: 1,
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

      const tween = gsap.fromTo(
        el,
        {
          y: () => f.y[0] * window.innerHeight,
          xPercent: f.x[0] * 100,
          rotate: f.dreh[0],
          rotateY: f.drehY[0],
          rotateX: f.drehX[0],
          z: f.z[0],
          scale: f.skala[0],
        },
        {
          y: () => f.y[1] * window.innerHeight,
          xPercent: f.x[1] * 100,
          rotate: f.dreh[1],
          rotateY: f.drehY[1],
          rotateX: f.drehX[1],
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
            scrub: 1,
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
  }, [breitGenug, f.buehne, f.y, f.x, f.dreh, f.drehY, f.drehX, f.z, f.skala])

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
            scrub: 1,
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
