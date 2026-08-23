import { useEffect, useRef, useState } from 'react'

import reiseRoh from '../../inhalt/reise.json'
import { useFlug, useMedienabfrage, werkzeugHolen } from '../bewegung.ts'
import Dampf from './ui/Dampf.tsx'
import Funken from './ui/Funken.tsx'
import Kaesefaeden from './ui/Kaesefaeden.tsx'
import Mehlwolke from './ui/Mehlwolke.tsx'
import { Kopf, Sektion } from './ui/bausteine.tsx'

type Mass = { breite: number; hoehe: number }
const M = reiseRoh as Record<string, Mass>

/**
 * Die Reise — das Käseschiff FLIEGT mit, und reisst erst am Ende.
 *
 * ═══ Was an den beiden Vorfassungen falsch war ═══
 *
 * Fassung 1 liess drei Gegenstände nacheinander durch eine angeheftete Bühne
 * fliegen. Fassung 2 machte daraus einen einzigen, sehr grossen, der aus der
 * Tiefe kam und aufbrach. Karol zu beiden: falsch.
 *
 * Sein Bild ist ein anderes, und er hat es genau beschrieben: „wenn man
 * scrollt, soll das Käseschiff mit dem Scrollen mit runtergehen … wie so ein
 * magischer Cursor als Pide." Nicht auftreten und stehen bleiben, sondern
 * MITKOMMEN. Und: „nicht so gross wie in dieser einen Sektion … drei bis vier
 * oder fünf Mal so gross wie die Dinger, die da rumfliegen."
 *
 * Damit fällt die Anheftung weg. Eine angeheftete Bühne HÄLT AN — und ein
 * Gegenstand, der einen begleitet, kann nicht anhalten. Er hängt jetzt am
 * Scroll und läuft ihm nach: die Seite zieht hoch, das Schiff bleibt zurück
 * und wandert dadurch langsam über den Bildschirm.
 *
 * ═══ Und das Abreissen ═══
 *
 * „Das muss voneinander am Ende, wenn man unten ist, getrennt werden … als
 * würde man ein Käseschiff so in ein Stück abreissen, wie im echten Leben."
 *
 * Der Riss steht deshalb ganz am Schluss der Sektion, nicht in ihrer Mitte, und
 * er ist kein Auseinanderschieben mehr: zwischen den Hälften stehen Käsefäden,
 * die sich straffen, einschnüren und nacheinander reissen. Was aus zwei
 * verschobenen Bildhälften ein Abreissen macht, ist der WIDERSTAND — siehe
 * ui/Kaesefaeden.tsx.
 */
