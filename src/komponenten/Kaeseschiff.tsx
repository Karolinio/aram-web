import { useEffect, useRef, useState } from 'react'

import reiseRoh from '../../inhalt/reise.json'
import { useMedienabfrage, werkzeugHolen } from '../bewegung.ts'
import Dampf from './ui/Dampf.tsx'
import Kaesefaeden from './ui/Kaesefaeden.tsx'
import Kaesetropfen from './ui/Kaesetropfen.tsx'

type Mass = { breite: number; hoehe: number }
const M = reiseRoh as Record<string, Mass>

/**
 * Das Käseschiff — es begleitet die ganze Seite, nicht eine Sektion.
 *
 * ═══ Warum das die vierte Fassung ist, und was die drei davor falsch hatten ═══
 *
 * Alle drei Vorfassungen hatten dasselbe Missverständnis: das Schiff war ein
 * KIND einer Sektion. Es trat dort auf, flog ein Stück und war wieder weg. Und
 * genau daran hat Karol jedes Mal gesehen, dass es nicht das ist, was er meint:
 *
 *   „Also, da ist ja nichts an Scroll-Driven … Ich will, dass das Käseschiff
 *   von oben nach unten … runtergeht. Also so von links in der Kurve nach
 *   rechts und dann wieder nach links … nachher wird das Käseschiff in zwei
 *   zerlegt, nach der vierten Sektion."
 *
 * Ein Gegenstand, der über VIER Sektionen reist, kann in keiner davon wohnen.
 * Er liegt jetzt fest im Fenster (`position: fixed`) und wird allein vom
 * Scrollfortschritt bewegt — die Seite fährt darunter durch, er bleibt. Das ist
 * das, was Karol schon zwei Runden früher „wie so ein magischer Cursor als
 * Pide" genannt hat.
 *
 * ═══ Warum eine Wegpunkttabelle und keine Formel ═══
 *
 * Eine Sinuskurve wäre kürzer. Aber sie ist nicht verhandelbar: „etwas weiter
 * rechts bei Sektion zwei" lässt sich an einer Formel nicht sagen, an einer
 * Zeile in einer Tabelle schon. Die Bahn unten ist deshalb eine Liste von
 * Haltepunkten, zwischen denen weich (smoothstep) überblendet wird — jede
 * Zeile ist eine Stelle auf der Seite, und jede Spalte ist eine Bewegung.
 *
 * ═══ Warum es zwei Stufen gibt ═══
 *
 *   bereit   Das Schiff wird in den Baum gehängt und dekodiert, sobald die
 *            Startseite durch ist. Vorher gehört es nicht dorthin: ein festes
 *            Element gilt dem Browser immer als „im Bild", und lazy-loading
 *            würde es mitten in den ersten Ladevorgang ziehen.
 *   aktiv    Die Leinwände (Dampf, Tropfen, Fäden) laufen NUR während der
 *            Reise. Ausserhalb steht keine einzige Schleife.
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
  /** Deckkraft. Fern und klein darf es blasser sein. */
  deck: number
}

/**
 * Die Bahn: von links, in der Kurve nach rechts, wieder nach links, und in der
 * Mitte reisst es.
 *
 * ═══ Wonach die Zahlen gewählt sind ═══
 *
 * Nicht nach der Kurve, sondern nach den ÜBERSCHRIFTEN. Ein Gegenstand, der
 * auf einer Überschrift parkt, ist kein Effekt, sondern ein Fehler — und genau
 * das war der erste Bau: gemessen stand das Schiff bei 38 % Fortschritt
 * mitten auf „Was am Morgen entsteht".
 *
 * Jede Sektion trägt ihre Überschrift im oberen Drittel und links. Daraus
 * folgen drei Fenster, in denen das Schiff entweder TIEF oder RECHTS stehen
 * muss — und dazwischen darf es hin, wo es will:
 *
 *   0,15…0,19   Überschrift der Handarbeit    → das Schiff sinkt nach unten
 *   0,41…0,50   Überschrift der Galerie       → das Schiff steht rechts
 *   0,85…0,92   Überschrift der Riss-Sektion  → das Schiff bleibt tief
 *
 * Die Kurve links → rechts → links, die Karol beschrieben hat, entsteht dabei
 * von selbst: die Ausweichbewegungen SIND die Kurve.
 */
const BAHN: readonly Punkt[] = [
  //  p     x %vw    y %vh   dreh  drehY  drehX  skala  deck
  { p: 0.00, x: -34, y: -0.94, dreh: -24, drehY: 44, drehX: 16, skala: 0.26, deck: 0 },
  { p: 0.09, x: -33, y: -0.26, dreh: -18, drehY: 36, drehX: 11, skala: 0.33, deck: 1 },
  { p: 0.20, x: -28, y: 0.26, dreh: -11, drehY: 25, drehX: 4, skala: 0.38, deck: 1 },
  { p: 0.33, x: -33, y: -0.04, dreh: -4, drehY: 13, drehX: -1, skala: 0.43, deck: 1 },
  { p: 0.47, x: 30, y: 0.22, dreh: 10, drehY: -19, drehX: -6, skala: 0.5, deck: 1 },
  { p: 0.61, x: 34, y: -0.14, dreh: 18, drehY: -37, drehX: -11, skala: 0.58, deck: 1 },
  { p: 0.72, x: -21, y: 0.16, dreh: 7, drehY: -12, drehX: -4, skala: 0.67, deck: 1 },
  { p: 0.82, x: -17, y: 0.26, dreh: 4, drehY: -6, drehX: -2, skala: 0.76, deck: 1 },
  { p: 0.89, x: -6, y: 0.24, dreh: 1, drehY: 3, drehX: 1, skala: 0.87, deck: 1 },
  { p: 0.94, x: 0, y: 0.04, dreh: -2, drehY: 6, drehX: 2, skala: 0.96, deck: 1 },
  { p: 0.97, x: 0, y: 0.0, dreh: 0, drehY: 0, drehX: 0, skala: 1.0, deck: 1 },
  /* Und dann ist es weg. Ohne diese Zeile bliebe ein aufgerissenes Gebäck in
     voller Grösse über der Speisekarte stehen — gemessen über 6000 px Scroll,
     weil ein festes Element nicht von selbst geht. */
  { p: 1.00, x: 0, y: 0.08, dreh: 0, drehY: 0, drehX: 0, skala: 1.05, deck: 0 },
]

