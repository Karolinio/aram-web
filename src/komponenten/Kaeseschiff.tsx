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
  { p: 0.86, x: -6, y: 0.22, dreh: 1, drehY: 3, drehX: 1, skala: 0.9, deck: 1 },
  /* ═══ Zwei Wegpunkte standen hier auf demselben `p` ═══
     Ein Tippfehler beim Nachjustieren, und er wäre irgendwann teuer geworden:
     `aufDerBahn` teilt durch `b.p − a.p`, und das ist bei gleichen Werten null.
     Sichtbar wäre es als Gegenstand, der an einer Stelle verschwindet.
     Die Reihenfolge muss STRENG steigen. */
  { p: 0.9, x: 0, y: 0.04, dreh: -2, drehY: 5, drehX: 2, skala: 1.0, deck: 1 },
  /* Und dann ist es weg. Ohne diese Zeile bliebe ein aufgerissenes Gebäck in
     voller Grösse über der Speisekarte stehen — gemessen über 6000 px Scroll,
     weil ein festes Element nicht von selbst geht. */
  /* Weg bei 0,93, nicht erst bei 1,0. Gemessen erscheint die Überschrift der
     Speisekarte bei p 0,949 im Bild — bei einem Ausblenden bis 1,0 lag das
     aufgerissene Gebäck dort noch mit 0,3 Deckung über den ersten Gerichten.
     Ein grosses helles Bild bei 30 % auf hellem Grund ist nicht „fast weg",
     sondern ein Schleier. */
  { p: 0.93, x: 0, y: 0.08, dreh: 0, drehY: 0, drehX: 0, skala: 1.04, deck: 0 },
  { p: 1.0, x: 0, y: 0.1, dreh: 0, drehY: 0, drehX: 0, skala: 1.06, deck: 0 },
]

/**
 * Wann welche Stufe zu sehen ist — als ÜBERBLENDKETTE, nicht als Fenster.
 *
 * ═══ Warum das der zweite Anlauf ist ═══
 *
 * Zuerst hatte jede Stufe ein eigenes Fenster mit weichen Rändern. Das klingt
 * gleichwertig und ist es nicht: an den Rändern überlagerten sich zwei
 * Aufnahmen zu je etwa der Hälfte, und zwei halbdurchsichtige Fotos desselben
 * Gegenstands in verschiedenen Zuständen ergeben ein Geisterbild. Dazwischen
 * gab es Stellen, an denen eine Stufe allein bei voller Deckung stand und die
 * nächste noch gar nicht begonnen hatte — daher das Ruckeln, das Karol
 * gemeldet hat.
 *
 * Jetzt trägt jede Stufe einen PUNKT, an dem sie voll sichtbar ist. Zwischen
 * zwei Punkten wird linear überblendet, und die beiden Deckkräfte ergeben
 * IMMER genau eins. Es sind also nie mehr als zwei Aufnahmen im Bild, sie
 * verdecken einander vollständig, und es gibt keine Lücke.
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
const STUFEN: readonly { klasse: string; bei: number }[] = [
  { klasse: 'stufe-1-kugel', bei: 0.0 },
  { klasse: 'stufe-2-gewalzt', bei: 0.14 },
  { klasse: 'stufe-3-belegt', bei: 0.32 },
  /* Die lange Strecke: gebacken, und so fliegt es über zwei Sektionen. */
  { klasse: 'stufe-4-gebacken', bei: 0.55 },
  /* ── Der Riss ───────────────────────────────────────────────────────────
     Vier Aufnahmen dicht hintereinander. Karol: „nicht zu zäh machen, einfach
     nahtlos voneinander trennen und nicht ruckelig … harmonischer Übergang."
     Die Abstände werden nach hinten kleiner: das Auseinandergehen beschleunigt,
     wie es das im Echten auch tut, sobald die Fäden nachgeben. */
  { klasse: 'riss-1', bei: 0.815 },
  { klasse: 'riss-2', bei: 0.85 },
  { klasse: 'riss-3', bei: 0.878 },
  /* ═══ Der Fahrplan folgt der SEKTIONSGEOMETRIE, nicht dem Gefühl ═══
     Gemessen liegt die Riss-Sektion zwischen p 0,73 und 1,0 — das sind rund
     2230 px. Darin muss dreierlei Platz haben, und in dieser Reihenfolge:
       0,73…0,81   das ganze Gebäck, während man die Überschrift liest
       0,81…0,90   der Riss
       0,90…0,96   das Ausblenden, bevor die Speisekarte hereinkommt
     Beim ersten Anlauf lag das Ausblenden bei 0,93…1,0 — gemessen stand das
     aufgerissene Gebäck dadurch noch bei voller Deckung über „Was es gibt".

     Fertig gerissen also bei 0,90, nicht bei 1,0. Denn nach
     `p = 1` bleibt IMMER eine Fensterhöhe Sektion übrig — der Auslöser endet,
     wenn die Unterkante der Sektion die Unterkante des Fensters erreicht, und
     bis sie oben herausgescrollt ist, vergeht noch ein ganzer Bildschirm.
     Gemessen standen dort 800 px leerer Clay.
     Jetzt liegt das aufgerissene Gebäck diese Strecke noch da und verschwindet
     erst am Schluss — Karol: „Käse trennt sich, ein, zwei Sekunden sichtbar
     und weg." */
  { klasse: 'riss-4', bei: 0.9 },
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

        /**
         * Die Überblendkette. Gesucht sind die beiden Stufen, zwischen denen
         * `p` liegt; alle anderen stehen auf null.
         *
         * `glatt` auf dem Übergang, nicht linear: eine lineare Überblendung
         * zwischen zwei Fotos hat an beiden Enden eine Kante, an der die
         * Änderungsrate springt — genau das liest sich als Ruck.
         */
        let i = 0
        while (i < STUFEN.length - 2 && p > STUFEN[i + 1]!.bei) i++
        const von = STUFEN[i]!.bei
        const bis = STUFEN[i + 1]!.bei
        const t = glatt(klemmen((p - von) / (bis - von)))
        for (let k = 0; k < stufen.length; k++) {
          const el2 = stufen[k]
          if (!el2) continue
          el2.style.opacity = k === i ? String(1 - t) : k === i + 1 ? String(t) : '0'
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
          /* `bottom top`, nicht `bottom bottom`. Der Unterschied ist eine
             ganze Bildschirmhöhe: bei `bottom bottom` endet der Auslöser,
             sobald die Unterkante der Sektion die Unterkante des Fensters
             erreicht — danach muss die Sektion noch einen ganzen Bildschirm
             weit hochgescrollt werden, und in dieser Zeit ist das Schiff schon
             weg. Gemessen 800 px leerer Clay hinter dem Riss.
             Bei `bottom top` endet die Reise genau dann, wenn die Sektion oben
             hinausgeht. */
          end: 'bottom top',
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
