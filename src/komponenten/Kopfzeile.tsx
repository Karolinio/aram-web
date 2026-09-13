import { useCallback, useEffect, useState } from 'react'

import { ARAM } from '../aram.config.ts'
import Handymenue from './Handymenue.tsx'

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
    const hero = document.querySelector('.vorhang')
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
      <div className="kopf__zeile schale">
        <a className="kopf__marke" href="#start">
          {/* Ihr Logo, klein und in fester Grösse. Es kollidiert mit der ruhigen
              Cremerichtung — comichaft, rot, mit Pizzastück. Es zu ersetzen wäre
              ein Eingriff in ihre Marke, nicht in ihre Website: ihre Kunden
              erkennen es vom Ladenschild wieder. Also bekommt es einen festen
              kleinen Platz und wird nirgends vergrössert. */}
          <img
            src="/bilder/echt/logo.webp"
            alt={ARAM.langname}
            width={875}
            height={381}
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

        {/* ═══ Kein Öffnungsstatus mehr im Kopf ═══

            Karol, viermal an derselben Stelle, zuletzt am 23.08.: „Ja, ich
            weiss auch nicht, wie oft ich das sage, aber Startseite, bitte.
            Dieses ‚Geschlossen · öffnet heute um 08:00 Uhr' aus dem
            Glass-Header raus."

            Er hatte recht, und der Grund lässt sich benennen: im Kopf steht
            nur, was zu einer HANDLUNG führt — Karte, Laden, Bestellen,
            Anrufen. „Geschlossen" führt zu keiner; es nimmt sie weg. Als
            Erstes, was ein Besucher über diesen Betrieb liest, ist es die
            denkbar schlechteste Zeile.

            Die Auskunft ist nicht verloren: die vollen Zeiten stehen in „Der
            Laden", und die Bestellleiste am Fuss kennt den Status weiterhin.
            Oeffnung.tsx bleibt deshalb im Bau. */}

        {/* ═══ Die zwei Wege: Anrufen und WhatsApp, oben rechts ═══

            Am 01.09. war die Nummer aus dem Kopf heraus („lass den schweren
            Platz aus") und als Stein auf die Startseite gezogen. Am 13.09.
            kam sie zurück, und diesmal mit Begründung: „Nur Anrufen als
            Telefonbutton und WhatsApp als WhatsApp-Button oben rechts in die
            Ecke, die Karte also komplett raus von der Startseite."

            Der Unterschied zu damals: keine Nummer als Text in einer
            gefüllten Pille, sondern zwei Zeichen. Am Handy nur die Zeichen,
            44 px; am Schirm mit Wort. Und sie stehen auf jedem
            Bildschirmmeter — genau das, was den Steinen auf der Startseite
            fehlte, die man als Erstes wegscrollt.

            Die beiden Marken sind so gezeichnet, wie man sie kennt: der
            Hörer aus Material, das WhatsApp-Zeichen wie auf ihrem Flyer.
            Eine Sprechblase ohne Hörer wäre „Nachricht", nicht WhatsApp. */}
        <div className="kopf__wege">
          <a className="kopf__weg" href={ARAM.kontakt.telefonHref}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
            <span className="kopf__weg-wort">Anrufen</span>
          </a>
          <a
            className="kopf__weg"
            href={ARAM.kontakt.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
            <span className="kopf__weg-wort">WhatsApp</span>
          </a>
        </div>

        {/* Der Knopf steht NACH den Wegen, nicht davor. Auf einer Gastro-Seite
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

      <Handymenue anker={ANKER} offen={menue} schliessen={schliessen} />
    </header>
  )
}
