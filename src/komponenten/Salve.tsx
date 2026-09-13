import { useEffect, useRef, useState } from 'react'
import { SCRUB_KOERPER, useMedienabfrage, werkzeugHolen } from '../bewegung.ts'
import { GEBAECKE } from '../gebaecke.ts'
import Dampf from './ui/Dampf.tsx'

/**
 * Die Salve — sechs Gebäcke, die aus dem aufgehenden Lahmacun treten.
 *
 * ═══ Was Karol am 12.09. beschrieben hat ═══
 *
 * „Der Lahmacun geht auf. Das erzeugt eine Salve, die um die Karte swingt;
 * die Karte bleibt stehen. Man sieht, wie sich die Salve vom Bogen in den
 * Rand umformiert, und dann findet eine Übergangsanimation in die nächste
 * Sektion statt — die Produkte ordnen sich hinten ein und positionieren
 * sich." Und die Nummer aus dem Entwurf: „der erste Bogen ist der beste."
 *
 * ═══ Warum das ein Prolog ist und kein eigener Schwarm ═══
 *
 * Die Gebäcke in „Alles entsteht vor deinen Augen" haben schon einen
 * Scrollflug (`useFlug` in Handarbeit.tsx): sie steigen von unten ein, sobald
 * die Sektion ins Bild kommt, und ziehen durch sie hindurch. Das IST das
 * „hinten einordnen". Was fehlte, war die Herkunft — sie tauchten aus dem
 * Nichts auf. Die Salve gibt ihnen eine: dieselben sechs Stücke treten hier
 * aus dem Spalt, ziehen um die Karte, sammeln sich an den Rändern und
 * übergeben an den Schwarm, der von unten nachrückt.
 *
 * ═══ Dieselbe Mechanik wie das Käseschiff ═══
 *
 * Eine feste Ebene über den Sektionen, ein Fortschritt über einen Scrub, eine
 * Wegpunkttabelle je Stück. Nichts davon ist neu; Kaeseschiff.tsx hat jeden
 * Fehler dieser Bauart schon einmal gefunden — der Scrub glättet die
 * VERKNÜPFTE Animation und nicht die Rohmeldung, deshalb läuft `p` über ein
 * Hilfsobjekt; `will-change` nur während der Fahrt; ohne Bewegungswunsch
 * fliegt nichts.
 *
 * ═══ Die Übergabe ═══
 *
 * Der Schwarm bekommt eine Variable `--schwarm-deck` auf `.prozess`, die seine
 * Deckung multipliziert. Die Salve schreibt sie: 0, solange sie selbst fliegt,
 * und über ihr letztes Sechstel hoch auf 1, während ihre eigenen Stücke
 * verblassen. Zwei ähnliche Gegenstände, die einander an derselben Stelle
 * ablösen, lesen sich als EIN Gegenstand — auch wenn sie um ein paar Dutzend
 * Pixel auseinanderliegen. Deshalb eine Überblendung und kein harter Tausch:
 * die genaue Bildschirmlage des Schwarms hängt an seinem eigenen Flug, und
 * die nachzurechnen wäre eine zweite Wahrheit neben useFlug.
 *
 * Wird die Salve gar nicht gebaut (Bewegungswunsch, kein Werkzeug), bleibt
 * `--schwarm-deck` auf dem Vorgabewert 1. Der Schwarm ist dann einfach da.
 */

/** Die sechs, in der Reihenfolge der Karte — Zaatar zuerst, Lahmacun zuletzt. */
const SECHS = ['zaatar', 'fatayer', 'sesam', 'stapel', 'rolle', 'lahmacun'] as const

type Lage = { x: number; y: number; dreh: number; sk: number; deck: number }

const klemmen = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const glatt = (t: number) => t * t * (3 - 2 * t)
const misch = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * ═══ Der Schweif ═══
 *
 * Karol am 13.09.: „nicht im Kreis, sondern als Schweif um die Karte …
 * alle nacheinander, von rechts oben nach einer Kurve in die Mitte nach
 * links, und an der linken Seite wieder eine Kurve rechts in die Mitte, wie
 * magische Schweife … dann in die Mitte reinfliegen und in die neue Sektion."
 *
 * Also EINE Kurve, und die sechs Stücke sitzen als Perlen darauf, jedes ein
 * Stück hinter dem vorigen — wie das Band bei Copy.ai (Mobbin), das um den
 * Inhalt herumführt. Nicht sechs Bahnen, sondern eine Bahn mit sechs
 * Abständen; nur so bleibt die Kette eine Kette.
 *
 * Die Kurve läuft durch Stützpunkte (Catmull-Rom, glatt durch jeden Punkt):
 * aus dem Spalt hoch nach rechts, über die Karte hinweg nach links, an der
 * linken Seite hinunter, und unten zur Mitte hinein — dort übernimmt der
 * Schwarm der nächsten Sektion. Am Handy liegen die Punkte weiter aussen,
 * damit die Kette die Karte nicht kreuzt.
 */
type Punkt = [number, number]

