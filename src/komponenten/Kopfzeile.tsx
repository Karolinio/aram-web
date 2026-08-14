import { useEffect, useState } from 'react'
import { ARAM } from '../aram.config.ts'
import { inhalt, hinweisGilt } from '../inhalt.ts'

/**
 * Die Kopfzeile — eine Ofentür, die beim Scrollen dichter wird.
 *
 * Oben darüber liegt das Hinweisband: der Bereich, den Aram selbst pflegt
 * (`inhalt/hinweis.json`, ziel `inhalt.hinweis`). Es erscheint nur, wenn es einen
 * Text gibt UND das Datum noch nicht durch ist. Ein abgelaufener Urlaubshinweis ist
 * schlimmer als keiner — deshalb prüft `hinweisGilt()` das Datum, statt es dem
 * Menschen zu überlassen.
 */

const ANKER = [
  { href: '#gerichte', text: 'Gerichte' },
  { href: '#karte', text: 'Karte' },
  { href: '#laden', text: 'Laden' },
]

export default function Kopfzeile() {
  const [dicht, setDicht] = useState(false)
  const [aktiv, setAktiv] = useState<string>('')
  const zeigeHinweis = hinweisGilt()

  useEffect(() => {
    const an = () => setDicht(window.scrollY > 40)
    an()
    window.addEventListener('scroll', an, { passive: true })
    return () => window.removeEventListener('scroll', an)
  }, [])

  /* Welcher Abschnitt ist im Blick? Beobachter statt Scroll-Rechnerei. */
  useEffect(() => {
    const ziele = ANKER.map((a) => document.querySelector(a.href)).filter(Boolean) as Element[]
    if (!ziele.length) return
    const b = new IntersectionObserver(
      (eintraege) => {
        const sichtbar = eintraege.filter((e) => e.isIntersecting)
        if (sichtbar.length) setAktiv('#' + sichtbar[0].target.id)
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    ziele.forEach((z) => b.observe(z))
    return () => b.disconnect()
  }, [])

  return (
    <>
      {zeigeHinweis && (
        <div className="band" role="status">
          <span className="band__punkt" aria-hidden="true" />
          {inhalt.hinweis.text}
        </div>
      )}

      <header className={`kopf ${dicht ? 'ist-dicht' : ''}`}>
        <div className="schale kopf__reihe">
          <a href="#start" className="kopf__marke">
            {ARAM.name}
          </a>

          <nav className="kopf__nav" aria-label="Bereiche">
            {ANKER.map((a) => (
              <a key={a.href} href={a.href} aria-current={aktiv === a.href ? 'true' : undefined}>
                {a.text}
              </a>
            ))}
          </nav>

          <a className="knopf kopf__knopf" href={ARAM.kontakt.telefonHref}>
            Bestellen
          </a>
        </div>
      </header>
    </>
  )
}
