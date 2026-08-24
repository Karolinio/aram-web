import { useEffect, useRef } from 'react'

import vorhangRoh from '../../inhalt/vorhang.json'
import { SCRUB_KOERPER, useMedienabfrage, werkzeugHolen } from '../bewegung.ts'
import { Etikett } from './ui/bausteine.tsx'

type Mass = { breite: number; hoehe: number }
const M = vorhangRoh as Record<string, Mass>

/**
 * Der Vorhang — eine Scheibe dreht sich, teilt sich, und dahinter liegt die Karte.
 *
 * ═══ Was Karol beschrieben hat ═══
 *
 * „Vielleicht auch mal so probieren: ein rotes Manakisch, was sich so dreht,
 * einfach um sich selbst, aber so flach, wie ein Pfannkuchen … ein grosses,
 * komplett grossflächiges: Du scrollst, das zerteilt sich, und dann kommt die
 * nächste Sektion da so reingeflogen."
 *
 * Genau das, in einer angehefteten Bühne: die Scheibe kommt von unten, dreht
 * sich einmal um sich selbst, wächst über den Bildschirm hinaus — und teilt
 * sich dann zur Seite, während dahinter die Einladung zur Karte hereinfliegt.
 *
 * ═══ Warum das NICHT dasselbe ist wie der Riss am Käseschiff ═══
 *
 * Zwei Effekte, die gleich aussehen, sind eine Wiederholung. Diese beiden
 * unterscheiden sich in allem, was zählt:
 *
 *   Käseschiff   REISST. Unregelmässige Bruchkante, Käsefäden dazwischen,
 *                langsam, die Hälften bleiben im Bild. Ein Gebäck geht auf.
 *   Vorhang      ÖFFNET. Ruhige Kante, keine Fäden, schnell, die Hälften fahren
 *                ganz aus dem Bild. Etwas gibt den Blick frei.
 *
 * Der Unterschied steckt schon im Bild: werkzeug/vorhang.py schneidet mit einem
 * Drittel der Streuung des Schiffs.
 *
 * ═══ Warum der Text HINTER der Scheibe liegt ═══
 *
 * Bei Eat Hungry Tiger nachgesehen (Mobbin): dort deckt das Produkt die
 * Schlagzeile teilweise ab — „A NEW ANGLE OF FLAVO[R]", das R liegt hinter dem
 * Glas. Genau das macht aus einem Bild in einem Kasten einen GEGENSTAND IM
 * RAUM. Eine Seite, auf der jedes Element seinen eigenen Platz respektiert, ist
 * ein Raster; eine, auf der sich Ebenen überlagern, hat Tiefe.
 *
 * Das gilt hier und ausdrücklich NICHT für das fliegende Käseschiff: dort ist
 * die Überlagerung nicht komponiert, sondern zufällig — es fliegt, und was
 * gerade darunter liegt, entscheidet der Scrollstand. Komponierte Überlagerung
 * ist Tiefe, zufällige ist ein Fehler.
 */

/** Wo im Verlauf sich die Scheibe teilt. Davor dreht sie, danach fliegt die Karte herein. */
const TEILT_AB = 0.46
const TEILT_BIS = 0.78

const glatt = (t: number) => t * t * (3 - 2 * t)
const klemmen = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)

/** Ein Fenster mit weichen Rändern: 0 draussen, 1 drinnen, dazwischen glatt. */
function fenster(p: number, von: number, bis: number, rand = 0.06): number {
  if (p <= von - rand || p >= bis + rand) return 0
  if (p < von) return glatt((p - (von - rand)) / rand)
  if (p > bis) return glatt((bis + rand - p) / rand)
  return 1
}

