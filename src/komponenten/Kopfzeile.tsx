import { useCallback, useEffect, useState } from 'react'

import { ARAM } from '../aram.config.ts'
import Handymenue from './Handymenue.tsx'
import Oeffnung from './ui/Oeffnung.tsx'

const ANKER = [
  { id: 'karte', text: 'Karte' },
  { id: 'laden', text: 'Der Laden' },
  { id: 'bestellen', text: 'Bestellen' },
]

/**
 * Welcher Abschnitt gerade im Bild ist.
 *
 * Mit IntersectionObserver, nicht mit einem Scroll-Zähler: ein Handler, der bei
 * jedem Scrollschritt die Positionen aller Sektionen nachmisst, ist genau die
 * Art von Arbeit, die eine Seite am Handy holprig macht.
 */
function useAktiverAnker(): string | null {
  const [aktiv, setAktiv] = useState<string | null>(null)

  useEffect(() => {
    const ziele = ANKER.map((a) => document.getElementById(a.id)).filter(
      (e): e is HTMLElement => e !== null,
    )
    if (ziele.length === 0) return

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        const sichtbar = eintraege
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (sichtbar) setAktiv(sichtbar.target.id)
      },
      /* Das obere Drittel wird ausgeblendet, damit der Anker erst wechselt,
         wenn die Sektion wirklich den Blick füllt — und nicht schon, wenn ihre
         erste Zeile unter der Kopfzeile auftaucht. */
      { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.25, 0.5] },
    )
    for (const z of ziele) beobachter.observe(z)
    return () => beobachter.disconnect()
  }, [])

  return aktiv
}

/**
 * Ist der Hero durch?
 *
 * Ein Wächter-Element unmittelbar unter der Kopfzeile wäre die Lehrbuchlösung.
 * Hier gibt es schon einen besseren Anker: die Backstube selbst. Sobald sie
 * nicht mehr im Bild ist, fährt der Kopf zusammen.
 *
 * IntersectionObserver und kein Scroll-Zähler — aus demselben Grund wie beim
 * aktiven Anker darüber: ein Handler, der bei jedem Scrollschritt misst, ist
 * genau die Arbeit, die eine Seite am Handy holprig macht.
 */
function useEngerKopf(): boolean {
  const [eng, setEng] = useState(false)

  useEffect(() => {
    const hero = document.querySelector('.backstube')
    if (!hero) return
    const b = new IntersectionObserver(([e]) => setEng(!(e?.isIntersecting ?? true)), {
      /* Nicht bei null: sonst schaltet es genau an der Kante hin und her,
         solange jemand dort langsam scrollt. */
      threshold: 0.08,
    })
    b.observe(hero)
    return () => b.disconnect()
  }, [])

  return eng
}

export default function Kopfzeile() {
  const aktiv = useAktiverAnker()
  const eng = useEngerKopf()
  const [menue, setMenue] = useState(false)
  const schliessen = useCallback(() => setMenue(false), [])

  return (
    <header className="kopf" data-eng={eng ? 'ja' : 'nein'}>
      <div className="schale">
        <div className="kopf__glas">
          <div className="kopf__zeile">
        <a className="kopf__marke" href="#start">
          {/* Ihr Logo, klein und in fester Grösse. Es kollidiert mit der ruhigen
              Cremerichtung — comichaft, rot, mit Pizzastück. Es zu ersetzen wäre
              ein Eingriff in ihre Marke, nicht in ihre Website: ihre Kunden
              erkennen es vom Ladenschild wieder. Also bekommt es einen festen
              kleinen Platz und wird nirgends vergrössert. */}
          <img
            src="/bilder/echt/logo.webp"
            alt={ARAM.langname}
            width={1220}
            height={540}
            className="kopf__logo"
          />
        </a>

        <nav className="kopf__navi" aria-label="Bereiche dieser Seite">
          {ANKER.map((a) => (
            <a
              key={a.id}
              href={`#${a.id}`}
              className="kopf__anker"
              aria-current={aktiv === a.id ? 'true' : undefined}
            >
              {a.text}
            </a>
          ))}
        </nav>

        {/* Zweimal derselbe Status, weil er am Handy anders lauten muss:
            „Geschlossen · öffnet morgen um 11:00 Uhr" ist auf 393 px neben Logo
            und Anrufknopf keine Zeile, sondern ein Umbruch. Gekürzt statt
            gestrichen — die Auskunft, ob gerade offen ist, gehört auch dorthin. */}
        <Oeffnung className="kopf__oeffnung" />
        <Oeffnung form="kurz" className="kopf__oeffnung-kurz" />

        <a className="knopf kopf__anruf" href={ARAM.kontakt.telefonHref}>
          <span aria-hidden="true">☎</span>
          <span className="kopf__anruf-text">{ARAM.kontakt.telefon}</span>
          <span className="kopf__anruf-kurz">Anrufen</span>
        </a>

        {/* Der Knopf steht NACH der Nummer, nicht davor. Auf einer Gastro-Seite
            ist Anrufen die Handlung und das Menü der Umweg; die wichtigere
            Sache gehört unter den Daumen, nicht das Verzeichnis. */}
        <button
          type="button"
          className="kopf__menue"
          aria-expanded={menue}
          aria-controls="handymenue"
          onClick={() => setMenue((m) => !m)}
        >
          <span className="kopf__menue-striche" aria-hidden="true" data-offen={menue ? 'ja' : 'nein'}>
            <span /><span /><span />
          </span>
          <span className="visuell-versteckt">{menue ? 'Menü schliessen' : 'Menü öffnen'}</span>
        </button>
          </div>
        </div>
      </div>

      <Handymenue anker={ANKER} offen={menue} schliessen={schliessen} />
    </header>
  )
}
