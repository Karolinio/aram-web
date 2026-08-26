import { useEffect, useRef, useState } from 'react'

import rissRoh from '../../inhalt/riss.json'
import { SCRUB_KOERPER, useMedienabfrage, werkzeugHolen } from '../bewegung.ts'
import Dampf from './ui/Dampf.tsx'

type Mass = { breite: number; hoehe: number }
const M = rissRoh as Record<string, Mass>

/**
 * Das Käseschiff — eine Reise vom Teig durch den Ofen bis zum Riss.
 *
 * ═══ Was hier erzählt wird ═══
 *
 * Karol am 23.08.: „Wie aus dem Mehl irgendwie durch dieses Walzen so ein
 * Käseschiff wird, dann fliegt das."
 *
 * ═══ Der Ofen ist am 24.08. wieder rausgeflogen ═══
 *
 * „Das mit dem Ofen ist mir noch nicht ganz koscher … mach den Ofen raus."
 * Die Verwandlung BLEIBT — sie braucht den Ofen nicht. Der Teig wird während
 * des Flugs zu Gebäck, und das liest sich sogar geradliniger: ein Gegenstand,
 * der sich auf dem Weg verwandelt, statt eines, der in einem Loch verschwindet
 * und anders wieder herauskommt.
 *
 * Die Reihenfolge:
 *
 *   Teigkugel  →  gewalzt  →  belegt  →  gebacken  →  reisst auf
 *
 * Ein Gegenstand, der so weit reist, kann in keiner Sektion wohnen — er wäre
 * an deren Unterkante zu Ende. Er liegt fest im Fenster (`position: fixed`)
 * und wird allein vom Scrollfortschritt bewegt: die Seite fährt darunter
 * durch, er bleibt.
 *
 * ═══ Drei Fahrpläne, EIN Fortschritt ═══
 *
 * Die Bahn (`BAHN`), die Stufen (`STUFEN`) und der Riss (`RISS_AB`) lesen alle
 * dieselbe Zahl. Das ist keine Sparsamkeit, sondern die Lehre aus dem
 * Vorgängerbau: dort fuhr der Riss über einen EIGENEN ScrollTrigger, und das
 * Gebäck war gemessen mitten in der Galerie schon halb offen. Zwei Bereiche,
 * zwei Rechnungen, keine Garantie, dass sie dasselbe meinen.
 *
 * ═══ Warum Tabellen und keine Formeln ═══
 *
 * „Etwas weiter rechts bei Sektion zwei" lässt sich an einer Sinuskurve nicht
 * sagen, an einer Zeile in einer Tabelle schon. Wer die Reise ändern will,
 * ändert Zahlen — hier, und sonst nirgends.
 */

/** Ein Haltepunkt der Bahn. Alles ausser `p` wird zwischen zwei Punkten weich überblendet. */
type Punkt = {
  /** Wo auf der Reise, 0 = Anfang der ersten Sektion, 1 = Riss vollendet. */
  p: number
  /** Seitlich, in Prozent der Fensterbreite. Negativ = links. */
  x: number
  /** Hoch/runter, in Anteilen der Fensterhöhe, gemessen ab der Fenstermitte. */
  y: number
  /** Drehung in der Bildebene. */
  dreh: number
  /** Kippen um die Hochachse — die eigentliche Tiefenwirkung. */
  drehY: number
  /** Neigen um die Querachse. */
  drehX: number
  /** Grösse. 1 = die volle Breite aus dem Stilblatt. */
  skala: number
  /** Deckkraft. Im Ofen ist sie null — dort ist es dunkel. */
  deck: number
}

/**
 * Die Bahn.
 *
 * ═══ Wonach die Zahlen gewählt sind ═══
 *
 * Nicht nach der Kurve, sondern nach den ÜBERSCHRIFTEN. Ein Gegenstand, der
 * auf einer Überschrift parkt, ist kein Effekt, sondern ein Fehler — und genau
 * das war der erste Bau: gemessen stand das Schiff bei 38 % Fortschritt mitten
 * auf „Was am Morgen entsteht".
 *
 * Jede Sektion trägt ihre Überschrift im oberen Drittel und links. Daraus
 * folgen die Fenster, in denen das Schiff TIEF oder RECHTS stehen muss — sie
 * sind gemessen, nicht geschätzt, und wer Sektionshöhen ändert, muss sie neu
 * messen.
 *
 * Die Kurve links → rechts → links, die Karol beschrieben hat, entsteht dabei
 * von selbst: die Ausweichbewegungen SIND die Kurve.
 */
