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
import Ofen from './komponenten/Ofen.tsx'
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
    console.warn(
      'ERZEUGTE Gerichtebilder auf dieser Seite:', erzeugteGerichte(),
      '— sie zeigen NICHT ihr Essen. Siehe public/bilder/erzeugt/LIESMICH.md.',
      'Sobald die echten Fotos da sind: Ordner löschen, nicht ergänzen.',
    )
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

        {/* Der Ofen — die einzige dunkle Sektion. Hier fällt das Schiff ins
            Maul, und hier ist die Reise am Umkehrpunkt: alles davor ist roh,
            alles danach gebacken. */}
        <Ofen />

        {/* Der letzte Takt: hier reisst das Schiff auseinander. Die Sektion
            selbst enthält es nicht — sie hält nur den Raum dafür frei, und
            alles, was heiss ist. */}
        <Reise />

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
