import { useEffect, useRef, useState } from 'react'

import reiseRoh from '../../inhalt/reise.json'
import { useMedienabfrage, werkzeugHolen } from '../bewegung.ts'
import Dampf from './ui/Dampf.tsx'
import Funken from './ui/Funken.tsx'
import Mehlwolke from './ui/Mehlwolke.tsx'
import { Sektion } from './ui/bausteine.tsx'

type Mass = { breite: number; hoehe: number }
const M = reiseRoh as Record<string, Mass>

/**
 * Die Reise — EIN Gegenstand, gross, der aufbricht.
 *
 * ═══ Von vier Takten auf einen ═══
 *
 * Vorher flogen hier drei Gegenstände nacheinander durch: eine Scheibe, ein
 * Fatayer, dann das Schiffchen. Karol nach dem Ansehen: „ich glaube es ist
 * nichts davon geeignet für diese Scroll-Reise, ich sag ehrlich hässlich. Das
 * Käseschiff sollte XL grossflächig als EINZELNE Animation eingesetzt werden."
 *
 * Er hat die Freisteller gesehen, ich nicht. Aber der Grund, warum er recht
 * hat, lässt sich auch ohne Augen nennen: drei mittelgrosse Gegenstände
 * nacheinander sind eine Aufzählung. Jeder bekommt ein Fünftel der Fläche und
 * ein Fünftel der Zeit, und keiner bekommt genug von beidem, um zu wirken.
 * Ein Gegenstand, der den halben Bildschirm füllt und aufbricht, ist ein
 * Ereignis.
 *
 * Das ist auch der billigere Bau: ein Gegenstand braucht ein gutes Foto,
 * drei brauchen drei.
 *
 * ═══ Die drei Takte ═══
 *
 *   Feuer    die leere Bühne, Funken. Wer hier arbeitet und seit wann.
 *   Ankunft  das Schiffchen kommt von hinten heran, XL, mit einem Stoss Mehl
 *            beim Aufsetzen.
 *   Bruch    es GEHT AUF — zwei Hälften schwingen auseinander, Dampf quillt
 *            aus der Bruchstelle.
 *
 * ═══ PLATZHALTER — bitte lesen, bevor jemand das hier fertig nennt ═══
 *
 * Der Gegenstand in `public/bilder/reise/` ist aus einem WhatsApp-Foto
 * freigestellt und laut Karol nicht gut genug. Er ist hier drin, damit die
 * Choreografie steht und geprüft werden kann — nicht, weil er bleiben soll.
 *
 * Was ihn ersetzt, steht in ABLICHTUNG.md: ein Foto mit genau den
 * Eigenschaften, die ein Gegenstand braucht, der aufbrechen soll. Sobald es
 * da ist, sind es zwei Zeilen: freistellen, brechen lassen, fertig — die
 * Zeitleiste bleibt unverändert.
 */
