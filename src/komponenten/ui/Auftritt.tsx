import { Fragment, useEffect, useRef } from 'react'

import { werkzeugHolen } from '../../bewegung.ts'

/**
 * Der Auftritt einer Überschrift — wortweise aus der Maske.
 *
 * ═══ Was es ist ═══
 *
 * Jedes Wort sitzt in einem Kasten, der beschneidet, und steigt beim
 * Hereinscrollen von unten hinein — leicht versetzt, Wort für Wort. Es sieht
 * aus, als würde die Zeile gesetzt, während man sie liest.
 *
 * ═══ Warum nicht einfach einblenden ═══
 *
 * Ein Einblenden sieht man an jeder zweiten Seite; es ist die Voreinstellung
 * jeder Animationsbibliothek. Der Unterschied liegt in der MASKE: das Wort ist
 * nicht durchsichtig und wird sichtbar, es ist ABWESEND und kommt herein. Bei
 * SSENSE und Eat Hungry Tiger (Mobbin) trägt genau dieser Griff die ganze
 * Startseite — dort ist die Schrift die Gestaltung, und sie wird eingeführt
 * statt eingeblendet.
 *
 * ═══ Warum ohne Bibliothek ═══
 *
 * Der übliche Weg wäre SplitText von GSAP. Das ist ein Zusatzpaket und misst
 * zur Laufzeit ZEILEN — es teilt nach dem Umbruch, also muss es bei jeder
 * Fensteränderung neu rechnen. Hier wird nach WÖRTERN geteilt, und die kennt
 * React schon: der Titel ist eine Zeichenkette, die Aufteilung passiert beim
 * Rendern und übersteht jeden Umbruch ohne eine einzige Messung.
 *
 * ═══ Die Fallen, die hier gelöst sind ═══
 *
 *   Unterlängen   Ein Kasten mit `overflow: clip` schneidet das g von „gibt"
 *                 ab. Deshalb Innenabstand unten und derselbe Betrag als
 *                 negativer Aussenabstand — der Kasten wird tiefer, die Zeile
 *                 bleibt, wo sie war.
 *   Leerzeichen   Zwischen den Kästen steht ein echtes Leerzeichen als eigener
 *                 Textknoten NEBEN dem Kasten, nicht darin. Innen wäre es am
 *                 Ende eines `inline-block` verschluckt: die Zeile könnte dort
 *                 nicht mehr umbrechen, und ein Vorleseprogramm läse
 *                 „Wasesgibt".
 *   Sprung        Die Maske darf am Ende NICHT aufgehoben werden: `overflow`
 *                 bestimmt bei einem `inline-block` mit, wo seine Grundlinie
 *                 liegt. Sie nachträglich zu lösen rechnet die Zeilenhöhe neu
 *                 und schiebt alles darunter. Der Innenabstand allein fängt
 *                 die Unterlängen.
 *   Kein GSAP     Der Startzustand steht im CSS. Kommt die Bibliothek nicht
 *                 (Funkloch, blockierendes Netz), bliebe die Überschrift für
 *                 immer unsichtbar — deshalb wird sie in genau dem Fall von
 *                 Hand aufgedeckt.
 */

type Props = {
  children: string
  /** Wie stark die Wörter nacheinander kommen, in Sekunden. */
  versatz?: number
}

export default function Auftritt({ children, versatz = 0.06 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const woerter = [...el.querySelectorAll<HTMLElement>('.auftritt__in')]
    if (woerter.length === 0) return

    /**
     * Aufdecken heisst: Verwandlung weg, Ebene weg. Die MASKE BLEIBT.
     *
     * Erster Versuch hob am Ende auch `overflow: clip` auf, gegen das
     * Beschneiden von Unterlängen. Das war doppelt gemoppelt — dafür gibt es
     * schon den Innenabstand — und es kostete einen Sprung: bei einem
     * `inline-block` bestimmt `overflow` mit, wo seine Grundlinie liegt. Fällt
     * die Beschneidung weg, rechnet der Browser die Zeilenhöhe neu, und alles
     * darunter rutscht.
     *
     * Gemessen hat es der Fabrikprüfer: CLS 0,080 am Handy, grösster Sprung
     * 0,070 — und als Quelle standen genau diese Wortkästen im Befund.
     */
    const aufdecken = () => {
      for (const w of woerter) {
        w.style.transform = 'none'
        w.style.willChange = ''
      }
    }

    /* Bei reduzierter Bewegung steht die Zeile einfach da. Der Auftritt ist
       Schmuck; die Überschrift ist Inhalt. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      aufdecken()
      return
    }

    let tot = false
    let abraeumen: (() => void) | undefined

    void werkzeugHolen().then((werkzeug) => {
      if (tot) return
      if (!werkzeug) {
        aufdecken()
        return
      }
      const { gsap } = werkzeug

      const tween = gsap.to(woerter, {
        yPercent: 0,
        rotate: 0,
        /* NICHT `ease: 'none'`. Das gilt für gescrubbte Zeitleisten, wo der
           Daumen die Beschleunigung liefert. Hier läuft die Bewegung von
           selbst ab, und dann braucht sie eine Kurve — sonst fährt sie wie
           ein Aufzug. */
        ease: 'expo.out',
        duration: 1.05,
        stagger: versatz,
        scrollTrigger: {
          trigger: el,
          /* Erst wenn die Zeile wirklich im Blick ist. Bei 100 % liefe der
             Auftritt ab, während sie noch unter der Falz steht. */
          start: 'top 88%',
          /**
           * Die Ebene wird HIER reserviert, nicht im Stilblatt.
           *
           * Der Fabrikprüfer hat den Unterschied gemessen: mit `will-change`
           * im CSS hielten 30 Wörter ab dem Laden eine eigene
           * Compositor-Ebene, ohne je im Bild gewesen zu sein. Jetzt bekommt
           * sie ein Wort in dem Moment, in dem es tatsächlich losläuft — und
           * `aufdecken` nimmt sie danach wieder weg.
           */
          onEnter: () => {
            for (const w of woerter) w.style.willChange = 'transform'
          },
          /* EINMAL. Eine Überschrift, die bei jedem Vorbeiscrollen neu
             auftaucht, ist ein Wackelkontakt, kein Auftritt. */
          once: true,
        },
        /* Danach die Ebene wieder abräumen — siehe `aufdecken`. */
        onComplete: aufdecken,
      })

      abraeumen = () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    })

    return () => {
      tot = true
      abraeumen?.()
    }
  }, [versatz, children])

  const woerter = children.split(' ')

  return (
    <span className="auftritt" ref={ref}>
      {woerter.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span className="auftritt__wort">
            <span className="auftritt__in">{w}</span>
          </span>
          {i < woerter.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </span>
  )
}
