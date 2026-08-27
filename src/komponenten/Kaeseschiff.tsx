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
  /* ═══ Erster Takt: die Verwandlung, im HINTERGRUND ═══
     Klein und gedämpft, hinter Bildern und Text. Es begleitet das Lesen,
     statt es zu unterbrechen. Die Skala ist gegenüber der Vorfassung halbiert
     — nicht weil das Schiff kleiner wurde, sondern weil sein Rahmen doppelt
     so gross ist (siehe .schiff im Stilblatt): dieselbe Zahl bedeutet jetzt
     das Doppelte. */
  /* ═══ Es fällt sofort in die untere Bildhälfte ═══
     Karol: „wenn man scrollt, soll das Schiff noch schneller nach unten
     kommen, damit es nicht so stört."
     Die Bahn schwang vorher um die Fenstermitte — also genau durch den
     Streifen, in dem Überschriften und Fliesstext stehen. Jetzt fällt sie
     zwischen 0,0 und 0,07 von oben ausserhalb des Bildes auf +0,10 und bleibt
     dann im unteren Drittel (0,10 bis 0,38). Über der Leseebene liegt damit
     nichts mehr; das Gebäck begleitet von unten. */
  { p: 0.0, x: -32, y: -0.94, dreh: -24, drehY: 44, drehX: 16, skala: 0.13, deck: 0 },
  { p: 0.07, x: -33, y: 0.1, dreh: -18, drehY: 34, drehX: 11, skala: 0.17, deck: 0.28 },
  { p: 0.19, x: -28, y: 0.34, dreh: -11, drehY: 24, drehX: 4, skala: 0.2, deck: 0.28 },
  { p: 0.33, x: -33, y: 0.22, dreh: -3, drehY: 12, drehX: -2, skala: 0.24, deck: 0.28 },
  { p: 0.44, x: 28, y: 0.38, dreh: 10, drehY: -19, drehX: -6, skala: 0.28, deck: 0.28 },
  { p: 0.52, x: 34, y: 0.16, dreh: 18, drehY: -37, drehX: -11, skala: 0.32, deck: 0.28 },
  /* ═══ Zweiter Takt: der Auftritt ═══
     Es kommt nach vorn — Deckkraft, Grösse und Stapelordnung wechseln
     gemeinsam. Karol: „teilweise transparent hinter dem eigentlichen Inhalt
     verborgen, und dann irgendwie danach auftreten."
     Bei 0,56 endet die Galerie gerade (Scrollstand 5827 gegen 5760): das
     Schiff tritt in dem Moment hervor, in dem die letzte Sektion, in der es
     nichts zu suchen hat, aus dem Bild geht. */
  { p: 0.58, x: -14, y: 0.24, dreh: 6, drehY: -10, drehX: -3, skala: 0.46, deck: 0.72 },
  { p: 0.62, x: -2, y: 0.1, dreh: 1, drehY: 2, drehX: 1, skala: 0.74, deck: 1 },
  /* ═══ Dritter Takt: der Höhepunkt ═══
     Von 0,66 bis 0,78 steht x auf NULL. Der Riss fällt mitten hinein, und die
     Bewegung, die ihn trägt, kommt allein aus der Grösse: 0,96 → 1,09.
     Gedreht wird hier nicht — `rotateY` verschiebt einen 1750 px breiten
     Gegenstand unter der Perspektive seitlich, gemessen 71 px bei sechs Grad,
     und genau das las Karol als „zu weit rechts". */
  { p: 0.66, x: 0, y: 0.02, dreh: 0, drehY: 0, drehX: 0, skala: 0.96, deck: 1 },
  { p: 0.72, x: 0, y: 0.0, dreh: 0, drehY: 0, drehX: 0, skala: 1.03, deck: 1 },
  { p: 0.78, x: 0, y: -0.01, dreh: 0, drehY: 0, drehX: 0, skala: 1.09, deck: 1 },
  /* Und weg zur Seite — nach rechts, weil die Leserichtung dorthin zeigt.
     Über 0,22 des Verlaufs statt über 0,14: ein langer Abflug liest sich
     ruhig, ein kurzer als Zucken. */
  { p: 0.86, x: 54, y: -0.05, dreh: 11, drehY: -22, drehX: -7, skala: 1.1, deck: 1 },
  { p: 0.94, x: 108, y: -0.11, dreh: 18, drehY: -32, drehX: -9, skala: 1.12, deck: 1 },
  { p: 1.0, x: 142, y: -0.14, dreh: 21, drehY: -36, drehX: -10, skala: 1.13, deck: 0 },
]