export default function Reise() {
  const schmal = useMedienabfrage('(max-width: 719px)')
  const buehne = useRef<HTMLDivElement>(null)
  const schiff = useRef<HTMLDivElement>(null)
  const links = useRef<HTMLImageElement>(null)
  const rechts = useRef<HTMLImageElement>(null)
  const bruchdampf = useRef<HTMLDivElement>(null)
  const [mehlstoss, setMehlstoss] = useState(0)
  const texte = useRef<HTMLOListElement>(null)

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
        const zeilen = texte.current
          ? Array.from(texte.current.querySelectorAll<HTMLElement>('li'))
          : []

        /* Ausgangslage. Sie steht HIER und nicht im Stilblatt: was eine
           Zeitleiste bewegt, soll sie auch setzen — sonst stehen Anfangswerte
           an zwei Orten und laufen beim nächsten Umbau auseinander. */
        gsap.set(schiff.current, { autoAlpha: 0 })
        gsap.set([links.current, rechts.current], { xPercent: 0, rotationY: 0 })
        gsap.set(bruchdampf.current, { autoAlpha: 0 })
        gsap.set(zeilen, { autoAlpha: 0, y: 18 })

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: b,
            start: 'top top',
            /* Drei Bildschirmhöhen für vier Takte. Mehr wäre bequemer zu
               choreografieren und würde die Seite auf über sechzehn
               Bildschirmhöhen treiben — auf einem Daumen ist das Arbeit. */
            /* Zweieinhalb statt drei Bildschirmhöhen: ein Takt weniger, und
               die Seite lag bei 15,7 Bildschirmhöhen — zu viel Daumen. */
            end: () => `+=${window.innerHeight * 2.4}`,
            pin: true,
            /* `transform` statt `fixed`: eine angeheftete Sektion in `fixed`
               nimmt ihren Platz aus dem Fluss und verschiebt alles darunter.
               Das hat auf dieser Seite schon einmal CLS 0,525 gekostet. */
            pinType: 'transform',
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        const zeigen = (i: number, ab: number, bis: number) => {
          tl.to(zeilen[i]!, { autoAlpha: 1, y: 0, duration: 0.09 }, ab)
          tl.to(zeilen[i]!, { autoAlpha: 0, y: -14, duration: 0.08 }, bis)
        }

        /**
         * ═══ Der Rhythmus — Karol: „mach einen angenehmen Flow draus, das ist
         *     noch viel zu unkonsistent in der Abfolge" ═══
         *
         * Die erste Fassung hatte Löcher. Die Ankunft endete bei 0,52, der
         * Bruch begann bei 0,62 — dazwischen zehn Prozent des Scrollwegs, in
         * denen nichts passierte, und das ist genau die Stelle, an der eine
         * Bewegung „unrund" wird. Ein Betrachter merkt nicht, dass etwas fehlt;
         * er merkt, dass es stockt.
         *
         * Jetzt greift jeder Takt in den nächsten, und zwar mit fester
         * Überlappung: was aufhört, ist noch da, während das Nächste beginnt.
         *
         *   0,00 ─────── 0,22   Feuer, Satz 1
         *          0,14 ─────── 0,48   Ankunft aus der Tiefe
         *                 0,30 ─────── 0,58   Satz 2
         *                        0,50 ─────── 0,84   der Bruch
         *                             0,58 ─────── 0,98   Satz 3, Dampf
         *
         * Kein Abschnitt beginnt, wo der vorige endet. Das ist der ganze
         * Unterschied zwischen einer Folge und einer Liste.
         */

        /* ── Takt 1: Feuer ─────────────────────────────────────────────── */
        zeigen(0, 0.01, 0.22)

        /* ── Takt 2: die Ankunft ───────────────────────────────────────────
           Von hinten heran und gross werden — nicht von der Seite herein. Ein
           Gegenstand, der von links kommt, zieht vorbei; einer, der aus der
           Tiefe wächst, kommt AUF EINEN ZU. Das ist der Unterschied zwischen
           einer Parade und einem Auftritt.

           `z` von −900 auf 0 statt eines blossen Massstabs: mit Perspektive
           wächst die Silhouette so, wie ein Ding wächst, das näher kommt. */
        tl.fromTo(
          schiff.current,
          { autoAlpha: 0, z: -900, yPercent: 12, rotationX: 22, rotationY: -10 },
          { autoAlpha: 1, z: 0, yPercent: 0, rotationX: 0, rotationY: 0, duration: 0.34 },
          0.14,
        )
        /* 0,26 statt 0,30: Satz 1 blendet bei 0,22 aus und braucht dafür 0,08.
           Beginnt der zweite erst bei 0,30, steht zwischen 0,28 und 0,30 gar
           nichts — gemessen war das die Lücke, die die Abfolge stocken liess.
           Jetzt greift der zweite, während der erste noch geht. */
        zeigen(1, 0.26, 0.56)

        /**
         * Der Mehlstoss beim AUFSETZEN — ein eigener Auslöser, keine Zeile in
         * der Zeitleiste.
         *
         * Eine Zeitleiste mit `scrub` läuft rückwärts, wenn man zurückscrollt.
         * Ein Stoss kann das nicht: er hat einen Anfang und ein Ende, und
         * rückwärts abgespielt wäre er eine Wolke, die ins Blech zurückspringt.
         * Deshalb ein Ereignis, das in BEIDE Richtungen dasselbe tut.
         */
        const stoss = ScrollTrigger.create({
          trigger: b,
          start: () => `top+=${window.innerHeight * 2.4 * 0.4} top`,
          end: () => `top+=${window.innerHeight * 2.4 * 0.5} top`,
          onEnter: () => setMehlstoss((n) => n + 1),
          onEnterBack: () => setMehlstoss((n) => n + 1),
          invalidateOnRefresh: true,
        })

        /**
         * ═══ Takt 3: der Bruch — und zwar ANDERSHERUM ═══
         *
         * Karol: „das Käseschiff soll genau andersrum aufgehen, nicht so."
         *
         * Vorher drehten die Hälften mit dem Rücken zum Betrachter auf: die
         * linke nach links WEG, die rechte nach rechts weg. Man sah dabei
         * genau das, was ein aufbrechendes Gebäck NICHT zeigen soll — die
         * Aussenseiten, also Kruste. Die Bruchflächen zeigten voneinander weg.
         *
         * Jetzt kippen sie zum Betrachter hin: die Bruchflächen drehen nach
         * VORN, und der Blick fällt in das Gebäck hinein statt daran vorbei.
         * Es ist dieselbe Bewegung mit umgekehrtem Vorzeichen, und sie
         * entscheidet, ob man Käse sieht oder Rinde.
         *
         * Die Hälften drehen UND schieben: nur drehen sähe aus wie zwei Türen,
         * nur schieben wie ein Schnitt. Beides zusammen ist ein Bruch.
         */
        tl.to(links.current, { xPercent: -24, rotationY: 34, duration: 0.34 }, 0.5)
        tl.to(rechts.current, { xPercent: 24, rotationY: -34, duration: 0.34 }, 0.5)
        zeigen(2, 0.58, 0.98)
        /* Der Dampf beginnt, wenn der Spalt DA ist — nicht davor. Dampf aus
           einem geschlossenen Gebäck ist die Aussage, bevor sie stimmt.
           Er läuft länger als der Bruch: was aufsteigt, hört nicht auf, wenn
           die Bewegung darunter endet. */
        tl.to(bruchdampf.current, { autoAlpha: 1, duration: 0.22 }, 0.58)

        return () => {
          stoss.kill()
          tl.scrollTrigger?.kill()
          tl.kill()
          gsap.set(
            [
              schiff.current, links.current, rechts.current, bruchdampf.current,
              ...zeilen,
            ],
            { clearProps: 'all' },
          )
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
    <Sektion id="reise" grund="glut" klasse="reise" beschriftetVon="reise-titel">
      <h2 id="reise-titel" className="visuell-versteckt">
        Wie bei Aram gebacken wird
      </h2>

      <div className="reise__buehne" ref={buehne}>
        {/* Am Handy halb so viele. Gemessen mit vierfach gebremster
            Rechenleistung: die Bühne trieb die zähen Bilder von 5,8 auf
            10,5 %. Ein Funkenfeld ist der billigste Posten, den man halbieren
            kann, ohne dass es auffällt — bei 34 Funken sieht niemand, dass es
            16 sind, aber jeder spürt den Unterschied beim Wischen. */}
        <Funken klasse="reise__funken" menge={schmal ? 16 : 34} />

        <div className="reise__flug" aria-hidden="true">
          {/* Der Stoss wird über einen ZÄHLER ausgelöst, nicht über Deckkraft.
              Eine Wolke, die man einblendet, ist eine stehende Wolke, die
              sichtbar wird — sie hat keinen Zeitpunkt. Ein Stoss beginnt. */}
          <div className="reise__mehl">
            <Mehlwolke stoss={mehlstoss} menge={schmal ? 46 : 96} />
          </div>

          <div className="reise__schiff" ref={schiff}>
            {/* Der Dampf liegt HINTER den Hälften: er kommt aus dem Spalt,
                nicht davor. Davor wäre er ein Schleier über dem Produkt. */}
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
          </div>
        </div>

        {/* Die Texte sind eine ECHTE Liste in Leserichtung. Wer nicht scrollen
            kann oder vorgelesen bekommt, hört vier Sätze in der richtigen
            Reihenfolge — die Bewegung ist die Zugabe, nicht der Inhalt. */}
        <ol className="reise__texte" ref={texte}>
          <li>
            <span className="etikett">Seit über 25 Jahren</span>
            <p>Fünf Brüder, ein Steinofen, jeden Morgen ab sechs.</p>
          </li>
          <li>
            <span className="etikett">Von Hand gerollt</span>
            <p>Weizenmehl, Hirtenkäse, und zweiundzwanzig Sorten Fata’er — belegt erst bei deiner Bestellung.</p>
          </li>
          <li>
            <span className="etikett">Ofenfrisch</span>
            <p>Und dann bricht es auf, und es dampft. Dafür stehen wir um sechs auf.</p>
          </li>
        </ol>
      </div>
    </Sektion>
  )
}