/** Von wo bis wo gerissen wird. Danach bleibt eine Reise-Länge zum Verschwinden. */
const RISS_AB = 0.79
const RISS_BIS = 0.97

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
     Ein eigener, sehr billiger Auslöser — er tut nichts als einmal umlegen. */
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

    let tot = false
    let abraeumen: (() => void) | undefined

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      const { gsap, ScrollTrigger } = werkzeug

      /**
       * Der Fortschritt wird über ein Hilfsobjekt geführt und nicht direkt aus
       * `self.progress` gelesen. Der Grund ist der Scrub: er glättet die
       * VERKNÜPFTE Animation, nicht die Rohmeldung. Wer `onUpdate` fragt,
       * bekommt den ungeglätteten Wert und damit das harte Scrollgefühl
       * zurück, das hier zweimal beanstandet wurde.
       */
      const zustand = { p: 0 }
      const links = el.querySelector<HTMLElement>('.schiff__haelfte--links')
      const rechts = el.querySelector<HTMLElement>('.schiff__haelfte--rechts')

      const zeichnen = () => {
        const p = zustand.p
        const w = aufDerBahn(p)
        const vw = window.innerWidth
        const vh = window.innerHeight
        el.style.transform =
          `translate3d(${(w.x / 100) * vw}px, ${w.y * vh}px, 0)` +
          ` rotateY(${w.drehY}deg) rotateX(${w.drehX}deg)` +
          ` rotate(${w.dreh}deg) scale(${w.skala})`
        el.style.opacity = String(w.deck)
        /* Eine Zahl, drei Verbraucher: die beiden Hälften über ihre eigenen
           Tweens, die Käsefäden über den berechneten Stil. */
        /**
         * ═══ Eine Zahl, drei Verbraucher — und deshalb kein zweiter Auslöser ═══
         *
         * Die erste Fassung fuhr den Riss über einen EIGENEN ScrollTrigger mit
         * eigenem Bereich. Gemessen war das Gebäck dadurch mitten in der
         * Galerie schon halb offen: zwei Bereiche, zwei Rechnungen, und keine
         * Garantie, dass sie dasselbe meinen.
         *
         * Jetzt kommt die Spanne aus DEMSELBEN Fortschritt wie der Flug. Die
         * Hälften werden hier direkt geschrieben, die Fäden lesen sie aus dem
         * berechneten Stil. Es gibt keine zweite Quelle, die abweichen könnte.
         */
        const spanne = klemmen((p - RISS_AB) / (RISS_BIS - RISS_AB))
        el.style.setProperty('--spanne', String(spanne))
        if (links && rechts) {
          /* Genau 30 % — dieselbe Zahl, mit der Kaesefaeden.tsx die Ansatz-
             punkte auseinanderzieht. Weichen sie ab, hängen die Fäden neben
             der Bruchkante statt daran. */
          links.style.transform = `translateX(${-30 * spanne}%) rotateY(${32 * spanne}deg)`
          rechts.style.transform = `translateX(${30 * spanne}%) rotateY(${-32 * spanne}deg)`
        }
      }

      const tween = gsap.to(zustand, {
        p: 1,
        ease: 'none',
        onUpdate: zeichnen,
        scrollTrigger: {
          /* Die Reise beginnt mit der ersten Sektion nach der Startseite und
             endet mit der Sektion, in der gerissen wird. Beide werden über
             Klassen gesucht statt über IDs: die Überschriften kommen noch vom
             Inhaber, die Klassen bleiben. */
          trigger: '.prozess',
          start: 'top 88%',
          endTrigger: '.reise',
          end: 'bottom bottom',
          scrub: 0.4,
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
  }, [bereit, ruhig])

  /* Ohne Bewegungswunsch fliegt hier gar nichts. Das Schiff steht dann als
     Standbild in der Riss-Sektion — siehe Reise.tsx. */
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

        <img
          className="schiff__haelfte schiff__haelfte--links"
          src="/bilder/reise/schiff-links.webp"
          width={M['schiff-links']!.breite}
          height={M['schiff-links']!.hoehe}
          alt=""
          decoding="async"
        />
        <img
          className="schiff__haelfte schiff__haelfte--rechts"
          src="/bilder/reise/schiff-rechts.webp"
          width={M['schiff-rechts']!.breite}
          height={M['schiff-rechts']!.hoehe}
          alt=""
          decoding="async"
        />

        {/* Die Fäden liegen ÜBER den Hälften — eine Bruchfläche liegt vorn. */}
        {aktiv && <Kaesefaeden klasse="schiff__faeden" menge={schmal ? 6 : 11} />}

        {/* Getropft wird nur am Rechner. Am Handy ist unter dem Schiff kein
            Weg, auf dem ein Tropfen etwas erzählen könnte — und die drei
            Leinwände dort kosten ohnehin schon zu viel. */}
        {aktiv && !schmal && <Kaesetropfen klasse="schiff__tropfen" menge={9} />}
      </div>
    </div>
  )
}
