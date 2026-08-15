import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

/* `full` und nicht der Standard: nur diese Datei trägt die Achsen SOFT und WONK,
   und ohne WONK ist Fraunces eine gewöhnliche Serife — genau das, was hier nicht
   gebraucht wird. */
import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/archivo'
import './stile/grundlage.css'
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

import { SLOTS } from './gerichte.ts'
import { lueckenVorLive } from './aram.config.ts'
import { preiseFehlen } from './inhalt.ts'

/**
 * Weiches Scrollen mit Lenis — aber NUR, wenn der Nutzer Bewegung will.
 *
 * Wer Bewegung reduziert haben will, will erst recht kein Scrollen, das
 * nachfedert. Dann bleibt es beim nativen Scrollen des Browsers.
 */
function useWeichesScrollen() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null
    let id = 0
    let tot = false

    void import('lenis')
      .then(({ default: Lenis }) => {
        if (tot) return
        lenis = new Lenis({ duration: 0.9, smoothWheel: true })
        const takt = (t: number) => {
          lenis?.raf(t)
          id = requestAnimationFrame(takt)
        }
        id = requestAnimationFrame(takt)
      })
      /* Schlägt das Nachladen fehl, scrollt der Browser eben selbst. Weiches
         Scrollen ist Komfort, nicht Inhalt — eine unbehandelte Ablehnung in der
         Konsole wäre der schlechtere Tausch. */
      .catch(() => undefined)

    return () => {
      tot = true
      cancelAnimationFrame(id)
      lenis?.destroy()
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
