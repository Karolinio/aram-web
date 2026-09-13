import { useEffect, useRef, useState } from 'react'

import vorhangRoh from '../../inhalt/vorhang.json'
import { SCRUB_KOERPER, useMedienabfrage, werkzeugHolen } from '../bewegung.ts'
import { inhalt } from '../inhalt.ts'
import { ARAM } from '../aram.config.ts'
import Untergrund from './ui/Untergrund.tsx'
import { status, statusText } from '../oeffnung.ts'

type Mass = { breite: number; hoehe: number }
const M = vorhangRoh as Record<string, Mass>

/**
 * Der Vorhang — eine Scheibe dreht sich, teilt sich, und dahinter liegt die Karte.
 *
 * ═══ Was Karol beschrieben hat ═══
 *
 * „Vielleicht auch mal so probieren: ein rotes Manakisch, was sich so dreht,
 * einfach um sich selbst, aber so flach, wie ein Pfannkuchen … ein grosses,
 * komplett grossflächiges: Du scrollst, das zerteilt sich, und dann kommt die
 * nächste Sektion da so reingeflogen."
 *
 * Genau das, in einer angehefteten Bühne: die Scheibe kommt von unten, dreht
 * sich einmal um sich selbst, wächst über den Bildschirm hinaus — und teilt
 * sich dann zur Seite, während dahinter die Einladung zur Karte hereinfliegt.
 *
 * ═══ Warum das NICHT dasselbe ist wie der Riss am Käseschiff ═══
 *
 * Zwei Effekte, die gleich aussehen, sind eine Wiederholung. Diese beiden
 * unterscheiden sich in allem, was zählt:
 *
 *   Käseschiff   REISST. Unregelmässige Bruchkante, Käsefäden dazwischen,
 *                langsam, die Hälften bleiben im Bild. Ein Gebäck geht auf.
 *   Vorhang      ÖFFNET. Ruhige Kante, keine Fäden, schnell, die Hälften fahren
 *                ganz aus dem Bild. Etwas gibt den Blick frei.
 *
 * Der Unterschied steckt schon im Bild: werkzeug/vorhang.py schneidet mit einem
 * Drittel der Streuung des Schiffs.
 *
 * ═══ Warum der Text HINTER der Scheibe liegt ═══
 *
 * Bei Eat Hungry Tiger nachgesehen (Mobbin): dort deckt das Produkt die
 * Schlagzeile teilweise ab — „A NEW ANGLE OF FLAVO[R]", das R liegt hinter dem
 * Glas. Genau das macht aus einem Bild in einem Kasten einen GEGENSTAND IM
 * RAUM. Eine Seite, auf der jedes Element seinen eigenen Platz respektiert, ist
 * ein Raster; eine, auf der sich Ebenen überlagern, hat Tiefe.
 *
 * Das gilt hier und ausdrücklich NICHT für das fliegende Käseschiff: dort ist
 * die Überlagerung nicht komponiert, sondern zufällig — es fliegt, und was
 * gerade darunter liegt, entscheidet der Scrollstand. Komponierte Überlagerung
 * ist Tiefe, zufällige ist ein Fehler.
 */

/**
 * Sechs Gerichte als Probe — aus DERSELBEN Quelle wie die Speisekarte.
 *
 * Nicht abgetippt: eine zweite Liste wäre eine zweite Wahrheit, und sie stünde
 * spätestens dann falsch da, wenn der Inhaber im Editor einen Preis ändert.
 *
 * Fünf, weil ein Zettel, den man in einem Blick liest, höchstens so viele
 * Zeilen hat. Es sind die ersten sechs ihrer eigenen Nummerierung — also die,
 * die auch auf dem Blatt an ihrer Wand oben stehen.
 */
const ALLE = inhalt.speisekarte.flatMap((gr) => gr.gerichte)
const PROBE = ALLE.filter((g): g is typeof g & { preis: number } => g.preis !== null).slice(0, 5)
const ZAHL_REST = ALLE.length - PROBE.length

