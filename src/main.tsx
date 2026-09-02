import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

/* `full` und nicht der Standard: nur diese Datei trägt die Achsen SOFT und WONK,
   und ohne WONK ist Fraunces eine gewöhnliche Serife — genau das, was hier nicht
   gebraucht wird. */
import '@fontsource-variable/fraunces/full.css'
/* Reem Kufi bringt vier Untermengen mit, darunter die arabische. Geladen wird
   davon nur, was vorkommt — die Seite ist deutsch, also kommt die lateinische.
   Der `unicode-range` der Schrift entscheidet das, nicht wir. */
import '@fontsource-variable/reem-kufi'
import './stile/grundlage.css'
import './stile/bausteine.css'
import './stile/sektionen.css'

import Kopfzeile from './komponenten/Kopfzeile.tsx'
import Backstube from './komponenten/Backstube.tsx'
import Galerie from './komponenten/Galerie.tsx'
import Handarbeit from './komponenten/Handarbeit.tsx'
import Reise from './komponenten/Reise.tsx'
import Karte from './komponenten/Karte.tsx'
import Vorhang from './komponenten/Vorhang.tsx'
import Laden from './komponenten/Laden.tsx'
import Bestellen from './komponenten/Bestellen.tsx'
import Fusszeile from './komponenten/Fusszeile.tsx'
import Bestellleiste from './komponenten/Bestellleiste.tsx'
import Wasserzeichen from './komponenten/Wasserzeichen.tsx'
import Kaeseschiff from './komponenten/Kaeseschiff.tsx'
import Mehlstaub from './komponenten/ui/Mehlstaub.tsx'

import { scrollenStarten } from './scrollen.ts'
import { SLOTS } from './gerichte.ts'
import { erzeugteGerichte } from './gebaecke.ts'
import { lueckenVorLive } from './aram.config.ts'
import { preiseFehlen } from './inhalt.ts'
import { saatBeleben } from './saat.ts'

/**
 * Weiches Scrollen — aber NUR, wenn der Nutzer Bewegung will.
 *
 * Die Mechanik steht in src/scrollen.ts, weil sie eine Bedingung hat, die ein
 * Hook nicht garantieren kann: es darf genau EINE Instanz geben, und sie muss
 * sich denselben Ticker mit ScrollTrigger teilen.
 */
function useWeichesScrollen() {
  useEffect(() => {
    let aufraeumen: (() => void) | null = null
    let tot = false

    void scrollenStarten().then((f) => {
      if (tot) f?.()
      else aufraeumen = f
    })

    return () => {
      tot = true
      aufraeumen?.()
    }
  }, [])
}

/**
 * Was noch fehlt, wird laut gesagt — in der Konsole, bei jedem Start.
 *
 * Der teuerste Fehler dieses Auftrags wäre, dass jemand diese Seite für fertig
 * hält. Sie ist es nicht: die Reise fehlt, weil die Aufnahmen fehlen, aus denen
 * sie besteht.
 */
function useLueckenMelden() {
  useEffect(() => {
    if (!import.meta.env.DEV) return
    /* eslint-disable no-console */
    console.groupCollapsed('%cAram — noch nicht live-fähig', 'color:#a33f1e;font-weight:700')
    console.log(
      'Gerichtefotos fehlen:',
      SLOTS.length,
      'Slots —',
      SLOTS.map((s) => s.id).join(', '),
    )
    console.log(
      'Deshalb NICHT gebaut: die Reise (Showpiece). Sie braucht 3–4 freigestellte',
      'Aufnahmen je Gericht rundherum. Um Platzhalter herum gebaut müsste sie beim',
      'Eintreffen der echten Bilder neu komponiert statt bestückt werden.',
    )
    console.log('Preise fehlen:', preiseFehlen(), 'von',
      SLOTS.length > 0 ? 'allen Gerichten der Karte' : '—')
    /* Seit dem 01.09. steht hier null: der fliegende Schwarm besteht
       vollständig aus ihren eigenen Gebäcken, freigestellt aus den Fotos, die
       der Inhaber geschickt hat. Die Meldung bleibt stehen — sie ist der
       Wächter, der sich meldet, falls je wieder ein erzeugtes Bild
       hereinrutscht. */
    const erzeugt = erzeugteGerichte()
    if (erzeugt > 0) {
      console.warn(
        'ERZEUGTE Gerichtebilder auf dieser Seite:', erzeugt,
        'Sie zeigen NICHT ihr Essen. Siehe public/bilder/erzeugt/LIESMICH.md.',
      )
    } else {
      console.log('Gerichtebilder: alle echt.')
    }
    console.log('Vor dem Livegang:', lueckenVorLive().join(' · ') || 'nichts')
    console.groupEnd()
    /* eslint-enable no-console */
  }, [])
}