/**
 * Die Verwandlung — und der Schnitt am Ende.
 *
 * ═══ Warum die Stufen wieder da sind ═══
 *
 * Sie waren einen Bau lang draussen, weil Karol sie als „mehrere Bilder, die
 * zusammengeknallt wurden" gelesen hat. Das war richtig beobachtet und falsch
 * zugeordnet: schuld war nicht die Abfolge, sondern die ÜBERBLENDUNG — zwei
 * Fotos zu je halber Deckkraft lassen den Grund durch, und was man sieht, sind
 * zwei Geister statt eines Gegenstands.
 *
 * Ohne die Stufen fehlte dann aber die Ordnung: „die Scroll History ist nicht
 * mehr logisch strukturell … das Schiff soll am Anfang so wie Mehl sein und
 * sich dann über die Schritte verwandeln bis fertig, und dann Highlight."
 *
 * ═══ Woran die Stufen jetzt hängen ═══
 *
 * Bei Shupatto nachgesehen (Mobbin): dort wechselt EIN Produkt seinen Zustand,
 * und daneben steht, bei welchem Schritt man ist. Der Zähler macht aus einer
 * Bildfolge eine Erklärung. Seed macht dasselbe mit einer beschrifteten
 * Zeitleiste.
 *
 * Diese Seite hat beides schon: die Handarbeit zählt 01 bis 04 und beschriftet
 * jeden Schritt. Die Stufen sind deshalb an DIESE Schritte gebunden — das
 * Schiff zeigt, wovon der Text gerade spricht:
 *
 *   01 Mehl auf die Fläche   →  Teigkugel
 *   02 Von Hand gerollt      →  gewalzt
 *   03 Erst dann belegt      →  belegt
 *   04 In die Glut           →  gebacken
 *   Und dann bricht es auf   →  gerissen
 *
 * ═══ Zwei verschiedene Übergänge, und das mit Absicht ═══
 *
 * TEIG → GEBACKEN wird übergeblendet, aber „darüber" statt „gegeneinander":
 * die untere Stufe bleibt bei voller Deckung stehen, die neue kommt darüber
 * von null auf eins. Das Ergebnis ist an jeder Stelle undurchsichtig — es gibt
 * keinen Moment, in dem der Grund durchscheint. Möglich ist das nur, weil jede
 * Stufe die vorige weitgehend verdeckt: der Teig wächst.
 *
 * GEBACKEN → GERISSEN wird GESCHNITTEN. Derselbe Kniff geht hier nicht: das
 * gerissene Gebäck hat in der Mitte einen Spalt, und durch den sähe man das
 * heile darunter — schlimmer als ein Geist. Ein Schnitt ist hier ohnehin das
 * Richtige: ein Gebäck bricht nicht über eine halbe Sekunde auf, es bricht.
 */
const STUFEN: readonly { klasse: string; ab: number }[] = [
  { klasse: 'stufe-1-kugel', ab: 0.0 },
  { klasse: 'stufe-2-gewalzt', ab: 0.13 },
  { klasse: 'stufe-3-belegt', ab: 0.27 },
  { klasse: 'stufe-4-gebacken', ab: 0.4 },
]

/**
 * Wie lang ein Stufenwechsel dauert, in Anteilen des Verlaufs.
 *
 * 0,07 statt 0,05 — bei 4600 px Gesamtweg sind das 320 statt 230 px Scroll je
 * Wechsel. Länger ist hier gefahrlos: es wird „darüber" geblendet, das Bild
 * bleibt an jeder Stelle undurchsichtig. Was länger dauert, ist nur die
 * Verwandlung selbst, und die soll man sehen.
 */
const WECHSEL = 0.07

