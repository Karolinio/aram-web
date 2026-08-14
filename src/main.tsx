import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/newsreader'
import './stile/global.css'
import './stile/gericht.css'
import './stile/sektionen.css'

import Kopfzeile from './komponenten/Kopfzeile.tsx'
import Ofen from './komponenten/Ofen.tsx'
import WasEsGibt from './komponenten/WasEsGibt.tsx'
import Weg from './komponenten/Weg.tsx'
import Karte from './komponenten/Karte.tsx'
import Laden from './komponenten/Laden.tsx'
import Bestellen from './komponenten/Bestellen.tsx'
import Fusszeile from './komponenten/Fusszeile.tsx'
import Mehlstaub from './komponenten/ui/Mehlstaub.tsx'

import { SLOTS } from './gerichte.ts'
import { lueckenVorLive } from './aram.config.ts'
import { preiseFehlen } from './inhalt.ts'

/**
 * Weiches Scrollen mit Lenis — aber NUR, wenn der Nutzer Bewegung will.
 *
 * Lenis übernimmt das Scrollen vom Browser. Bei `prefers-reduced-motion` ist das die
 * falsche Antwort: wer Bewegung reduziert haben will, will erst recht kein Scrollen,
 * das nachfedert. Dann bleibt es beim nativen Scrollen.
 */
function useWeichesScrollen() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null
    let id = 0
    let tot = false

    import('lenis').then(({ default: Lenis }) => {
      if (tot) return
      lenis = new Lenis({ duration: 0.9, smoothWheel: true })
      const takt = (t: number) => {
        lenis?.raf(t)
        id = requestAnimationFrame(takt)
      }
      id = requestAnimationFrame(takt)
    })

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
 * Eine Seite mit Platzhaltern soll sich nicht anfühlen wie eine fertige. Der teuerste
 * Fehler dieser Bauweise wäre, dass jemand sie für fertig hält und mit gestrichelten
 * Kästen live geht.
 */
function useLueckenMelden() {
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const offen = lueckenVorLive()
    const preise = preiseFehlen()
    // eslint-disable-next-line no-console
    console.groupCollapsed(
      `%cAram — noch nicht live-fähig`,
      'color:#ff8a3d;font-weight:700',
    )
    // eslint-disable-next-line no-console
    console.log('Fotos fehlen:', SLOTS.length, 'Slots —', SLOTS.map((s) => s.id).join(', '))
    // eslint-disable-next-line no-console
    console.log('Preise fehlen:', preise)
    // eslint-disable-next-line no-console
    console.log('Vor dem Livegang:', offen.join(' · ') || 'nichts')
    // eslint-disable-next-line no-console
    console.groupEnd()
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
        <Ofen />
        <WasEsGibt />
        <Weg />
        <Karte />
        <Laden />
        <Bestellen />
      </main>
      <Fusszeile />
    </>
  )
}

createRoot(document.getElementById('wurzel')!).render(
  <StrictMode>
    <Seite />
  </StrictMode>,
)