const SCHWEIF_BREIT: Punkt[] = [
  [50, 50],  // der Spalt
  [68, 34],  // hoch nach rechts
  [80, 10],  // rechts oben
  [52, -3],  // über die Karte hinweg — knapp über dem Rand, damit die Perle
             // die Bogenspitze der Karte nicht streift (gemessen bei y 5)
  [22, 10],  // links oben
  [10, 40],  // die linke Seite hinunter
  [17, 68],  // links unten
  [42, 86],  // zur Mitte hinein
  [52, 104], // und hinaus — in die nächste Sektion
]
/* Am Handy weiter aussen als am Schirm, aber nicht ganz hinaus: gemessen
   lagen bei x 92 und x 3 zwei Perlen vollstaendig ausserhalb des Bildes.
   Bei 82 / 14 steht eine 36-vw-Perle halb im Bild — das ist der Rand, den
   Karol meint, und man sieht sie noch. */
const SCHWEIF_SCHMAL: Punkt[] = [
  [50, 50],
  [80, 30],
  [84, 8],
  [50, -4],
  [16, 10],
  [12, 40],
  [16, 68],
  [38, 88],
  [52, 104],
]

/** Catmull-Rom durch die Stützpunkte; t in 0..1 über die ganze Kette. */
function aufKurve(pts: Punkt[], t: number): Punkt {
  const n = pts.length - 1
  const f = klemmen(t) * n
  const i = Math.min(Math.floor(f), n - 1)
  const u = f - i
  const p0 = pts[Math.max(0, i - 1)]!, p1 = pts[i]!, p2 = pts[i + 1]!, p3 = pts[Math.min(n, i + 2)]!
  const cr = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u)
  return [cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])]
}

/** Abstand der Perlen auf der Kette und Dauer je Perle, in Anteilen der Salve. */
const ABSTAND = 0.075
const DAUER = 0.55

function bahn(p: number, i: number, schmal: boolean): Lage {
  const pts = schmal ? SCHWEIF_SCHMAL : SCHWEIF_BREIT
  const s = klemmen((p - i * ABSTAND) / DAUER)
  const [x, y] = aufKurve(pts, s)
  /* Die Neigung folgt der Kurve: ein Stück weiter vorn zeigt die Richtung. */
  const [x2, y2] = aufKurve(pts, Math.min(1, s + 0.02))
  const dreh = Math.atan2(y2 - y, x2 - x) * (180 / Math.PI) * 0.25
  /* Klein aus dem Spalt, voll auf der Kette, kleiner beim Hineinfliegen —
     was in die nächste Sektion geht, entfernt sich. */
  const sk = s < 0.12 ? misch(0.15, 1, glatt(s / 0.12)) : s > 0.8 ? misch(1, 0.72, glatt((s - 0.8) / 0.2)) : 1
  const deck = s <= 0 ? 0 : s < 0.08 ? glatt(s / 0.08) : s > 0.86 ? 1 - glatt((s - 0.86) / 0.14) : 1
  return { x, y, dreh, sk: sk * (schmal ? 0.62 : 0.62), deck }
}