const BAHN: readonly Punkt[] = [
  //  p     x %vw    y %vh   dreh  drehY  drehX  skala  deck
  { p: 0.0, x: -32, y: -0.94, dreh: -24, drehY: 44, drehX: 16, skala: 0.24, deck: 0 },
  { p: 0.07, x: -33, y: -0.26, dreh: -18, drehY: 34, drehX: 11, skala: 0.32, deck: 1 },
  { p: 0.19, x: -28, y: 0.26, dreh: -11, drehY: 24, drehX: 4, skala: 0.38, deck: 1 },
  { p: 0.33, x: -33, y: -0.06, dreh: -3, drehY: 12, drehX: -2, skala: 0.46, deck: 1 },
  { p: 0.47, x: 30, y: 0.22, dreh: 10, drehY: -19, drehX: -6, skala: 0.55, deck: 1 },
  { p: 0.62, x: 34, y: -0.14, dreh: 18, drehY: -37, drehX: -11, skala: 0.64, deck: 1 },
  /* Tief im Bild, solange die Überschrift der Riss-Sektion oben steht. */
  { p: 0.76, x: -18, y: 0.24, dreh: 6, drehY: -10, drehX: -3, skala: 0.78, deck: 1 },
  { p: 0.86, x: -6, y: 0.24, dreh: 1, drehY: 3, drehX: 1, skala: 0.88, deck: 1 },
  { p: 0.93, x: 0, y: 0.04, dreh: -2, drehY: 5, drehX: 2, skala: 0.96, deck: 1 },
  { p: 0.97, x: 0, y: 0.0, dreh: 0, drehY: 0, drehX: 0, skala: 1.0, deck: 1 },
  /* Und dann ist es weg. Ohne diese Zeile bliebe ein aufgerissenes Gebäck in
     voller Grösse über der Speisekarte stehen — gemessen über 6000 px Scroll,
     weil ein festes Element nicht von selbst geht. */
  { p: 1.0, x: 0, y: 0.08, dreh: 0, drehY: 0, drehX: 0, skala: 1.05, deck: 0 },
]

/**
 * Wann welche Stufe zu sehen ist.
 *
 * Die Bilder liegen ÜBEREINANDER und werden nur ein- und ausgeblendet. Der
 * naheliegende Weg wäre, `src` umzusetzen — dann muss der Browser beim ersten
 * Wechsel jedes Bild erst dekodieren, mitten in der Bewegung, und genau dort
 * kostet es den Frame, den man sieht.
 *
 * Alle tragen dieselbe Leinwand (1200 × 540, siehe werkzeug/ofenreise.py) und
 * dieselbe Bildmitte. Ohne das springt der Gegenstand bei jedem Wechsel.
 *
 * Die letzte Stufe ist KEIN eigenes Bild: das gebackene Schiff sind die beiden
 * Hälften bei Spanne null. Ein fünftes Bild wäre eine zweite Wahrheit über
 * denselben Gegenstand.
 */
const STUFEN: readonly { klasse: string; von: number; bis: number }[] = [
  { klasse: 'stufe-1-kugel', von: 0.0, bis: 0.13 },
  { klasse: 'stufe-2-gewalzt', von: 0.1, bis: 0.3 },
  { klasse: 'stufe-3-belegt', von: 0.27, bis: 0.5 },
  /* Die lange Strecke: gebacken, und so fliegt es über zwei Sektionen. */
  { klasse: 'stufe-4-gebacken', von: 0.47, bis: 0.85 },
  /* Und dann reisst es — in vier Aufnahmen, nicht in einer Rechnung. */
  { klasse: 'riss-1', von: 0.83, bis: 0.895 },
  { klasse: 'riss-2', von: 0.885, bis: 0.935 },
  { klasse: 'riss-3', von: 0.925, bis: 0.975 },
  { klasse: 'riss-4', von: 0.965, bis: 1.2 },
]

/** Weiche Überblendung statt Knick. Ohne sie hat die Bahn an jedem Wegpunkt eine Ecke. */
const glatt = (t: number) => t * t * (3 - 2 * t)
const klemmen = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)

function aufDerBahn(p: number): Punkt {
  let i = 0
  while (i < BAHN.length - 2 && p > BAHN[i + 1]!.p) i++
  const a = BAHN[i]!
  const b = BAHN[i + 1]!
  const t = glatt(klemmen((p - a.p) / (b.p - a.p)))
  const m = (von: number, bis: number) => von + (bis - von) * t
  return {
    p,
    x: m(a.x, b.x),
    y: m(a.y, b.y),
    dreh: m(a.dreh, b.dreh),
    drehY: m(a.drehY, b.drehY),
    drehX: m(a.drehX, b.drehX),
    skala: m(a.skala, b.skala),
    deck: m(a.deck, b.deck),
  }
}

/** Ein Fenster mit weichen Rändern: 0 draussen, 1 drinnen, dazwischen glatt. */
function fenster(p: number, von: number, bis: number, rand = 0.045): number {
  if (p <= von - rand || p >= bis + rand) return 0
  if (p < von) return glatt((p - (von - rand)) / rand)
  if (p > bis) return glatt((bis + rand - p) / rand)
  return 1
}