function Seite() {
  useWeichesScrollen()
  useLueckenMelden()

  return (
    <>
      <a className="sprung" href="#start">
        Zum Inhalt springen
      </a>
      <Kopfzeile />
      <Mehlstaub />
      <main>
        <Backstube />

        {/* ═══ Die Reise des Käseschiffs beginnt HIER und endet bei .reise ═══

            Karol am 23.08.: „Ich will, dass das Käseschiff von oben nach unten
            … runtergeht. Also so von links in der Kurve nach rechts und dann
            wieder nach links … Sektion 2, 3, 4 Scroll Driven, und ich glaube,
            bei 5, dann ist es vorbei."

            Das Schiff ist deshalb KEIN Kind einer Sektion mehr. Es liegt fest
            im Fenster (Kaeseschiff.tsx) und wird allein vom Scrollfortschritt
            geführt: die Seite fährt darunter durch, es bleibt. Seine Bahn
            spannt von der Oberkante der Handarbeit bis zur Unterkante der
            Riss-Sektion — drei Sektionen, eine Bewegung.

            Es steht hier oben im Baum und nicht unten, weil es über allem
            liegt: die Reihenfolge im Quelltext ist die Reihenfolge, in der ein
            Vorleseprogramm liest, und ein rein dekoratives Element gehört dort
            nicht zwischen zwei Sektionen. */}
        <Kaeseschiff />

        {/* ═══ Der Vorhang steht GANZ VORN ═══

            Karol am 26.08.: „Bevor das kommt, soll als Erstes die allererste
            Sektion nach der Startseite kommen, und die soll riesen Manakisch
            sein."

            Er stand vorher direkt vor der Speisekarte. Als Eröffnung ist er
            besser aufgehoben: nach einem Video, das nur zeigt, kommt der erste
            SATZ der Seite — und er kommt durch ein aufgeteiltes Manakisch
            herein, statt einfach dazustehen. */}
        <Vorhang />

        <Handarbeit />

        {/* Die Galerie steht VOR der Karte, nicht dahinter. Wer wissen will,
            was es gibt, liest die Karte; wer noch nicht weiss, ob er will,
            sieht Bilder. Die Reihenfolge folgt der Entscheidung, nicht der
            Datenmenge.

            Und sie steht jetzt VOR der Riss-Sektion: das Schiff braucht Weg,
            bevor es aufreisst. Vorher lag der Riss unmittelbar nach der ersten
            Sektion — ein Höhepunkt nach zwei Bildschirmhöhen ist kein
            Höhepunkt. */}
        <Galerie />

        {/* Der letzte Takt der Reise: hier reisst das Käseschiff auseinander. */}
        <Reise />

        {/* ═══ Der Ofen ist RAUS ═══

            Karol am 24.08.: „Das mit dem Ofen ist mir noch nicht ganz koscher.
            Das sieht irgendwie nicht so gut aus. Mach den Ofen raus."

            Er hatte recht, und ich kann sagen woran es lag: der Ofen war das
            einzige Element der Seite, das aus einer FOTOGRAFIE einen Raum
            machen wollte. Alles andere sind freigestellte Gegenstände auf einer
            Fläche — ein Bildausschnitt mit weichen Rändern gehorcht anderen
            Regeln, und die beiden lassen sich nicht mischen. Es war kein
            Ausführungsfehler, es war die falsche Art Element.

            Ofen.tsx, ofenbild.py und ofen-maul.webp bleiben liegen. Die
            Teigstufen daraus BLEIBEN in Betrieb — die Verwandlung passiert
            jetzt während des Flugs. */}

        {/* Der Vorhang: eine Scheibe dreht sich, teilt sich, und die
            Speisekarte fliegt hindurch herein. */}

        <Karte />
        <Laden />
        <Bestellen />
      </main>
      <Fusszeile />
      <Wasserzeichen />
      <Bestellleiste />
    </>
  )
}

createRoot(document.getElementById('wurzel')!).render(
  <StrictMode>
    <Seite />
  </StrictMode>,
)

/**
 * Die Saat reagiert auf Scrollen und Zeiger — siehe src/saat.ts.
 *
 * Bewusst NEBEN React und nicht in einem Effekt: sie gehört keiner Sektion,
 * sondern allen sieben, und ein Effekt in einer Komponente würde unter
 * `StrictMode` beim Start zweimal laufen. Ein Hörer für die ganze Seite hat
 * hier seinen Platz, und die Seite lebt genauso lang wie er.
 */
saatBeleben()
