import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { ARAM } from '../aram.config.ts'
import { scrollenSperren } from '../scrollen.ts'
import Oeffnung from './ui/Oeffnung.tsx'

/**
 * Das Menü am Handy.
 *
 * ═══ Warum es das geben muss ═══
 *
 * Unter 1000 px waren Karte, Der Laden und Bestellen schlicht ausgeblendet —
 * `.kopf__navi { display: none }`, seit dem ersten Bau. Wer auf dem Telefon
 * zur Speisekarte wollte, musste über die halbe Seite scrollen und sie
 * unterwegs erkennen. Das betrifft die MEHRHEIT der Gäste; auf einer
 * Gastro-Seite ist es der teuerste stille Fehler, den man machen kann.
 *
 * ═══ Warum es mehr ist als drei Links ═══
 *
 * Ein Menü, das nur Sprungmarken enthält, ist auf einer Seite mit vier
 * Abschnitten kaum die Mühe wert. Hier trägt es zusätzlich das, wofür der Gast
 * überhaupt gekommen ist: ob gerade offen ist, die Nummer, und WhatsApp. Damit
 * ist es kein Verzeichnis, sondern der kürzeste Weg zur Bestellung.
 *
 * ═══ Was an einem Menü Arbeit ist, und es ist nicht die Optik ═══
 *
 *   Fokus     Beim Öffnen muss er hinein, beim Schliessen zurück auf den
 *             Knopf. Sonst steht ein Tastaturnutzer hinter dem Menü und
 *             bedient eine Seite, die er nicht sieht.
 *   Tabulator Er muss im Menü bleiben. Hier von Hand gefangen statt über
 *             `inert` auf dem Rest — `inert` hat auf dieser Seite schon
 *             einmal Fokussprünge erzeugt, weil der gepinnte Abschnitt seine
 *             Elemente aus dem Fluss nimmt.
 *   Escape    Schliesst. Erwartung jedes Nutzers, der eine Tastatur hat.
 *   Scroll    Die Seite darunter darf sich nicht bewegen — und das ist bei
 *             weichem Scrollen zwei Handgriffe, siehe `scrollenSperren`.
 *
 * ═══ Warum es per Portal am `<body>` hängt und nicht in der Kopfzeile ═══
 *
 * Erster Versuch: das Menü lag als Kind der Kopfzeile und war `position:
 * fixed` mit `inset: var(--kopf-hoehe) 0 0`. Es füllte den Bildschirm NICHT —
 * es war 60 px hoch und der Inhalt lief sichtbar heraus.
 *
 * Der Grund ist der gläserne Kopf selbst: `backdrop-filter` macht ein Element
 * — genau wie `filter` und `transform` — zum enthaltenden Block für alle
 * `position: fixed`-Nachfahren. Das Menü rechnete seine Ränder also gegen die
 * 60 px hohe Kopfzeile statt gegen das Fenster.
 *
 * Ein Portal an den `<body>` löst das an der Wurzel statt mit einem höheren
 * `z-index` oder einer festen Höhe dagegen anzukämpfen. `aria-controls` vom
 * Knopf aus funktioniert weiterhin: es zeigt auf eine id, nicht auf einen
 * Nachbarn im Baum.
 */

type Anker = { id: string; text: string }

type Props = {
  anker: readonly Anker[]
  offen: boolean
  /** Wird gerufen, wenn das Menü sich schliessen will. */
  schliessen: () => void
}

export default function Handymenue({ anker, offen, schliessen }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  /* Wohin der Fokus zurück soll. Der Knopf ist es fast immer — aber „fast
     immer" reicht hier nicht: gemerkt wird, was WIRKLICH den Fokus hatte. */
  const vorher = useRef<HTMLElement | null>(null)

  useEffect(() => {
    scrollenSperren(offen)
    if (!offen) {
      vorher.current?.focus()
      vorher.current = null
      return
    }

    const p = panel.current
    if (!p) return
    vorher.current = document.activeElement as HTMLElement | null

    /* Der erste Link bekommt den Fokus, nicht das Panel selbst: wer mit der
       Tastatur öffnet, will die erste Wahl treffen, nicht erst weitertabben. */
    const fokussierbar = () =>
      [...p.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')]
    fokussierbar()[0]?.focus()

    const taste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        schliessen()
        return
      }
      if (e.key !== 'Tab') return
      const liste = fokussierbar()
      if (liste.length === 0) return
      const erstes = liste[0]!
      const letztes = liste[liste.length - 1]!
      /* Der Ring: vom letzten vorwärts geht es auf das erste zurück und
         umgekehrt. Ohne das landet der Fokus hinter dem Menü auf der Seite. */
      if (!e.shiftKey && document.activeElement === letztes) {
        e.preventDefault()
        erstes.focus()
      } else if (e.shiftKey && document.activeElement === erstes) {
        e.preventDefault()
        letztes.focus()
      }
    }

    document.addEventListener('keydown', taste)
    return () => document.removeEventListener('keydown', taste)
  }, [offen, schliessen])

  /* Beim Verlassen der Komponente die Sperre in jedem Fall lösen — sonst
     bliebe die Seite bei einem Neuaufbau mit offenem Menü blockiert. */
  useEffect(() => () => scrollenSperren(false), [])

  return createPortal(
    <div
      id="handymenue"
      className="handymenue"
      data-offen={offen ? 'ja' : 'nein'}
      /* `hidden` statt nur unsichtbar: ein geschlossenes Menü darf für
         Vorleseprogramme und den Tabulator gar nicht existieren. */
      hidden={!offen}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation und Bestellwege"
      ref={panel}
    >
      <nav className="handymenue__wege">
        {anker.map((a) => (
          <a key={a.id} href={`#${a.id}`} className="handymenue__anker" onClick={schliessen}>
            {a.text}
          </a>
        ))}
      </nav>

      <div className="handymenue__fuss">
        <Oeffnung className="handymenue__oeffnung" />

        <a className="knopf handymenue__knopf" href={ARAM.kontakt.telefonHref}>
          <span aria-hidden="true">☎</span> {ARAM.kontakt.telefon}
        </a>
        <a
          className="knopf knopf--leise handymenue__knopf"
          href={ARAM.kontakt.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
        >
          Über WhatsApp bestellen
        </a>
      </div>
    </div>,
    document.body,
  )
}
