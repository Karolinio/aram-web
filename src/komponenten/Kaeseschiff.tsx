import { useEffect, useRef, useState } from 'react'

import rissRoh from '../../inhalt/riss.json'
import { SCRUB_KOERPER, useMedienabfrage, werkzeugHolen } from '../bewegung.ts'
import Dampf from './ui/Dampf.tsx'

type Mass = { breite: number; hoehe: number }
const M = rissRoh as Record<string, Mass>

/**
 * Das Käseschiff — EIN Gebäck, das fliegt und am Ende aufbricht.
 *
 * ═══ Warum die Verwandlung raus ist ═══
 *
 * Karol am 26.08.: „Es ist nicht ein konsistentes Käseschiff, das rumfliegt
 * und am Ende sich aufteilt, sondern wirkt wie so mehrere Bilder, die
 * irgendwie zusammengeknallt wurden und irgendwas Rundes zusammengegeben
 * wurden."
 *
 * „Irgendwas Rundes" ist die Teigkugel. Sie war der Anfang einer Verwandlung
 * — Kugel → gewalzt → belegt → gebacken → reisst auf —, und die hat er nicht
 * als Verwandlung gelesen, sondern als Diaserie. Zu Recht: dieselbe Abfolge
 * steht eine Sektion höher in der Handarbeit, mit Bildern, die stehen bleiben
 * und die man ansehen kann. Ein fliegender Gegenstand, der nebenbei dieselbe
 * Geschichte nochmal erzählt, erzählt sie nicht doppelt so gut, sondern
 * halbiert beide.
 *
 * Übrig ist, was er beschrieben hat: EIN Käseschiff. Es fliegt durch drei
 * Sektionen, und am Ende bricht es auf. Zwei Aufnahmen, ein harter Schnitt
 * dazwischen — mehr nicht.
 *
 * ═══ Warum GAR NICHT überblendet wird ═══
 *
 * „Man soll im Hintergrund nicht dieses Transparente sehen, sondern einfach
 * nur dieses Käseschiff, damit es echter aussieht … dadurch verliert die ganze
 * Scrollanimation an Wertigkeit."
 *
 * Das Transparente war die Überblendung selbst. Zwei Fotos, die einander mit
 * je halber Deckkraft ablösen, ergeben nie ein halb verwandeltes Gebäck — sie
 * ergeben ZWEI halbdurchsichtige Gebäcke, durch die der Grund scheint. Genau
 * das war auf seinem Bildschirm zu sehen: ein blasser zweiter Umriss hinter
 * dem scharfen.
 *
 * Es gibt keine Rechnung, die das behebt, weil der Fehler nicht in den Zahlen
 * liegt. Deshalb steht hier jetzt ein SCHNITT: bis zum Bruchpunkt das ganze
 * Gebäck bei voller Deckung, danach das gerissene bei voller Deckung. Nichts
 * dazwischen. So schneidet jeder Film eine Bewegung, die zu schnell ist, um
 * sie zu zeigen — und ein Gebäck, das aufbricht, ist genau das.
 *
 * Ein Gegenstand, der so weit reist, kann in keiner Sektion wohnen — er wäre
 * an deren Unterkante zu Ende. Er liegt fest im Fenster (`position: fixed`)
 * und wird allein vom Scrollfortschritt bewegt: die Seite fährt darunter
 * durch, er bleibt.
 *
 * ═══ Drei Fahrpläne, EIN Fortschritt ═══
 *
 * Die Bahn (`BAHN`) und der Schnitt (`SCHNITT`) lesen beide
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
  /* ═══ Über der Arkade, nicht hindurch ═══
     Die Galerie war eine hohe Sektion, deren Bilder unten sassen — das Schiff
     zog darüber weg. Seit sie eine Arkade auf einer Bildschirmhöhe ist,
     stehen die Bögen in der Bildmitte, und die alte Bahn führte mitten
     hindurch: gemessen bis zu 168 000 Quadratpixel Überdeckung.
     Das ist nicht nur unschön, sondern falsch herum: die Arkade ist das
     einzige Element der Seite, das der Besucher mit der Hand BEDIENT. Etwas
     Grosses darüber fliegen zu lassen, während er zieht, ist, als lege man
     eine Hand auf die Karte, die jemand gerade liest.
     Es fliegt deshalb am oberen Rand vorbei — halb hinter der Kopfzeile, die
     eine Ebene höher liegt. Ein Vorbeiflug am Bildrand liest sich ohnehin
     schneller als einer durch die Mitte. */
  { p: 0.47, x: 24, y: -0.36, dreh: 10, drehY: -19, drehX: -6, skala: 0.55, deck: 1 },
  { p: 0.55, x: 36, y: -0.52, dreh: 15, drehY: -30, drehX: -9, skala: 0.6, deck: 1 },
  /* ═══ Hier geht es kurz aus dem Bild ═══
     Gemessen: die Arkade steht zwischen p 0,40 und 0,67 im Fenster, und ihre
     Oberkante wandert dabei von unten nach oben durch. Ab etwa 0,575 ist der
     Streifen über ihr schmaler als das Schiff und der Streifen unter ihr noch
     nicht frei — es gibt in diesem Fenster keinen Weg vorbei, nur hindurch.
     Also darüber hinaus. Das ist kein Ausweichen, sondern das Richtige: die
     Galerie ist der einzige Ort der Seite, an dem der Besucher selbst etwas
     in die Hand nimmt. Dort hat nichts zu fliegen. Es ist eine durchgehende
     Bewegung, kein Schnitt und keine Blende — das Schiff steigt rechts oben
     aus dem Bild und kommt für den Schluss zurück. */
  { p: 0.6, x: 40, y: -0.78, dreh: 17, drehY: -35, drehX: -10, skala: 0.63, deck: 1 },
  { p: 0.65, x: 22, y: -0.1, dreh: 14, drehY: -26, drehX: -7, skala: 0.68, deck: 1 },
  { p: 0.68, x: 10, y: 0.06, dreh: 12, drehY: -22, drehX: -6, skala: 0.7, deck: 1 },
  /* Tief im Bild, solange die Überschrift der Riss-Sektion oben steht. */
  { p: 0.76, x: -18, y: 0.24, dreh: 6, drehY: -10, drehX: -3, skala: 0.78, deck: 1 },
  /* In der Mitte, ruhig, gross — hier reisst es. Von 0,80 bis 0,86 passiert in
     der Bahn NICHTS ausser dem Wachsen: der Riss soll die einzige Bewegung im
     Bild sein, wenn er kommt. */
  { p: 0.8, x: -4, y: 0.16, dreh: 1, drehY: 2, drehX: 1, skala: 0.9, deck: 1 },
  { p: 0.86, x: 0, y: 0.06, dreh: 0, drehY: 0, drehX: 0, skala: 1.0, deck: 1 },
  /* Und weg zur Seite — nach rechts, weil die Leserichtung dorthin zeigt und
     ein Gegenstand, der entgegen ihr verschwindet, wie ein Rückschritt
     aussieht. Was aus dem Bild fliegt, dreht sich dabei.

     ═══ Es fliegt jetzt WEITER, statt sich aufzulösen ═══

     Vorher stand hier `deck: 0` ab 0,93 — das Schiff wurde bei x = 58 % blass
     und war dabei noch zur Hälfte im Bild. Ein Gebäck, das mitten im Fenster
     durchsichtig wird, ist genau das „Transparente", das Karol gemeldet hat,
     nur am anderen Ende der Bahn.
     Jetzt fliegt es raus wie ein Gegenstand: 46 → 96 → 138 % der Fensterbreite.
     Bei 96 % ist auch am Handy nichts mehr davon zu sehen (dort ist es 116 vw
     breit, also 58 vw je Seite — 96 − 58 = 38 vw jenseits der Mitte bei 50 vw
     halber Fensterbreite). Die Deckkraft fällt erst danach, weil ein fest im
     Fenster liegender Gegenstand am Ende der Bahn dort STEHEN BLEIBT, wenn man
     ihn nicht abräumt. */
  { p: 0.93, x: 46, y: -0.04, dreh: 11, drehY: -22, drehX: -7, skala: 1.08, deck: 1 },
  { p: 0.97, x: 96, y: -0.1, dreh: 17, drehY: -31, drehX: -9, skala: 1.13, deck: 1 },
  { p: 1.0, x: 138, y: -0.14, dreh: 21, drehY: -36, drehX: -10, skala: 1.16, deck: 0 },
]