/**
 * Wo im Verlauf sich die Scheibe teilt. Davor dreht sie, danach fliegt die
 * Karte herein.
 *
 * 0,58 statt 0,46 — Karol am 13.09.: „Er soll sich noch ein bisschen weiter
 * nach rechts drehen und es dann öffnen." Die Drehung läuft seit dem Umbau
 * ab 0,2; bei 0,46 stand die Scheibe beim Aufbrechen erst bei 75 Grad,
 * jetzt bei 110. Das Winkeltempo bleibt — „die Drehzeit passt".
 *
 * Exportiert, weil die Salve daran hängt: sie tritt aus dem Spalt, und der
 * Spalt ist hier definiert, nirgends sonst.
 */
export const TEILT_AB = 0.58
export const TEILT_BIS = 0.88

const glatt = (t: number) => t * t * (3 - 2 * t)
const klemmen = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t)

/** Ein Fenster mit weichen Rändern: 0 draussen, 1 drinnen, dazwischen glatt. */
function fenster(p: number, von: number, bis: number, rand = 0.06): number {
  if (p <= von - rand || p >= bis + rand) return 0
  if (p < von) return glatt((p - (von - rand)) / rand)
  if (p > bis) return glatt((bis + rand - p) / rand)
  return 1
}

/**
 * ═══ Nur, wenn offen ═══
 *
 * Karol hat „Geschlossen · öffnet um 08:00" viermal von der Startseite
 * genommen (zuletzt 23.08.): als Erstes, was ein Besucher liest, ist es die
 * schlechteste Zeile — sie nimmt die Handlung weg, statt zu einer zu führen.
 * Am 13.09. sagte er zum Entwurf: „Dieses ‚Geöffnet bis 19 Uhr' kann man
 * lassen." Beides gilt: die Zeile steht, solange sie GEÖFFNET sagt, und
 * steht nicht, wenn sie „geschlossen" sagen müsste. Die vollen Zeiten stehen
 * ohnehin in „Der Laden".
 *
 * Gerendert erst nach dem Aufbau (useEffect), nicht beim ersten Zeichnen:
 * die Uhr des Besuchers ist die Wahrheit, nicht die des Bauservers.
 */
function Offenzeile() {
  const [zeile, setZeile] = useState<string | null>(null)
  useEffect(() => {
    const s = status(new Date())
    setZeile(s.art === 'offen' ? statusText(s) : null)
  }, [])
  if (!zeile) return null
  return <p className="vorhang__offen">{zeile}</p>
}

