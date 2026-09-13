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
 * Die Bahn eines Stücks über den Fortschritt 0..1 der Salve.
 *
 *   0,00–0,28  AUSTRITT   aus dem Spalt, klein, wird gross, fächert auf
 *   0,28–0,62  BOGEN      um die Karte, jedes auf seinem Winkel
 *   0,62–0,84  RAND       drei links, drei rechts, ruhig
 *   0,84–1,00  ÜBERGABE   sinkt Richtung Schwarm und verblasst
 *
 * Koordinaten in Prozent des Fensters (x, y = Mitte des Stücks).
 */
function bahn(p: number, i: number, schmal: boolean): Lage {
  const n = SECHS.length
  const links = i % 2 === 0
  /* Jedes Stück hat seinen Winkel auf dem Bogen; die Reihenfolge läuft im
     Uhrzeigersinn von oben, damit Zaatar oben steht und Lahmacun unten. */
  const winkel = -Math.PI / 2 + (i / n) * Math.PI * 2
  /* Der Bogen muss die Karte freilassen: min(86vw, 29rem) breit, gut 60 vh
     hoch. Am Schirm reicht ein breites Oval, am Handy ist die Karte fast so
     breit wie das Fenster — dort wird das Oval hoch und schmal, die Stücke
     streifen oben und unten an ihr vorbei. */
  /* Am Handy liegt der Bogen AUF dem Fensterrand: die Karte ist dort 86 %
     der Breite, ein Bogen um sie herum hätte sie gekreuzt — gemessen lagen
     bei rx 40 zwei Stücke auf den Preiszeilen. Bei rx 50 stehen die Stücke
     halb im Bild und rahmen die Karte von den vier Rändern her; das ist der
     Rand-Entwurf von Anfang an, und das Einzige, was dort nicht verdeckt. */
  const rx = schmal ? 50 : 34
  const ry = schmal ? 50 : 42
  const bx = 50 + Math.cos(winkel) * rx
  const by = 50 + Math.sin(winkel) * ry
  /* Der Rand: drei Stück je Seite, senkrecht gestaffelt. */
  const rxRand = schmal ? (links ? 14 : 86) : (links ? 9 : 91)
  const ryRand = 22 + Math.floor(i / 2) * 28
  /* Die Übergabe: der Schwarm kommt von UNTEN ins Bild. Die Stücke sinken
     ein Stück, damit die Richtung stimmt, und verblassen dabei. */
  const uebergabeY = ryRand + 26

  const sk0 = schmal ? 0.62 : 0.62   // Grundgrösse; Lahmacun und Zaatar sind ohnehin die grössten Bilder

  if (p < 0.28) {
    const t = glatt(klemmen(p / 0.28))
    /* Versetzt: Stück i startet ein wenig später, damit sie nicht als Klumpen
       austreten, sondern nacheinander — „eins nach dem anderen". */
    const tv = glatt(klemmen((p - i * 0.025) / 0.24))
    return {
      x: misch(50, bx, tv),
      y: misch(52, by, tv),
      dreh: misch(links ? -40 : 40, links ? -8 : 8, tv),
      sk: misch(0.12, sk0, tv),
      deck: t <= 0 ? 0 : klemmen(tv * 3),
    }
  }
  if (p < 0.62) {
    /* Auf dem Bogen wandern alle gemeinsam ein Viertel weiter — das ist das
       „Swingen" um die Karte. */
    const t = glatt(klemmen((p - 0.28) / 0.34))
    const w = winkel + t * Math.PI * 0.5
    return {
      x: 50 + Math.cos(w) * rx,
      y: 50 + Math.sin(w) * ry,
      dreh: (links ? -8 : 8) + Math.sin(t * Math.PI) * 6,
      sk: sk0 + Math.sin(t * Math.PI) * 0.06,
      deck: 1,
    }
  }
  if (p < 0.84) {
    const t = glatt(klemmen((p - 0.62) / 0.22))
    const w = winkel + Math.PI * 0.5
    const ax = 50 + Math.cos(w) * rx
    const ay = 50 + Math.sin(w) * ry
    return {
      x: misch(ax, rxRand, t),
      y: misch(ay, ryRand, t),
      dreh: misch(links ? -8 : 8, links ? -12 : 12, t),
      sk: misch(sk0, sk0 * 0.92, t),
      deck: 1,
    }
  }
  const t = glatt(klemmen((p - 0.84) / 0.16))
  return {
    x: rxRand,
    y: misch(ryRand, uebergabeY, t),
    dreh: links ? -12 : 12,
    sk: sk0 * 0.92,
    deck: 1 - t,
  }
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
          prozess.style.setProperty('--schwarm-deck', String(glatt(klemmen((p - 0.84) / 0.16))))
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