/**
 * Die zwei Aufnahmen — und der Schnitt dazwischen.
 *
 * ═══ Hier standen fünf ═══
 *
 * Kugel, gewalzt, belegt, gebacken, gerissen — überblendet in einer Kette, bei
 * der die beiden Deckkräfte immer eins ergaben. Rechnerisch sauber, im Bild
 * falsch: zwei Fotos mit je halber Deckkraft verdecken den Grund nicht, sie
 * lassen ihn durch. Man sieht kein halb verwandeltes Gebäck, man sieht zwei
 * durchsichtige. Der Beweis liegt in Karols Aufnahme vom 26.08.: hinter dem
 * scharfen Käseschiff steht ein zweiter, blasser Umriss.
 *
 * Der übliche Ausweg wäre, die untere Aufnahme bei voller Deckung stehen zu
 * lassen und nur die obere einzublenden. Für den Riss taugt er nicht: das
 * gerissene Gebäck hat in der Mitte einen SPALT, und durch den sähe man dann
 * das heile Gebäck darunter — noch schlimmer als ein Geist.
 *
 * Also ein Schnitt. Er ist nicht der Kompromiss, sondern das Richtige: ein
 * Gebäck bricht nicht über eine halbe Sekunde auf, es bricht. Und ein Schnitt
 * mitten in einer schnellen Bewegung ist unsichtbar — darauf beruht jede
 * Filmmontage. Deshalb liegt er nicht auf dem ruhigen Punkt bei 0,86, sondern
 * ein Stück danach, wenn das Schiff schon nach rechts wegzieht.
 */