export default function Vorhang() {
  const ruhig = useMedienabfrage('(prefers-reduced-motion: reduce)')
  const schmal = useMedienabfrage('(max-width: 719px)')
  const buehne = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const b = buehne.current
    if (!b || ruhig) return

    const links = b.querySelector<HTMLElement>('.vorhang__haelfte--links')
    const rechts = b.querySelector<HTMLElement>('.vorhang__haelfte--rechts')
    const dampf = b.querySelector<HTMLElement>('.vorhang__dampf')
    const licht = b.querySelector<HTMLElement>('.vorhang__licht')
    const logo = b.querySelector<HTMLElement>('.vorhang__logo')
    const auftakt = b.querySelector<HTMLElement>('.vorhang__auftakt')
    const wort = b.querySelector<HTMLElement>('.vorhang__wort')
    const karte = b.querySelector<HTMLElement>('.vorhang__einladung')
    if (!links || !rechts) return

    let tot = false
    let abraeumen: (() => void) | undefined

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      const { gsap, ScrollTrigger } = werkzeug

      /* Über ein Hilfsobjekt, nicht über `self.progress`: der Scrub glättet die
         verknüpfte Animation, nicht die Rohmeldung. Wer `onUpdate` fragt,
         bekommt den ungeglätteten Wert zurück — und damit das harte
         Scrollgefühl, das auf dieser Seite zweimal beanstandet wurde. */
      const zustand = { p: 0 }

      const zeichnen = () => {
        const p = zustand.p
        const auf = klemmen((p - TEILT_AB) / (TEILT_BIS - TEILT_AB))
        const weich = glatt(auf)

        /**
         * Die Drehung. Sie läuft über die GANZE Durchfahrt weiter, auch beim
         * Öffnen — eine Scheibe, die sich dreht und beim Teilen plötzlich
         * stillsteht, sieht aus, als hätte jemand den Film angehalten.
         *
         * 232 Grad, nicht 360: eine volle Umdrehung endet dort, wo sie
         * begonnen hat, und dann war die Drehung umsonst. Bei etwa zwei
         * Dritteln steht die Scheibe sichtbar anders als am Anfang.
         */
        /* ═══ Erst hoch, dann drehen ═══
           Karol am 13.09.: „während der Lahmacun beim Scrollen hochgeht und
           das Logo runtergeht. Danach, wenn er mittig zentralisiert ist,
           dreht er sich." Die Drehung beginnt deshalb erst, wenn die Ruhelage
           abgebaut ist (0,2) — dieselben 232 Grad, nur auf 0,2 bis 1 statt
           auf 0 bis 1. Bis dahin steigt er nur, mit seinem Dampf. */
        const dreh = klemmen((p - 0.2) / 0.8) * 232
        /* Sie kommt von unten und wächst. `skala` läuft weiter, während sie
           sich teilt — das Auseinanderfahren wird dadurch schneller, als es
           gerechnet ist. */
        /* 0,68 statt 0,6 am Start — Karol am 12.09.: „der Lahmacun kann
           leicht etwas groesser sein", am Handy „noch etwas zu klein".
           Das Ende bleibt bei 1,32: der Riss soll nicht groesser werden,
           nur der Auftritt davor. */
        const skala = 0.68 + p * 0.64
        /* Sie steht schon im ersten Bild der Sektion, nur tiefer und kleiner.
           Bei 46 vh Startversatz war das erste Bild der Sektion schwarz und
           leer — gemessen ein ganzer Bildschirm ohne Inhalt, bevor überhaupt
           etwas passiert. Eine angeheftete Bühne, die leer beginnt, liest sich
           als Ladefehler. */
        /* 26 vh am Schirm statt 17: seit dem 13.09. ist der Vorhang die
           Startseite, und ueber dem Fladen stehen Logo und Zeile. Gemessen
           endete der Block auf 900 vh bei 432 px; bei 22 vh begann der Fladen
           schon bei 418. Am Handy bleiben 17 — dort ist der Fladen schmaler
           und unter der Zeile ist ohnehin Luft. */
        const hoch = (1 - glatt(klemmen(p / 0.2))) * (schmal ? 17 : 26)

        /**
         * ═══ Die Drehung gehört der SCHEIBE, das Auseinanderfahren den HÄLFTEN ═══
         *
         * Erst stand beides auf denselben Knoten: `translate3d(…) rotate(…)`
         * je Hälfte. In CSS verschiebt `translate` dann in den Achsen des
         * ELTERNBLOCKS, während die Bruchkante mit der Drehung mitwandert. Bei
         * 139 Grad lag sie schräg, und die Hälften schoben sich seitlich
         * aneinander vorbei statt auseinander — gemessen und im Bild sofort zu
         * sehen: eine Schere, kein Vorhang.
         *
         * Jetzt dreht sich die Scheibe als Ganzes, und die Hälften fahren in
         * IHREN Achsen auseinander. Damit liegt die Bewegung immer senkrecht
         * auf der Bruchkante, egal wie weit gedreht ist.
         */
        const scheibe = links.parentElement
        if (scheibe) {
          scheibe.style.transform =
            `translate3d(0, ${hoch}vh, 0) rotate(${dreh}deg) scale(${skala})`
        }
        /* 130 % der eigenen Breite: auch auf einem breiten Bildschirm ist dann
           nichts mehr zu sehen. */
        const weg = weich * 130
        links.style.transform = `translateX(${-weg}%) rotate(${-weich * 9}deg)`
        rechts.style.transform = `translateX(${weg}%) rotate(${weich * 9}deg)`

        /* ═══ Der Dampf hoert auf, wenn die Scheibe aufbricht ═══

           Karol am 10.09.: „Der Dampf ist in Ordnung, aber dass er, während
           das schon voneinander getrennt ist, macht überhaupt keinen Sinn."

           Er hat recht: Dampf steigt von einem GANZEN Gebäck auf. Sobald die
           Hälften auseinanderfahren, ist die Quelle weg, und was dann noch
           aufsteigt, gehört zu nichts mehr.

           Er geht früher als die Hälften: bei `weich * 2.2` ist er schon
           verschwunden, wenn sie sich um ein Viertel geöffnet haben. Dampf,
           der bis zum letzten Moment mitläuft, wirkt wie ein Nachzügler. */
        if (dampf) {
          /* Der Dampf folgt dem Fladen in Hoehe und Groesse, aber NICHT in
             der Drehung — Dampf steigt senkrecht, auch ueber etwas, das sich
             dreht. Und er hoert auf, sobald die Scheibe aufbricht. */
          dampf.style.transform = `translate3d(-50%, calc(-50% + ${hoch}vh), 0) scale(${skala})`
          dampf.style.opacity = String(Math.max(0, 0.9 - weich * 2.2))
        }

        /* ═══ Das Logo faehrt nach unten rechts und wird das Wasserzeichen ═══

           Karol am 13.09.: „das Logo verschwindet cool zur Seite, aber das
           soll nach unten rechts verschwinden, damit es wasserzeichenartig
           fungiert."

           Es ist EIN Element mit EINEM Weg: gross und mittig in Ruhe, dann
           ueber das erste Viertel der Strecke in die Ecke, auf die Groesse
           und Deckung von `.wasserzeichen` (11 vw, 0,58). Sobald die Sektion
           das Bild verlaesst, uebernimmt das feste Wasserzeichen an derselben
           Stelle — der Wechsel ist nicht zu sehen, weil beide gleich gross
           und gleich hell sind. */
        if (logo) {
          const t = glatt(klemmen(p / 0.25))
          const vw = window.innerWidth
          const vh = window.innerHeight
          const bild = logo.firstElementChild as HTMLElement | null
          const lw = bild?.offsetWidth || 1
          const lh = bild?.offsetHeight || 1
          const zielW = Math.min(Math.max(vw * 0.11, 104), 192)
          const rand = Math.min(Math.max(vw * 0.014, 14.4), 25.6)
          const sk = zielW / lw
          const x = (vw - rand - zielW) - (vw / 2 - lw / 2)
          const y = (vh - rand - lh * sk) - logo.offsetTop
          logo.style.transform = `translate3d(${x * t}px, ${y * t}px, 0) scale(${1 - (1 - sk) * t})`
          logo.style.opacity = String(1 - 0.42 * t)
        }
        if (auftakt) {
          const g = 1 - glatt(klemmen(p / 0.14))
          auftakt.style.opacity = String(g)
          /* translate(-50%, …) und nicht translateY: das Stilblatt zentriert den
             Block ueber translateX(-50%), und wer hier nur translateY schreibt,
             loescht das — gemessen stand der Block dann bei 720 bis 1360 px
             statt mittig. Zwei Schreiber auf einer Eigenschaft, derselbe
             Fehler wie beim Kaeseschiff am 05.09. */
          auftakt.style.transform = `translate(-50%, ${(1 - g) * -18}px)`
          auftakt.style.pointerEvents = g < 0.3 ? 'none' : ''
        }

        /* Der Kontaktschatten gehoert zum GANZEN Fladen. Sobald er aufbricht,
           ist der Gegenstand weg, der ihn wirft — also geht er mit, etwas
           frueher als der Dampf, damit die Buehne leer ist, wenn die Karte
           hereinkommt. */
        if (licht) licht.style.opacity = String(Math.max(0, 1 - weich * 2.6))

        /* Die Schlagzeile dahinter geht mit der Scheibe: sie ist am Anfang da,
           wird von ihr verdeckt und verschwindet, wenn die Einladung kommt.
           Zwei Aussagen gleichzeitig sind keine. */
        /* Ab dem ERSTEN Bild der Sektion. Bei 0,06 öffnete sie mit einer leeren
           schwarzen Fläche, in die eine Scheibe von unten hereinkroch — der
           Vorhang begann, bevor irgendetwas zu sehen war. */
        if (wort) wort.style.opacity = String(fenster(p, 0.0, 0.5, 0.04))

        /* Und die Karte fliegt herein — aus der Tiefe, nicht von der Seite:
           sie kommt DURCH den Spalt, nicht daran vorbei. */
        const ein = glatt(klemmen((p - (TEILT_AB + 0.06)) / 0.32))
        if (karte) {
          karte.style.opacity = String(ein)
          karte.style.transform =
            `translate3d(0, ${(1 - ein) * 16}vh, 0) scale(${0.82 + ein * 0.18})`
        }
      }

      const tween = gsap.to(zustand, {
        p: 1,
        ease: 'none',
        onUpdate: zeichnen,
        scrollTrigger: {
          trigger: b.closest('.vorhang') ?? b,
          start: 'top top',
          end: 'bottom bottom',
          scrub: SCRUB_KOERPER,
          invalidateOnRefresh: true,
        },
      })

      zeichnen()
      ScrollTrigger.refresh()

      abraeumen = () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    })

    return () => {
      tot = true
      abraeumen?.()
    }
  }, [ruhig, schmal])

  return (
    <section className="sektion sektion--nacht vorhang" aria-labelledby="vorhang-titel">
      <div className="vorhang__buehne" ref={buehne}>
        {/* ═══ Dieselben Koerner wie in den dunklen Sektionen danach ═══
            Karol am 12.09.: „diese scroll-getriebenen Koerner im Hintergrund
            sollen von den folgenden Seiten fuer diese Lahmacun-Szene
            uebernommen werden." Die Buehne war die einzige dunkle Flaeche der
            Seite ohne die Saat-Folie — deshalb las sie sich als anderer Raum.
            Jetzt ist es ein Raum, vom Vorhang bis zum Fuss. */}
        <Untergrund ton="nacht" muster="saat" />
        {/* Die Schlagzeile liegt UNTER der Scheibe — siehe Kopf der Datei. */}
        {/* ═══ Hier stand „Mehr als 25 Jahre" ═══

            Karol am 26.08.: „Diese 25 Jahre musst du rausnehmen bei diesem
            Lahmacun."

            Die Zahl stimmt und steht auf ihrem Ladenschild — sie stand nur an
            der falschen Stelle. Eine Schlagzeile hinter einem Gegenstand, der
            sie zur Hälfte verdeckt, funktioniert nur, wenn man sie ohnehin
            nicht lesen muss. „Mehr als 25 Jahre" ist aber eine Auskunft, kein
            Ornament: halb verdeckt ist sie halb verschenkt.

            Sie gehört in „Der Laden", wo Anschrift und Zeiten stehen. Dort
            steht sie jetzt. */}

        {/* ═══ Licht und Boden ═══

            Karol am 11.09.: „die lahmacun sektion ist auch noch etwas zu
            unprofessionell … iteriere mit mobbin wie wir das besser in
            szene setzen."

            Bei Mobbin nachgesehen — Artisan Kitchen (v0) und Squarespace
            zeigen beide dasselbe: ein Produkt auf dunklem Grund braucht eine
            LICHTQUELLE und einen BODEN, sonst ist es ein Aufkleber. Bei ihnen
            liegt hinter der Ware eine warme Lichtinsel und darunter ein
            weicher Kontaktschatten; deshalb sieht man einen Gegenstand, der
            irgendwo liegt, statt eines Bildes, das aufgeklebt wurde.

            ═══ Der warme Schein ist wieder RAUS ═══

            Karol am 11.09.: „diesen orangen Schatten kannst du rausnehmen, den
            finde ich unpassend."

            Er hatte doppelt recht. Der Schein war nicht nur Geschmackssache,
            er hat die ganze Sektion nach rechts gezogen: mit `150vw` war er
            auf einem 393-px-Handy 590 px breit, und weil alle Kinder in
            DERSELBEN Rasterzelle liegen, wurde die Zelle 590 breit. Zentriert
            wurde danach in dieser Zelle und nicht im Fenster — gemessen stand
            die Scheibe 97 px ueber dem rechten Rand und das Kartenblatt 40.

            Geblieben ist nur der Kontaktschatten, und der ist nicht orange
            sondern schwarz: er ist das, was den Fladen auf etwas STELLT.
            `position: absolute` nimmt ihn aus dem Raster heraus — was nicht im
            Fluss liegt, kann die Zelle nicht mehr aufblaehen.

            Eigenes Element und kein `::before` an der Scheibe: die Scheibe
            DREHT sich (232 Grad ueber die Sektion), und ein Schatten, der
            mitdreht, liegt nicht mehr unten. */}
        <div className="vorhang__licht" aria-hidden="true" />

        {/* ═══ Der Auftakt — seit dem 13.09. ist das die Startseite ═══

            Karol: „Mach das Video im Hintergrund weg. Mach diese Lahmacun-
            Szene als Startseite mit dem Logo präsent in der Mitte … das Logo
            viel grösser … dieser Satz viel kleiner. Das Logo steht im
            Vordergrund, und dieser dampfende Lahmacun."

            Was die alte Startseite trug, steht jetzt hier, nur kleiner: die
            H1 (Google), der Ort (der Gast von Maps), der Status. Die Wege
            (Anrufen, WhatsApp) sind in die Kopfzeile gezogen. Das Video ist
            raus: 2,7 MB und die einzige Ladeverschiebung der Seite. */}
        <a className="vorhang__logo" href="#start" aria-label={`${ARAM.name} — zum Anfang`}>
          <img
            src="/bilder/echt/logo.webp"
            alt=""
            width={875}
            height={381}
            fetchPriority="high"
            decoding="async"
          />
        </a>
        <div className="vorhang__auftakt">
          <h1 id="vorhang-titel" className="vorhang__titel">
            Jeder Teig wird morgens von Hand gerollt
          </h1>
          <p className="vorhang__ort">
            {ARAM.ort.strasse} · {ARAM.ort.stadtteil}
          </p>
          <Offenzeile />
          {/* ═══ Hier standen drei Steine: Zur Karte, Anrufen, WhatsApp ═══

              Karol am 13.09.: „die Karte also komplett raus von der
              Startseite, weil es kommt ja direkt danach … Nur Anrufen als
              Telefonbutton und WhatsApp als WhatsApp-Button oben rechts in
              die Ecke."

              Er hat recht, zweimal. „Zur Karte" auf einer Seite, deren
              nächster Takt die Karte IST, verspricht, was ohnehin kommt. Und
              Anrufen/WhatsApp gehören dorthin, wo sie auf jedem
              Bildschirmmeter erreichbar sind — in die Kopfzeile
              (Kopfzeile.tsx), nicht auf die eine Stelle, die man als Erstes
              wegscrollt. */}
        </div>

        {/* ═══ Echter Dampf ═══

            Ein Clip von Dampf auf reinem Schwarz (Higgsfield, 7,5 Credits,
            107 kB als nahtlose Schleife). `mix-blend-mode: screen` macht das
            Schwarz unsichtbar: auf dem dunklen Grund bleibt nur der Dampf.
            Drei Kopien, versetzt und gespiegelt, damit es nicht wie EINE
            Quelle aussieht. Karol: „Der Dampf ist richtig geil."

            Er ersetzt hier die gerechneten Schwaden. Das Element steht NEBEN
            der Scheibe, nicht darin: die Scheibe dreht sich, Dampf tut das
            nicht — Hoehe und Groesse gehen mit, die Drehung nicht.

            EIN Strom, nicht drei. Der Entwurf hatte drei Kopien fuer die
            Vielfalt; der Fabrikpruefer hat sie als kritisch gemeldet — drei
            gleichzeitige Decoder haben auf diesem Projekt schon einmal die
            CPU ueberfordert, am Handy kostet es Akku und Bildrate. Ein Clip
            echten Dampfes liest sich auch allein als Dampf. */}
        <div className="vorhang__dampf" aria-hidden="true">
          <video src="/video/dampf.mp4" autoPlay muted loop playsInline />
        </div>

        <div className="vorhang__scheibe" aria-hidden="true">
          <img
            className="vorhang__haelfte vorhang__haelfte--links"
            src="/bilder/vorhang/scheibe-links.webp"
            width={M['scheibe-links']!.breite}
            height={M['scheibe-links']!.hoehe}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <img
            className="vorhang__haelfte vorhang__haelfte--rechts"
            src="/bilder/vorhang/scheibe-rechts.webp"
            width={M['scheibe-rechts']!.breite}
            height={M['scheibe-rechts']!.hoehe}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* ═══ Was durch den Spalt hereinkommt: eine KARTE ═══

            Karol am 26.08.: „Dieses 22 Sorten, jede von Hand und so, weg damit
            … nachdem der Lahmacun auf ist, soll einfach so eine schön designte
            Karte, und dann steht da so ‚Zur Karte' drunter."

            Vorher stand dort eine Schlagzeile mit einem Versprechen. Das war
            zweimal falsch: die Zahl steht schon weiter oben, und eine
            Behauptung ist kein Beweis. Eine Karte mit echten Namen und echten
            Preisen ist einer.

            Die Gerichte kommen aus derselben Quelle wie die Speisekarte —
            wenn der Inhaber im Editor einen Preis ändert, ändert er sich hier
            mit. Eine zweite, abgetippte Liste wäre eine zweite Wahrheit. */}
        <div className="vorhang__einladung">
          <div className="kartenblatt">
            <p className="kartenblatt__kopf">
              {/* Arabisch, wie es über ihrer Tür steht: „Orientalisches
                  Gebäck". Reem Kufi bringt die arabische Untergruppe mit —
                  geladen wird sie nur, weil hier tatsächlich arabische Zeichen
                  vorkommen. Das entscheidet der `unicode-range` der Schrift,
                  nicht wir. */}
              <span className="kartenblatt__arabisch" lang="ar" dir="rtl">
                مخبوزات شرقية
              </span>
              <span className="kartenblatt__ort">Aram · Bonn-Hardtberg</span>
            </p>

            <ul className="kartenblatt__liste">
              {PROBE.map((g) => (
                <li key={g.name}>
                  <span className="kartenblatt__nr">{g.nr}</span>
                  <span className="kartenblatt__name">{g.name}</span>
                  <span className="kartenblatt__leiter" aria-hidden="true" />
                  <span className="kartenblatt__preis">
                    {g.preis.toFixed(2).replace('.', ',')} €
                  </span>
                </li>
              ))}
            </ul>

            <p className="kartenblatt__fuss">und {ZAHL_REST} weitere</p>
          </div>

          <a className="knopf vorhang__knopf" href="#karte">
            Zur Karte
          </a>
        </div>
      </div>
    </section>
  )
}