export default function Kaeseschiff() {
  const schmal = useMedienabfrage('(max-width: 719px)')
  const ruhig = useMedienabfrage('(prefers-reduced-motion: reduce)')
  const [bereit, setBereit] = useState(false)
  const [aktiv, setAktiv] = useState(false)
  const schiff = useRef<HTMLDivElement>(null)

  /* Das Vorspiel: sobald die Startseite durch ist, wird das Schiff gebaut.
     Vorher gehört es nicht in den Baum — ein festes Element gilt dem Browser
     immer als „im Bild", und lazy-loading zöge alle Stufen in den ersten
     Ladevorgang. */
  useEffect(() => {
    if (ruhig) return
    let tot = false
    let abraeumen: (() => void) | undefined

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      const st = werkzeug.ScrollTrigger.create({
        trigger: '.backstube',
        start: 'bottom bottom',
        onEnter: () => setBereit(true),
        onEnterBack: () => setBereit(true),
      })
      abraeumen = () => st.kill()
    })

    return () => {
      tot = true
      abraeumen?.()
    }
  }, [ruhig])

  /* Die Reise selbst. */
  useEffect(() => {
    const el = schiff.current
    if (!el || !bereit || ruhig) return

    const stufen = STUFEN.map((s) => el.querySelector<HTMLElement>(`.schiff__stufe--${s.klasse}`))

    let tot = false
    let abraeumen: (() => void) | undefined

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      const { gsap, ScrollTrigger } = werkzeug

      /**
       * Der Fortschritt wird über ein Hilfsobjekt geführt und nicht aus
       * `self.progress` gelesen. Der Grund ist der Scrub: er glättet die
       * VERKNÜPFTE Animation, nicht die Rohmeldung. Wer `onUpdate` fragt,
       * bekommt den ungeglätteten Wert und damit das harte Scrollgefühl
       * zurück, das hier zweimal beanstandet wurde.
       */
      const zustand = { p: 0 }

      const zeichnen = () => {
        const p = zustand.p
        const w = aufDerBahn(p)
        const vw = window.innerWidth
        const vh = window.innerHeight

        /**
         * ═══ Am Handy fliegt alles TIEFER ═══
         *
         * Die Wegpunkte sind an 1440 × 900 gemessen. Am Handy ist das
         * Verhältnis ein anderes: die Sektionen sind kürzer, die Überschriften
         * stehen deshalb länger im Bild, und das Fenster ist hochkant. Gemessen
         * stand das gebackene Schiff dadurch mitten auf „Und dann bricht es
         * auf".
         *
         * Eine zweite Wegpunkttabelle wäre die naheliegende Antwort und die
         * schlechtere: zwei Tabellen laufen auseinander, sobald jemand nur eine
         * davon anfasst. Ein Versatz auf der Hochachse löst denselben Fall mit
         * einer Zahl — die Bahn bleibt die Bahn, sie liegt nur tiefer.
         */
        const tiefer = schmal ? 0.22 : 0

        el.style.transform =
          `translate3d(${(w.x / 100) * vw}px, ${(w.y + tiefer) * vh}px, 0)` +
          ` rotateY(${w.drehY}deg) rotateX(${w.drehX}deg)` +
          ` rotate(${w.dreh}deg) scale(${w.skala})`
        el.style.opacity = String(w.deck)

        /* Die Stufen. Jede hat ihr Fenster; die Ränder überlappen, damit
           überblendet und nicht geschaltet wird. */
        for (let i = 0; i < stufen.length; i++) {
          const s = STUFEN[i]!
          const k = stufen[i]
          if (k) k.style.opacity = String(fenster(p, s.von, s.bis))
        }


      }

      const tween = gsap.to(zustand, {
        p: 1,
        ease: 'none',
        onUpdate: zeichnen,
        scrollTrigger: {
          /* Von der ersten Sektion nach der Startseite bis zu der, in der
             gerissen wird. Beide werden über Klassen gesucht statt über IDs:
             die Überschriften kommen noch vom Inhaber, die Klassen bleiben. */
          trigger: '.prozess',
          start: 'top 88%',
          endTrigger: '.reise',
          end: 'bottom bottom',
          scrub: SCRUB_KOERPER,
          invalidateOnRefresh: true,
          onToggle: ({ isActive }) => {
            setAktiv(isActive)
            el.style.willChange = isActive ? 'transform, opacity' : ''
          },
        },
      })

      zeichnen()
      ScrollTrigger.refresh()

      abraeumen = () => {
        tween.scrollTrigger?.kill()
        tween.kill()
        el.style.willChange = ''
      }
    })

    return () => {
      tot = true
      abraeumen?.()
    }
  }, [bereit, ruhig, schmal])

  /* Ohne Bewegungswunsch fliegt hier gar nichts — die Sektionen tragen dann
     ihren Text und ihre Bilder, und das genügt. */
  if (ruhig || !bereit) return null

  return (
    <div className="schiffbahn" aria-hidden="true">
      <div className="schiff" ref={schiff}>
        {/* Dampf HINTER dem Gebäck: er steigt daraus auf, nicht davor. */}
        {aktiv && (
          <div className="schiff__dampf">
            <Dampf ton="ofen" />
          </div>
        )}

        {STUFEN.map((x) => (
          <img
            key={x.klasse}
            className={`schiff__stufe schiff__stufe--${x.klasse}`}
            src={`/bilder/riss/${x.klasse}.webp`}
            width={M['stufe-4-gebacken']!.breite}
            height={M['stufe-4-gebacken']!.hoehe}
            alt=""
            decoding="async"
          />
        ))}
      </div>
    </div>
  )
}