const GANZ = 'stufe-4-gebacken'
const GERISSEN = 'riss-3'

/**
 * Wo geschnitten wird.
 *
 * 0,885 und nicht 0,86: bei 0,86 steht das Schiff still und gross in der
 * Mitte — dort wäre der Schnitt ein Sprung. Zwischen 0,86 und 0,93 legt es
 * 46 % der Fensterbreite zurück; bei 0,885 ist es schon unterwegs und dreht
 * sich dabei. Genau dort fällt ein Wechsel nicht auf.
 *
 * Von den vier fotografierten Riss-Zuständen (werkzeug/kaesriss.py) ist k33
 * genommen — der dramatischste: lange dünne Fäden, ein paar schon
 * zurückgeschnellt. Die anderen drei bleiben in public/bilder/riss/ liegen.
 */
const SCHNITT = 0.885

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

    const ganz = el.querySelector<HTMLElement>(`.schiff__stufe--${GANZ}`)
    const gerissen = el.querySelector<HTMLElement>(`.schiff__stufe--${GERISSEN}`)
    const dampf = el.querySelector<HTMLElement>('.schiff__dampf')

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

        /* Der Schnitt. Kein Zwischenwert — eins oder null, nie 0,5. Das ist
           der ganze Punkt: es gibt keinen Moment, in dem zwei Gebäcke
           halbdurchsichtig übereinanderliegen. */
        const auf = p >= SCHNITT
        if (ganz) ganz.style.opacity = auf ? '0' : '1'
        if (gerissen) gerissen.style.opacity = auf ? '1' : '0'

        /**
         * Der Dampf kommt erst spät.
         *
         * Er soll bleiben — Karol am 26.08.: „Dieser Rauch soll bleiben beim
         * Käseschiff." Über die ganze Bahn war er aber falsch: auf hellem Clay
         * hat eine helle Schwade wenig Kontrast, und was dabei übrig bleibt,
         * sind blasse Flecken hinter einem kleinen Gebäck — also genau das
         * „Transparente im Hintergrund", das er beanstandet hat.
         *
         * Ab 0,7 ist das Schiff bei 78 % seiner Grösse und kommt auf den
         * Bruchpunkt zu. Dort ist Dampf eine Auskunft (es ist heiss, es kommt
         * gerade auf), vorher war er Deko. */
        if (dampf) dampf.style.opacity = String(glatt(klemmen((p - 0.7) / 0.16)) * 0.5)
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
        {/* Dampf HINTER dem Gebäck: er steigt daraus auf, nicht davor.

            Der KASTEN steht immer, die Leinwand darin nur, solange die Bahn
            läuft. Vorher hing der ganze Kasten an `aktiv` — und damit war er
            beim Start des Effekts noch nicht im Baum, sodass die Zeichenroutine
            ihn nie zu fassen bekam. Eine Suche, die einmal beim Aufbau läuft,
            findet nur, was zu diesem Zeitpunkt dasteht. */}
        <div className="schiff__dampf">{aktiv && <Dampf ton="ofen" />}</div>

        {/* Beide Aufnahmen liegen von Anfang an im Baum und werden nur ein-
            und ausgeschaltet. Der naheliegende Weg wäre, `src` umzusetzen —
            dann muss der Browser das gerissene Gebäck erst beim Schnitt
            dekodieren, also genau in dem Frame, in dem es auffällt. */}
        {[GANZ, GERISSEN].map((klasse) => (
          <img
            key={klasse}
            className={`schiff__stufe schiff__stufe--${klasse}`}
            src={`/bilder/riss/${klasse}.webp`}
            width={M[GANZ]!.breite}
            height={M[GANZ]!.hoehe}
            alt=""
            decoding="async"
          />
        ))}
      </div>
    </div>
  )
}
