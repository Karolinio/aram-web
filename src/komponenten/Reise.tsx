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
 * Die Reise — vier Takte auf EINER Bühne.
 *
 * ═══ Warum eine Bühne und nicht vier Sektionen ═══
 *
 * Vier Abschnitte hintereinander erzählen keine Folge, sie zählen auf. Was eine
 * Folge daraus macht, ist, dass der Ort BLEIBT und sich nur ändert, was darauf
 * geschieht — wie auf einer Theaterbühne. Der Scroll wird zur Zeit.
 *
 * Deshalb ist die Sektion angeheftet und alles darin bewegt sich gegen einen
 * stehenden Grund. Ein Raumtausch je Takt wäre billiger zu bauen und würde die
 * Folge zerreissen.
 *
 * ═══ Warum sie das Schaustück ERSETZT ═══
 *
 * Vorher stand hier eine zweite angeheftete Sequenz mit demselben Zweck: ein
 * Gericht, das sich beim Scrollen aufbaut. Zwei davon hintereinander sind keine
 * Steigerung, sondern eine Wiederholung — und sie kosten zusammen sechs
 * Bildschirmhöhen. Diese hier kann, was die andere konnte, und mehr.
 *
 * ═══ Die vier Takte ═══
 *
 *   Feuer     die leere Bühne, Funken. Wer hier arbeitet und seit wann.
 *   Scheibe   ein Fladen dreht sich aus der Kante in die Fläche. Beim
 *             Aufsetzen ein Stoss Mehl.
 *   Fatayer   das gefüllte Gebäck zieht durch, gross und nah.
 *   Bruch     das Schiffchen kommt nach vorn und GEHT AUF — zwei Hälften
 *             schwingen auseinander, Dampf quillt aus der Bruchstelle.
 *
 * Der Bruch ist der Höhepunkt und steht deshalb am Ende. Er ist auch der
 * einzige Takt, den man nicht fotografieren kann: die Bruchkante entsteht in
 * werkzeug/reise-assets.py aus dem Alphakanal, nicht im Browser. Eine gerade
 * Trennlinie sähe zerschnitten aus, und zerschnittenes Gebäck ist etwas
 * anderes als gebrochenes.
 */