export default function Vorhang() {
  const ruhig = useMedienabfrage('(prefers-reduced-motion: reduce)')
  const buehne = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const b = buehne.current
    if (!b || ruhig) return

    const links = b.querySelector<HTMLElement>('.vorhang__haelfte--links')
    const rechts = b.querySelector<HTMLElement>('.vorhang__haelfte--rechts')
    const wort = b.querySelector<HTMLElement>('.vorhang__wort')
    const karte = b.querySelector<HTMLElement>('.vorhang__einladung')
    if (!links || !rechts) return

    let tot = false
    let abraeumen: (() => void) | undefined

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      const { gsap, ScrollTrigger } = werkzeug

      /* Über ein Hilfsobjekt, nicht über `self.progress`: der Scrub glättet die
         verknüpfte Animation, nicht die Rohmeldung. Wer `onUpdate` fragt,
         bekommt den ungeglätteten Wert zurück — und damit das harte
         Scrollgefühl, das auf dieser Seite zweimal beanstandet wurde. */
      const zustand = { p: 0 }

      const zeichnen = () => {
        const p = zustand.p
        const auf = klemmen((p - TEILT_AB) / (TEILT_BIS - TEILT_AB))
        const weich = glatt(auf)

        /**
         * Die Drehung. Sie läuft über die GANZE Durchfahrt weiter, auch beim
         * Öffnen — eine Scheibe, die sich dreht und beim Teilen plötzlich
         * stillsteht, sieht aus, als hätte jemand den Film angehalten.
         *
         * 232 Grad, nicht 360: eine volle Umdrehung endet dort, wo sie
         * begonnen hat, und dann war die Drehung umsonst. Bei etwa zwei
         * Dritteln steht die Scheibe sichtbar anders als am Anfang.
         */
        const dreh = p * 232
        /* Sie kommt von unten und wächst. `skala` läuft weiter, während sie
           sich teilt — das Auseinanderfahren wird dadurch schneller, als es
           gerechnet ist. */
        const skala = 0.6 + p * 0.72
        /* Sie steht schon im ersten Bild der Sektion, nur tiefer und kleiner.
           Bei 46 vh Startversatz war das erste Bild der Sektion schwarz und
           leer — gemessen ein ganzer Bildschirm ohne Inhalt, bevor überhaupt
           etwas passiert. Eine angeheftete Bühne, die leer beginnt, liest sich
           als Ladefehler. */
        const hoch = (1 - glatt(klemmen(p / 0.2))) * 17

        /**
         * ═══ Die Drehung gehört der SCHEIBE, das Auseinanderfahren den HÄLFTEN ═══
         *
         * Erst stand beides auf denselben Knoten: `translate3d(…) rotate(…)`
         * je Hälfte. In CSS verschiebt `translate` dann in den Achsen des
         * ELTERNBLOCKS, während die Bruchkante mit der Drehung mitwandert. Bei
         * 139 Grad lag sie schräg, und die Hälften schoben sich seitlich
         * aneinander vorbei statt auseinander — gemessen und im Bild sofort zu
         * sehen: eine Schere, kein Vorhang.
         *
         * Jetzt dreht sich die Scheibe als Ganzes, und die Hälften fahren in
         * IHREN Achsen auseinander. Damit liegt die Bewegung immer senkrecht
         * auf der Bruchkante, egal wie weit gedreht ist.
         */
        const scheibe = links.parentElement
        if (scheibe) {
          scheibe.style.transform =
            `translate3d(0, ${hoch}vh, 0) rotate(${dreh}deg) scale(${skala})`
        }
        /* 130 % der eigenen Breite: auch auf einem breiten Bildschirm ist dann
           nichts mehr zu sehen. */
        const weg = weich * 130
        links.style.transform = `translateX(${-weg}%) rotate(${-weich * 9}deg)`
        rechts.style.transform = `translateX(${weg}%) rotate(${weich * 9}deg)`

        /* Die Schlagzeile dahinter geht mit der Scheibe: sie ist am Anfang da,
           wird von ihr verdeckt und verschwindet, wenn die Einladung kommt.
           Zwei Aussagen gleichzeitig sind keine. */
        /* Ab dem ERSTEN Bild der Sektion. Bei 0,06 öffnete sie mit einer leeren
           schwarzen Fläche, in die eine Scheibe von unten hereinkroch — der
           Vorhang begann, bevor irgendetwas zu sehen war. */
        if (wort) wort.style.opacity = String(fenster(p, 0.0, 0.5, 0.04))

        /* Und die Karte fliegt herein — aus der Tiefe, nicht von der Seite:
           sie kommt DURCH den Spalt, nicht daran vorbei. */
        const ein = glatt(klemmen((p - 0.52) / 0.34))
        if (karte) {
          karte.style.opacity = String(ein)
          karte.style.transform =
            `translate3d(0, ${(1 - ein) * 16}vh, 0) scale(${0.82 + ein * 0.18})`
        }
      }

      const tween = gsap.to(zustand, {
        p: 1,
        ease: 'none',
        onUpdate: zeichnen,
        scrollTrigger: {
          trigger: b.closest('.vorhang') ?? b,
          start: 'top top',
          end: 'bottom bottom',
          scrub: SCRUB_KOERPER,
          invalidateOnRefresh: true,
        },
      })

      zeichnen()
      ScrollTrigger.refresh()

      abraeumen = () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    })

    return () => {
      tot = true
      abraeumen?.()
    }
  }, [ruhig])

  return (
    <section className="sektion sektion--nacht vorhang" aria-labelledby="vorhang-titel">
      <div className="vorhang__buehne" ref={buehne}>
        {/* Die Schlagzeile liegt UNTER der Scheibe — siehe Kopf der Datei. */}
        <p className="vorhang__wort" aria-hidden="true">
          Und alles frisch belegt
        </p>

        <div className="vorhang__scheibe" aria-hidden="true">
          <img
            className="vorhang__haelfte vorhang__haelfte--links"
            src="/bilder/vorhang/scheibe-links.webp"
            width={M['scheibe-links']!.breite}
            height={M['scheibe-links']!.hoehe}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <img
            className="vorhang__haelfte vorhang__haelfte--rechts"
            src="/bilder/vorhang/scheibe-rechts.webp"
            width={M['scheibe-rechts']!.breite}
            height={M['scheibe-rechts']!.hoehe}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Was durch den Spalt hereinkommt. Es steht IM Baum, nicht in einer
            zweiten Sektion: ein Vorleseprogramm liest hier einmal, was ein
            sehendes Auge einmal sieht. */}
        <div className="vorhang__einladung">
          <Etikett>Die Karte</Etikett>
          <h2 className="vorhang__zahl" id="vorhang-titel">
            Zweiundzwanzig Sorten
          </h2>
          <p className="vorhang__zeile">
            Keine liegt vorgebacken herum. Belegt wird, wenn du bestellst.
          </p>
          <a className="knopf vorhang__knopf" href="#karte">
            Zur Karte
          </a>
        </div>
      </div>
    </section>
  )
}
