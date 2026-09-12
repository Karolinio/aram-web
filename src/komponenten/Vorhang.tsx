import { useEffect, useRef } from 'react'

import vorhangRoh from '../../inhalt/vorhang.json'
import { SCRUB_KOERPER, useMedienabfrage, werkzeugHolen } from '../bewegung.ts'
import { inhalt } from '../inhalt.ts'
import Dampf from './ui/Dampf.tsx'

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

/**
 * Sechs Gerichte als Probe — aus DERSELBEN Quelle wie die Speisekarte.
 *
 * Nicht abgetippt: eine zweite Liste wäre eine zweite Wahrheit, und sie stünde
 * spätestens dann falsch da, wenn der Inhaber im Editor einen Preis ändert.
 *
 * Fünf, weil ein Zettel, den man in einem Blick liest, höchstens so viele
 * Zeilen hat. Es sind die ersten sechs ihrer eigenen Nummerierung — also die,
 * die auch auf dem Blatt an ihrer Wand oben stehen.
 */
const ALLE = inhalt.speisekarte.flatMap((gr) => gr.gerichte)
const PROBE = ALLE.filter((g): g is typeof g & { preis: number } => g.preis !== null).slice(0, 5)
const ZAHL_REST = ALLE.length - PROBE.length

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
    const dampf = b.querySelector<HTMLElement>('.vorhang__dampf')
    const licht = b.querySelector<HTMLElement>('.vorhang__licht')
    const marke = b.querySelector<HTMLElement>('.vorhang__marke')
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

        /* ═══ Der Dampf hoert auf, wenn die Scheibe aufbricht ═══

           Karol am 10.09.: „Der Dampf ist in Ordnung, aber dass er, während
           das schon voneinander getrennt ist, macht überhaupt keinen Sinn."

           Er hat recht: Dampf steigt von einem GANZEN Gebäck auf. Sobald die
           Hälften auseinanderfahren, ist die Quelle weg, und was dann noch
           aufsteigt, gehört zu nichts mehr.

           Er geht früher als die Hälften: bei `weich * 2.2` ist er schon
           verschwunden, wenn sie sich um ein Viertel geöffnet haben. Dampf,
           der bis zum letzten Moment mitläuft, wirkt wie ein Nachzügler. */
        if (dampf) dampf.style.opacity = String(Math.max(0, 1 - weich * 2.2))

        /* Licht und Beschriftung gehoeren zum GANZEN Fladen. Sobald er
           aufbricht, ist der Gegenstand weg, den sie beleuchten und benennen —
           also gehen sie mit. Etwas frueher als der Dampf, damit die Buehne
           leer ist, wenn die Karte hereinkommt. */
        const ab = String(Math.max(0, 1 - weich * 2.6))
        if (licht) licht.style.opacity = ab
        if (marke) marke.style.opacity = ab

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
        {/* ═══ Hier stand „Mehr als 25 Jahre" ═══

            Karol am 26.08.: „Diese 25 Jahre musst du rausnehmen bei diesem
            Lahmacun."

            Die Zahl stimmt und steht auf ihrem Ladenschild — sie stand nur an
            der falschen Stelle. Eine Schlagzeile hinter einem Gegenstand, der
            sie zur Hälfte verdeckt, funktioniert nur, wenn man sie ohnehin
            nicht lesen muss. „Mehr als 25 Jahre" ist aber eine Auskunft, kein
            Ornament: halb verdeckt ist sie halb verschenkt.

            Sie gehört in „Der Laden", wo Anschrift und Zeiten stehen. Dort
            steht sie jetzt. */}

        {/* ═══ Licht und Boden ═══

            Karol am 11.09.: „die lahmacun sektion ist auch noch etwas zu
            unprofessionell … iteriere mit mobbin wie wir das besser in
            szene setzen."

            Bei Mobbin nachgesehen — Artisan Kitchen (v0) und Squarespace
            zeigen beide dasselbe: ein Produkt auf dunklem Grund braucht eine
            LICHTQUELLE und einen BODEN, sonst ist es ein Aufkleber. Bei ihnen
            liegt hinter der Ware eine warme Lichtinsel und darunter ein
            weicher Kontaktschatten; deshalb sieht man einen Gegenstand, der
            irgendwo liegt, statt eines Bildes, das aufgeklebt wurde.

            ═══ Der warme Schein ist wieder RAUS ═══

            Karol am 11.09.: „diesen orangen Schatten kannst du rausnehmen, den
            finde ich unpassend."

            Er hatte doppelt recht. Der Schein war nicht nur Geschmackssache,
            er hat die ganze Sektion nach rechts gezogen: mit `150vw` war er
            auf einem 393-px-Handy 590 px breit, und weil alle Kinder in
            DERSELBEN Rasterzelle liegen, wurde die Zelle 590 breit. Zentriert
            wurde danach in dieser Zelle und nicht im Fenster — gemessen stand
            die Scheibe 97 px ueber dem rechten Rand und das Kartenblatt 40.

            Geblieben ist nur der Kontaktschatten, und der ist nicht orange
            sondern schwarz: er ist das, was den Fladen auf etwas STELLT.
            `position: absolute` nimmt ihn aus dem Raster heraus — was nicht im
            Fluss liegt, kann die Zelle nicht mehr aufblaehen.

            Eigenes Element und kein `::before` an der Scheibe: die Scheibe
            DREHT sich (232 Grad ueber die Sektion), und ein Schatten, der
            mitdreht, liegt nicht mehr unten. */}
        <div className="vorhang__licht" aria-hidden="true" />

        <div className="vorhang__scheibe" aria-hidden="true">
          {/* ═══ Er dampft ═══

              Karol am 10.09.: „Der Lahmacun muss noch ein bisschen dampfen …
              weil das ja im Endeffekt auch die erste Sektion nach dem Video
              ist."

              Er hat recht, und zwar aus einem Grund, der nicht Geschmack ist:
              was hier steht, ist ein Foto von einem Gegenstand, der auf einem
              Brett lag. Ein Foto hat keine Zeit. Dampf ist das einzige
              Element auf dieser Seite, das man nicht fotografieren kann —
              deshalb wird er gerechnet, und deshalb ist er hier richtig: er
              gibt dem Standbild das Jetzt zurueck.

              Elf Schwaden — Karol am 11.09.: „der Lahmacun soll noch mehr
              dampfen." Zwanzig Ueber EINEM Fladen lesen sich
              zwanzig als Brand — steht so im Kopf von Dampf.tsx.

              Ton `ofen` und nicht `hell`: `hell` hat einen Kern mit 0,85
              Deckkraft, und auf dem dunklen Grund neben der warmen Lichtinsel
              stand da kein Dampf, sondern ein grauer Fleck. `ofen` ist warm,
              faellt streng nach aussen ab und ist heller als jeder Grund
              dieser Seite — dafuer wurde er gebaut. */}
          <Dampf ton="ofen" klasse="vorhang__dampf" dichte={11} />
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

        {/* ═══ Was durch den Spalt hereinkommt: eine KARTE ═══

            Karol am 26.08.: „Dieses 22 Sorten, jede von Hand und so, weg damit
            … nachdem der Lahmacun auf ist, soll einfach so eine schön designte
            Karte, und dann steht da so ‚Zur Karte' drunter."

            Vorher stand dort eine Schlagzeile mit einem Versprechen. Das war
            zweimal falsch: die Zahl steht schon weiter oben, und eine
            Behauptung ist kein Beweis. Eine Karte mit echten Namen und echten
            Preisen ist einer.

            Die Gerichte kommen aus derselben Quelle wie die Speisekarte —
            wenn der Inhaber im Editor einen Preis ändert, ändert er sich hier
            mit. Eine zweite, abgetippte Liste wäre eine zweite Wahrheit. */}
        <div className="vorhang__einladung">
          <div className="kartenblatt">
            <p className="kartenblatt__kopf">
              {/* Arabisch, wie es über ihrer Tür steht: „Orientalisches
                  Gebäck". Reem Kufi bringt die arabische Untergruppe mit —
                  geladen wird sie nur, weil hier tatsächlich arabische Zeichen
                  vorkommen. Das entscheidet der `unicode-range` der Schrift,
                  nicht wir. */}
              <span className="kartenblatt__arabisch" lang="ar" dir="rtl">
                مخبوزات شرقية
              </span>
              <span className="kartenblatt__ort">Aram · Bonn-Hardtberg</span>
            </p>

            <ul className="kartenblatt__liste">
              {PROBE.map((g) => (
                <li key={g.name}>
                  <span className="kartenblatt__nr">{g.nr}</span>
                  <span className="kartenblatt__name">{g.name}</span>
                  <span className="kartenblatt__leiter" aria-hidden="true" />
                  <span className="kartenblatt__preis">
                    {g.preis.toFixed(2).replace('.', ',')} €
                  </span>
                </li>
              ))}
            </ul>

            <p className="kartenblatt__fuss">und {ZAHL_REST} weitere</p>
          </div>

          <a className="knopf vorhang__knopf" href="#karte">
            Zur Karte
          </a>
        </div>
      </div>
    </section>
  )
}