export default function Reise() {
  const schmal = useMedienabfrage('(max-width: 719px)')
  const buehne = useRef<HTMLDivElement>(null)
  const scheibe = useRef<HTMLImageElement>(null)
  const fatayer = useRef<HTMLImageElement>(null)
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
        gsap.set([scheibe.current, fatayer.current], { autoAlpha: 0 })
        gsap.set(schiff.current, { autoAlpha: 0, scale: 0.7 })
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
            end: () => `+=${window.innerHeight * 3}`,
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
          tl.to(zeilen[i]!, { autoAlpha: 1, y: 0, duration: 0.06 }, ab)
          tl.to(zeilen[i]!, { autoAlpha: 0, y: -14, duration: 0.05 }, bis)
        }

        /* ── Takt 1: Feuer ─────────────────────────────────────────────── */
        zeigen(0, 0.02, 0.2)

        /* ── Takt 2: die Scheibe dreht sich aus der Kante in die Fläche ──
           `rotationX` von 82 auf 0 ist der überzeugendste 3D-Moment, den es
           für einen flachen Gegenstand gibt: die Silhouette geht von einem
           Strich zu einem Kreis, und genau daran erkennt ein Auge Tiefe. Bei
           einem unregelmässigen Körper täte dieselbe Drehung nichts. */
        tl.fromTo(
          scheibe.current,
          { autoAlpha: 0, xPercent: -60, yPercent: 40, rotationX: 82, rotationY: -24, scale: 0.6 },
          { autoAlpha: 1, xPercent: 0, yPercent: 0, rotationX: 0, rotationY: 0, scale: 1, duration: 0.2 },
          0.2,
        )
        zeigen(1, 0.24, 0.4)
        /* Der Mehlstoss kommt beim AUFSETZEN, nicht beim Losfliegen — und er
           wird als EREIGNIS ausgelöst, nicht eingeblendet. `onEnter` beim
           Vorwärtsscrollen, `onEnterBack` beim Zurück: wer die Stelle zweimal
           passiert, sieht den Stoss zweimal. Eine Wolke, die nur einmal im
           Leben der Seite kommt, verpasst man. */
        const stoss = ScrollTrigger.create({
          trigger: b,
          start: () => `top+=${window.innerHeight * 3 * 0.36} top`,
          end: () => `top+=${window.innerHeight * 3 * 0.46} top`,
          onEnter: () => setMehlstoss((n) => n + 1),
          onEnterBack: () => setMehlstoss((n) => n + 1),
          invalidateOnRefresh: true,
        })
        tl.to(
          scheibe.current,
          { autoAlpha: 0, xPercent: 70, yPercent: -30, rotationY: 40, scale: 0.8, duration: 0.14 },
          0.42,
        )

        /* ── Takt 3: der Fatayer zieht durch ──────────────────────────── */
        tl.fromTo(
          fatayer.current,
          { autoAlpha: 0, xPercent: 70, yPercent: 26, rotationY: 34, scale: 0.7 },
          { autoAlpha: 1, xPercent: 0, yPercent: 0, rotationY: -6, scale: 1.06, duration: 0.18 },
          0.44,
        )
        zeigen(2, 0.48, 0.63)
        tl.to(
          fatayer.current,
          { autoAlpha: 0, xPercent: -60, yPercent: -34, rotationY: -46, scale: 0.82, duration: 0.13 },
          0.64,
        )

        /* ── Takt 4: der Bruch ────────────────────────────────────────── */
        tl.to(schiff.current, { autoAlpha: 1, scale: 1, duration: 0.14 }, 0.66)
        zeigen(3, 0.72, 0.97)
        /* Die Hälften schwingen um die Hochachse auseinander und zugleich
           seitlich weg. Nur drehen sähe aus wie zwei Türen, nur schieben wie
           ein Schnitt. Beides zusammen ist ein Bruch. */
        tl.to(links.current, { xPercent: -22, rotationY: -34, duration: 0.16 }, 0.8)
        tl.to(rechts.current, { xPercent: 22, rotationY: 34, duration: 0.16 }, 0.8)
        /* Der Dampf beginnt, wenn der Spalt da ist — nicht davor. Dampf aus
           einem geschlossenen Gebäck ist die Aussage, bevor sie stimmt. */
        tl.to(bruchdampf.current, { autoAlpha: 1, duration: 0.1 }, 0.84)

        return () => {
          stoss.kill()
          tl.scrollTrigger?.kill()
          tl.kill()
          gsap.set(
            [
              scheibe.current, fatayer.current, schiff.current,
              links.current, rechts.current, bruchdampf.current,
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
          <img
            ref={scheibe}
            className="reise__stueck reise__stueck--scheibe"
            src="/bilder/reise/scheibe.webp"
            width={M.scheibe!.breite}
            height={M.scheibe!.hoehe}
            alt=""
            loading="lazy"
            decoding="async"
          />
          {/* Der Stoss wird über `aktiv` ausgelöst, nicht über Deckkraft.
              Eine Wolke, die man einblendet, ist eine stehende Wolke, die
              sichtbar wird — sie hat keinen Zeitpunkt. Ein Stoss beginnt. */}
          <div className="reise__mehl">
            <Mehlwolke stoss={mehlstoss} menge={schmal ? 46 : 96} />
          </div>

          <img
            ref={fatayer}
            className="reise__stueck reise__stueck--fatayer"
            src="/bilder/reise/fatayer.webp"
            width={M.fatayer!.breite}
            height={M.fatayer!.hoehe}
            alt=""
            loading="lazy"
            decoding="async"
          />

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
            <span className="etikett">Der Teig</span>
            <p>Von Hand gerollt, mit Weizenmehl. Kein Blech kommt zweimal am selben Tag.</p>
          </li>
          <li>
            <span className="etikett">Belegt</span>
            <p>Zweiundzwanzig Sorten Fata’er — Zaatar, Muhammara, Spinat, Sucuk. Belegt erst bei deiner Bestellung.</p>
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