/**
 * Wo geschnitten wird.
 *
 * 0,80 und nicht 0,78: bei 0,78 steht das Schiff still und gross in der
 * Mitte — dort wäre der Schnitt ein Sprung. Zwischen 0,78 und 0,86 legt es
 * 46 % der Fensterbreite zurück; bei 0,80 ist es schon unterwegs und dreht
 * sich dabei. Genau dort fällt ein Wechsel nicht auf.
 *
 * Der ganze dritte Takt liegt jetzt früher als im Vorbau. Gemessen fiel der
 * Riss dort auf Scrollstand 6470 — die Speisekarte, eine Sektion zu spät.
 * Der Höhepunkt gehört dorthin, wo der Text dazu steht.
 */
const SCHNITT = 0.7

/**
 * Wo der Auftritt liegt: davor hinten und gedämpft, danach vorn und voll.
 *
 * Die Zahl steuert nicht nur die Deckkraft (die steht in der Bahn), sondern
 * die STAPELORDNUNG — und die kann nicht weich sein. Ein Gegenstand ist
 * entweder vor oder hinter einer Fläche. Der Umschlag liegt deshalb dort, wo
 * die Deckkraft ohnehin schon fast oben ist: der Wechsel fällt dann mit einer
 * Bewegung zusammen statt für sich zu stehen.
 */
