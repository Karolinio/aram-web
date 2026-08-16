import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

/* `full` und nicht der Standard: nur diese Datei trägt die Achsen SOFT und WONK,
   und ohne WONK ist Fraunces eine gewöhnliche Serife — genau das, was hier nicht
   gebraucht wird. */
import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/archivo'
import './stile/grundlage.css'
import './stile/bausteine.css'
import './stile/sektionen.css'

import Kopfzeile from './komponenten/Kopfzeile.tsx'
import Hinweisband from './komponenten/Hinweisband.tsx'
import Backstube from './komponenten/Backstube.tsx'
import Handarbeit from './komponenten/Handarbeit.tsx'
import Karte from './komponenten/Karte.tsx'
import Laden from './komponenten/Laden.tsx'
import Bestellen from './komponenten/Bestellen.tsx'
import Fusszeile from './komponenten/Fusszeile.tsx'
import Bestellleiste from './komponenten/Bestellleiste.tsx'
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
      <Hinweisband />
      <Kopfzeile />
      <Mehlstaub />
      <main>
        <Backstube />
        {/*
          Hier gehört die REISE hin — das Showpiece: ein Käseschiffchen wandert
          scrollgetrieben über drei Sektionen, dreimal fallen Partikel und
          schalten das Bild eine Stufe weiter, am Ende teilt es sich.

          Sie ist nicht gebaut, und das ist Absicht. Sie besteht aus vier
          Aufnahmen desselben Gerichts aus derselben Kameraposition (Teig →
          bemehlt → belegt → gebacken) plus zwei Aufnahmen ganz und geteilt.
          Diese Bilder gibt es noch nicht. Um Platzhalter herum gebaut wäre sie
          beim Eintreffen der echten Bilder neu zu komponieren statt zu
          bestücken — und ein erzeugtes Fatayer kommt nicht in Frage.
        */}
        <Handarbeit />
        <Karte />
        <Laden />
        <Bestellen />
      </main>
      <Fusszeile />
      <Bestellleiste />
    </>
  )
}

createRoot(document.getElementById('wurzel')!).render(
  <StrictMode>
    <Seite />
  </StrictMode>,
)