export default function Reise() {
  const schmal = useMedienabfrage('(max-width: 719px)')
  const buehne = useRef<HTMLDivElement>(null)
  const schiff = useRef<HTMLDivElement>(null)
  const links = useRef<HTMLImageElement>(null)
  const rechts = useRef<HTMLImageElement>(null)
  const bruchdampf = useRef<HTMLDivElement>(null)
  const [mehlstoss, setMehlstoss] = useState(0)

  /**
   * Der Flug. Er hängt an der SEKTION, nicht am Schiff — hinge er am Schiff,
   * verschöbe sich sein eigener Auslösebereich mit jeder Bewegung.
   *
   * `y` von −0,45 auf 0,55 Fensterhöhen: das Schiff beginnt oberhalb der Mitte
   * und endet darunter. Es wandert also über die ganze Durchfahrt langsam nach
   * unten, während die Seite nach oben zieht — das ist das Begleiten, das
   * Karol meint. Ein Gegenstand, der GEGEN den Scroll steigt, zieht vorbei;
   * einer, der mit ihm sinkt, bleibt bei einem.
   */
  const flug = useFlug<HTMLDivElement>({
    /* Von 0 auf 2,05 Fensterhöhen. Die erste Fassung stand auf −0,45 bis 0,55
       und ist gemessen GESTIEGEN statt zu sinken: die Sektion scrollt über ihre
       ganze Länge an einem vorbei — knapp drei Fensterhöhen — und ein
       Gegenstand, der dabei nur eine Fensterhöhe mitwandert, bleibt netto
       zurück und läuft nach oben aus dem Bild.
       Damit er MITKOMMT, muss er fast so weit wandern wie die Sektion lang
       ist. Bei 2,05 sinkt er sichtbar, ohne die Sektion zu verlassen. */
    /* Ein knappes Drittel Bildschirmhöhe Drift, nicht mehr. Das Kleben hält
       den Gegenstand im Bild; die Bahn gibt ihm nur die Bewegung darin.
       Frühere Fassungen haben beides über die Bahn lösen wollen und sind
       gestiegen statt zu sinken. */
    y: [-0.16, 0.3],
    x: [-6, 6],
    dreh: [-9, 7],
    drehY: [-16, 14],
    drehX: [7, -5],
    z: [-140, 40],
    skala: [0.86, 1.06],
    buehne: '.reise',
    abBreite: 0,
  })

  useEffect(() => {
    const b = buehne.current
    if (!b) return

    let tot = false
    let abraeumen: (() => void) | undefined

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      const { gsap, ScrollTrigger } = werkzeug
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set([links.current, rechts.current], { xPercent: 0, rotationY: 0 })
        gsap.set(bruchdampf.current, { autoAlpha: 0 })
        gsap.set(b, { '--spanne': 0 })

        /**
         * Der Riss — die letzten dreissig Prozent der Sektion.
         *
         * Er hat einen EIGENEN Auslöser und hängt nicht am Flug: der Flug
         * beginnt, sobald die Sektion von unten ins Bild kommt, der Riss erst,
         * wenn man wirklich unten ist. Zwei Ereignisse, zwei Bereiche.
         *
         * `--spanne` ist der gemeinsame Takt: die Hälften lesen sie über ihre
         * eigenen Tweens, die Käsefäden lesen sie in jedem Frame aus dem
         * berechneten Stil. Eine Zahl, drei Verbraucher — so kann nichts
         * auseinanderlaufen.
         */
        const riss = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: b,
            /* Erst am ENDE. Die erste Fassung begann eine Vierteilfensterhöhe
               BEVOR die Sektion unten ankam und war bei halbem Weg schon fertig
               — gemessen Spanne 1,0 bei 50 %. Karol: „das muss voneinander am
               Ende, wenn man unten ist, getrennt werden."
               Jetzt beginnt der Riss, wenn die Unterkante der Sektion die
               Unterkante des Fensters erreicht, und braucht dafür eine halbe
               Fensterhöhe. */
            start: 'bottom bottom',
            end: 'bottom bottom-=55%',
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        riss.to(b, { '--spanne': 1, duration: 1 }, 0)
        /* Die Hälften kippen nach VORN auf: der Blick fällt in das Gebäck
           hinein statt daran vorbei. Man soll Käse sehen, nicht Rinde. */
        riss.to(links.current, { xPercent: -30, rotationY: 30, duration: 1 }, 0)
        riss.to(rechts.current, { xPercent: 30, rotationY: -30, duration: 1 }, 0)
        /* Dampf kommt erst, wenn der Spalt da ist — und bleibt danach. */
        riss.to(bruchdampf.current, { autoAlpha: 1, duration: 0.45 }, 0.2)

        /* Der Mehlstoss beim Eintreten: ein EREIGNIS, keine Zeile in einer
           gescrubbten Leiste. Rückwärts abgespielt wäre eine Wolke, die ins
           Blech zurückspringt. */
        const stoss = ScrollTrigger.create({
          trigger: b,
          start: 'top center',
          end: 'top top',
          onEnter: () => setMehlstoss((n) => n + 1),
          onEnterBack: () => setMehlstoss((n) => n + 1),
          invalidateOnRefresh: true,
        })

        return () => {
          stoss.kill()
          riss.scrollTrigger?.kill()
          riss.kill()
          gsap.set([links.current, rechts.current, bruchdampf.current, b], { clearProps: 'all' })
        }
      })

      ScrollTrigger.refresh()
      abraeumen = () => mm.revert()
    })

    return () => {
      tot = true
      abraeumen?.()
    }
  }, [])

  return (
    <Sektion id="reise" grund="tief" klasse="reise" beschriftetVon="reise-titel">
      <div className="reise__buehne" ref={buehne}>
        <Funken klasse="reise__funken" menge={schmal ? 14 : 28} />

        <div className="schale reise__wort">
          <Kopf
            id="reise-titel"
            etikett="Ofenfrisch"
            titel="Und dann bricht es auf"
            lead="Zweiundzwanzig Sorten Fata’er, von Hand gerollt und erst bei deiner Bestellung belegt. Das Käseschiffchen kommt als Letztes aus dem Ofen — und hält am längsten warm."
          />
        </div>

        <div className="reise__flug" ref={flug} aria-hidden="true">
          <div className="reise__mehl">
            <Mehlwolke stoss={mehlstoss} menge={schmal ? 40 : 84} />
          </div>

          <div className="reise__schiff" ref={schiff}>
            {/* Dampf HINTER den Hälften: er kommt aus dem Spalt, nicht davor. */}
            <div className="reise__bruchdampf" ref={bruchdampf}>
              <Dampf ton="hell" />
            </div>
            <img
              ref={links}
              className="reise__haelfte reise__haelfte--links"
              src="/bilder/reise/schiff-links.webp"
              width={M['schiff-links']!.breite}
              height={M['schiff-links']!.hoehe}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <img
              ref={rechts}
              className="reise__haelfte reise__haelfte--rechts"
              src="/bilder/reise/schiff-rechts.webp"
              width={M['schiff-rechts']!.breite}
              height={M['schiff-rechts']!.hoehe}
              alt=""
              loading="lazy"
              decoding="async"
            />
            {/* Die Fäden liegen ÜBER den Hälften: sie spannen zwischen den
                Bruchflächen, und eine Bruchfläche liegt vorne. */}
            <Kaesefaeden klasse="reise__faeden" menge={schmal ? 6 : 10} />
          </div>
        </div>
      </div>
    </Sektion>
  )
}