export default function Salve() {
  const schmal = useMedienabfrage('(max-width: 719px)')
  const ruhig = useMedienabfrage('(prefers-reduced-motion: reduce)')
  const [bereit, setBereit] = useState(false)
  const ebene = useRef<HTMLDivElement>(null)

  /* Wie beim Käseschiff: erst bauen, wenn die Startseite durch ist. Ein
     festes Element gilt dem Browser immer als „im Bild" und zöge sonst sechs
     Bilder in den ersten Ladevorgang. */
  useEffect(() => {
    if (ruhig) return
    let tot = false
    let abraeumen: (() => void) | undefined
    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      const st = werkzeug.ScrollTrigger.create({
        /* Seit dem 13.09. ist der Vorhang die Startseite; `.backstube` gibt
           es nicht mehr. Gebaut wird, sobald der Besucher zu scrollen beginnt
           — `top -10%` ist ein Zehntel Fensterhoehe. Vorher gehoert die
           Ladezeit dem Auftakt. */
        trigger: '.vorhang',
        start: 'top -10%',
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

  useEffect(() => {
    const el = ebene.current
    if (!el || !bereit || ruhig) return
    const stuecke = SECHS.map((id) => el.querySelector<HTMLElement>(`[data-salve="${id}"]`))
    const prozess = document.querySelector<HTMLElement>('.prozess')
    const vorhang = document.querySelector<HTMLElement>('.vorhang')
    if (!prozess || !vorhang) return

    let tot = false
    let abraeumen: (() => void) | undefined

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      const { gsap, ScrollTrigger } = werkzeug
      const zustand = { p: 0 }
      let aktiv = false

      /* ═══ Wo die Salve beginnt ═══
         Der Scrub läuft von der Oberkante des Vorhangs bis zur Oberkante der
         Handarbeit. Der Lahmacun öffnet sich aber erst bei 46 % SEINES
         Weges (TEILT_AB in Vorhang.tsx). Der Anteil davon am Gesamtweg hängt
         an den Sektionshöhen und wird bei jedem Refresh neu gerechnet — eine
         feste Zahl wäre beim ersten Handy falsch. */
      let abP = 0.3
      const rechnen = () => {
        const vh = window.innerHeight
        const vorhangWeg = Math.max(1, vorhang.offsetHeight - vh)
        const gesamt = Math.max(1, prozess.offsetTop - vorhang.offsetTop)
        abP = klemmen((0.46 * vorhangWeg) / gesamt, 0.05, 0.9)
      }
      rechnen()

      const zeichnen = () => {
        const p = klemmen((zustand.p - abP) / (1 - abP))
        const vw = window.innerWidth
        const vh = window.innerHeight
        stuecke.forEach((s, i) => {
          if (!s) return
          const l = bahn(p, i, schmal)
          const w = s.offsetWidth || 1
          const h = s.offsetHeight || 1
          s.style.transform = `translate3d(${(l.x / 100) * vw - w / 2}px, ${(l.y / 100) * vh - h / 2}px, 0) rotate(${l.dreh}deg) scale(${l.sk})`
          s.style.opacity = String(l.deck)
        })
        /* Die Übergabe an den Schwarm: er wird sichtbar, während die Salve
           verblasst. Vor 0,84 ist er unsichtbar — sonst stünde er schon da,
           wenn seine Sektion ins Bild kommt, und die Salve brächte nichts.

           ═══ Nur schreiben, solange die Salve wirklich läuft ═══
           Gemessen: wer per Anker direkt in die Öfen springt, sah KEIN
           einziges Gebäck. Das erste `zeichnen()` beim Aufbau schrieb 0, der
           Auslöser war nie aktiv, `onLeave` kam nie — die 0 blieb. Deshalb
           schreibt die Deckung nur, wer im Bereich ist; ausserhalb gilt die
           Vorgabe 1, und die steht im Stilblatt, nicht hier. */
        if (aktiv) {
          /* Die letzte Perle verlässt die Kette bei 5 * ABSTAND + DAUER = 0,925;
             der Schwarm kommt genau in dem Fenster, in dem die Kette in die
             Mitte hineinfliegt. */
          prozess.style.setProperty('--schwarm-deck', String(glatt(klemmen((p - 0.78) / 0.2))))
        } else {
          prozess.style.removeProperty('--schwarm-deck')
        }
      }

      const tween = gsap.to(zustand, {
        p: 1,
        ease: 'none',
        onUpdate: zeichnen,
        scrollTrigger: {
          trigger: '.vorhang',
          start: 'top top',
          endTrigger: '.prozess',
          /* `top 15%`, nicht `top top`: die Übergabe soll fertig sein, wenn
             die Öfen anfangen zu kleben. Die letzten 15 % Fensterhöhe sind
             der Weg, auf dem der Schwarm von unten sichtbar hereinkommt. */
          end: 'top 15%',
          scrub: SCRUB_KOERPER,
          invalidateOnRefresh: true,
          onRefresh: rechnen,
          onToggle: ({ isActive }) => {
            aktiv = isActive
            el.style.willChange = isActive ? 'transform, opacity' : ''
            el.classList.toggle('salvebahn--aktiv', isActive)
            /* Ausserhalb des Bereichs gehört der Schwarm sich selbst; die
               Vorgabe 1 im Stilblatt übernimmt. Beim Eintritt zeichnet der
               nächste Scrub-Schritt ohnehin neu. */
            if (!isActive) prozess.style.removeProperty('--schwarm-deck')
            else zeichnen()
          },
        },
      })

      zeichnen()
      ScrollTrigger.refresh()

      abraeumen = () => {
        tween.scrollTrigger?.kill()
        tween.kill()
        el.style.willChange = ''
        prozess.style.removeProperty('--schwarm-deck')
      }
    })

    return () => {
      tot = true
      abraeumen?.()
    }
  }, [bereit, ruhig, schmal])

  if (ruhig || !bereit) return null

  return (
    <div className="salvebahn" ref={ebene} aria-hidden="true">
      {SECHS.map((id) => {
        const g = GEBAECKE.find((x) => x.id === id)
        if (!g) return null
        return (
          <div className="salve__stueck" data-salve={id} key={id}>
            <Dampf ton="ofen" klasse="salve__dampf" dichte={2} feinheit={0.7} />
            <img
              /* KEIN pfad() hier. `g.bilder[0]` ist im Quelltext eine
                 Zeichenkette mit Anfuehrungszeichen — genau die faengt das
                 Unterpfad-Plugin in vite.config.ts beim Bauen ab und setzt
                 die Basis davor. pfad() setzte sie dann ein zweites Mal:
                 gemessen auf der Live-Adresse `/aram-web/aram-web/bilder/…`,
                 sechsmal 404. Der Schwarm in Handarbeit.tsx nutzt dieselben
                 Pfade ohne pfad() und laeuft — also so wie dort. */
              src={g.bilder[0].replace('.webp', '-500.webp')}
              alt=""
              width={500}
              height={Math.round((500 * g.hoehe) / g.breite)}
              decoding="async"
            />
          </div>
        )
      })}
    </div>
  )
}