const VORN_AB = 0.56

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

    const bahn = el.parentElement!
    const stufen = STUFEN.map((x) => el.querySelector<HTMLElement>(`.schiff__stufe--${x.klasse}`))
    const gerissen = el.querySelector<HTMLElement>('.schiff__stufe--riss-3')
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

        /**
         * ═══ Der Ruck im Moment des Aufbrechens ═══
         *
         * Eine halbe Sinuswelle über drei Prozent des Verlaufs, auf die Grösse
         * gelegt: das Gebäck springt beim Reissen um dreieinhalb Prozent auf
         * und geht sofort wieder zurück.
         *
         * Das ist kein Effekt, sondern Physik. Etwas, das unter Spannung
         * steht, macht beim Bruch genau diese eine Bewegung — und sie ist der
         * Grund, warum ein Schnitt als BEWEGUNG gelesen wird statt als
         * Bildwechsel. Karol: „das Highlight muss flüssiger werden."
         */
        const ruck = p >= SCHNITT ? Math.sin(klemmen((p - SCHNITT) / 0.03) * Math.PI) * 0.035 : 0

        el.style.transform =
          `translate3d(${(w.x / 100) * vw}px, ${(w.y + tiefer) * vh}px, 0)` +
          ` rotateY(${w.drehY}deg) rotateX(${w.drehX}deg)` +
          ` rotate(${w.dreh}deg) scale(${w.skala * (1 + ruck)})`
        el.style.opacity = String(w.deck)

        /**
         * Welche Stufe, und wie weit ist die nächste schon darüber.
         *
         * Über dem Schnitt gilt nichts davon mehr: dann steht das gerissene
         * Gebäck allein da, und alle Teigstufen sind aus. Kein Zwischenwert,
         * nie zwei halbdurchsichtige Gebäcke übereinander.
         */
        const auf = p >= SCHNITT
        if (gerissen) gerissen.style.opacity = auf ? '1' : '0'

        let i = STUFEN.length - 1
        while (i > 0 && p < STUFEN[i]!.ab) i--
        /* Wie weit die Stufe `i` schon eingeblendet ist. Die Stufen darunter
           bleiben bei EINS stehen, solange der Wechsel läuft — dadurch ist das
           Bild an jeder Stelle undurchsichtig. Ist er durch, gehen sie auf
           null, damit kein Rand einer älteren Stufe hervorlugt. */
        const ein = glatt(klemmen((p - STUFEN[i]!.ab) / WECHSEL))
        for (let k = 0; k < stufen.length; k++) {
          const el2 = stufen[k]
          if (!el2) continue
          const d = auf ? 0 : k === i ? ein : k === i - 1 && ein < 1 ? 1 : 0
          el2.style.opacity = String(d)
          /**
           * ═══ `visibility`, nicht nur `opacity` ═══
           *
           * Eine Aufnahme bei Deckkraft null ist unsichtbar, bleibt aber Teil
           * der Ebene und wird mitgerastert. Das Schiff ändert jeden Frame
           * seine Grösse, und bei jeder Änderung rastert der Browser die ganze
           * Ebene neu — also fünf Fotos statt einem.
           *
           * Gemessen war das der teuerste Posten der Seite: mit
           * ausgeblendetem Schiff fiel das 95. Perzentil im Hintergrundtakt
           * von 29,9 auf 19,8 ms. `hidden` nimmt die Aufnahme aus dem
           * Rasterlauf, `opacity: 0` nicht.
           */
          el2.style.visibility = d > 0.001 ? 'visible' : 'hidden'
        }
        if (gerissen) gerissen.style.visibility = auf ? 'visible' : 'hidden'

        /**
         * Vorn oder hinten.
         *
         * Der Wurf des Schattens geht mit: ein gedämpfter Gegenstand hinter
         * einer Fläche wirft keinen langen Schatten nach vorn. Ein Schatten,
         * der nicht zur Deckkraft passt, ist genau der Grund, warum eine
         * Ebene „aufgeklebt" aussieht.
         */
        const vorne = p >= VORN_AB
        bahn.classList.toggle('schiffbahn--vorn', vorne)
        /**
         * Im Hintergrundtakt GAR KEIN Schatten.
         *
         * Zwei Gründe, und beide zählen. Erstens: ein Gegenstand, der bei 28 %
         * Deckkraft hinter Bild und Text liegt, wirft keinen Schatten nach
         * vorn — ein Wurf dort lässt die Ebene aufgeklebt aussehen.
         * Zweitens kostet er. `filter: drop-shadow` auf einem Bild, das sich
         * jeden Frame skaliert, kann der Browser nicht zwischenspeichern;
         * gemessen war der Hintergrundtakt der einzige Abschnitt der Seite mit
         * ausgelassenen Bildern (p95 32 ms gegen 18 ms im Höhepunkt).
         * `none` schaltet den ganzen Durchgang ab, nicht nur seine Stärke.
         */
        el.style.filter = vorne ? 'var(--schatten-speise)' : 'none'
        el.style.setProperty('--wurf', vorne ? '2.1' : '0')

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
        /* Karol: „der Dampf soll bleiben, das ist top … den darf man schon noch
           etwas stärker machen." Von 0,5 auf 0,9, und er setzt früher ein —
           ab 0,62 statt 0,70, damit er schon steht, wenn das Gebäck nach vorn
           kommt. Dampf, der erst mit dem Höhepunkt erscheint, sieht aus, als
           hätte ihn jemand eingeschaltet. */
        if (dampf) dampf.style.opacity = String(glatt(klemmen((p - 0.56) / 0.12)) * 0.9)
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
          /* ═══ Nicht mehr 88 %, sondern am oberen Rand ═══
             Karol: „nach dieser Lahmacun-Drehseite kommt das schon fertig in
             den Bildschirm rein, obwohl ich meinte, dass die Backlogik zu
             sehen sein soll."
             Bei 88 % begann die Reise 792 px VOR der Handarbeit — also noch
             über dem dunklen Vorhang. Dort ist ein blasser Teigling bei knapp
             halber Deckkraft praktisch unsichtbar, und wer weiterscrollt,
             sieht als Erstes das fertige Gebäck. Die Verwandlung fiel damit
             genau in den einzigen Abschnitt, in dem man sie nicht sehen kann.
             Jetzt beginnt sie mit der Sektion, die sie erklärt. */
          start: 'top top',
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
        {[...STUFEN.map((x) => x.klasse), 'riss-3'].map((klasse) => (
          <img
            key={klasse}
            className={`schiff__stufe schiff__stufe--${klasse}`}
            src={`/bilder/riss/${klasse}.webp`}
            /* Jede Stufe mit IHREN Massen: die drei Teigstufen liegen als
               760 px breite Fassungen vor, weil sie nie grösser gezeigt
               werden. Ein festes Mass für alle hiesse hier, dem Browser eine
               falsche Grösse zu nennen. */
            width={M[klasse]!.breite}
            height={M[klasse]!.hoehe}
            alt=""
            decoding="async"
          />
        ))}
      </div>
    </div>
  )
}
