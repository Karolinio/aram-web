import { useEffect, useRef } from 'react'

import type { Gericht } from '../../inhalt.ts'

/**
 * Ein Gericht gross ansehen.
 *
 * ═══ Warum `dialog` und kein eigenes Overlay ═══
 *
 * Karol: „Entweder man sieht es von Anfang an, wie so ein Produktbild, oder
 * wenn man draufklickt, öffnet sich ein grösseres. Beides."
 *
 * Ein Overlay von Hand zu bauen heisst, vier Dinge selbst zu erledigen, die
 * jedes davon eine eigene Fehlerquelle sind: den Fokus einfangen, damit die
 * Tabulatortaste nicht hinter das Fenster läuft; Escape abfangen; den
 * Hintergrund für Vorleseprogramme stillstellen; und den Fokus danach wieder
 * dorthin zurückgeben, wo er herkam.
 *
 * `dialog.showModal()` erledigt alle vier. Es liegt ausserdem in der obersten
 * Ebene des Browsers — also über allem, ohne `z-index`-Wettrüsten mit dem
 * Käseschiff, das fest im Fenster liegt.
 *
 * ═══ Was hier NICHT drin steht ═══
 *
 * Kein Weiterblättern zum nächsten Gericht. Es wäre in zehn Zeilen gebaut und
 * wäre falsch: wer ein Bild öffnet, will DIESES Gericht sehen — und wer
 * blättern will, hat die Karte darunter, die das besser kann. Ein Karussell
 * über einer Liste ist eine zweite Navigation für dieselbe Sache.
 */

type Props = {
  /** Welches Gericht — `null` heisst zu. */
  gericht: Gericht | null
  schliessen: () => void
}

export default function Bildschau({ gericht, schliessen }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    /* `showModal` statt des `open`-Attributs. Nur `showModal` gibt die oberste
       Ebene, den Fokusfang und den Hintergrundverschluss — `open` allein macht
       daraus ein gewöhnliches Kästchen im Fluss. */
    if (gericht && !d.open) d.showModal()
    if (!gericht && d.open) d.close()
  }, [gericht])

  /* Escape und der Schliessknopf des Browsers gehen an `close`, nicht an
     unseren Knopf. Ohne diesen Horcher wüsste React nichts davon und würde das
     Fenster beim nächsten Rendern wieder aufmachen. */
  useEffect(() => {
    const d = ref.current
    if (!d) return
    d.addEventListener('close', schliessen)
    return () => d.removeEventListener('close', schliessen)
  }, [schliessen])

  const bild = gericht?.bild

  return (
    <dialog
      className="bildschau"
      ref={ref}
      aria-labelledby={gericht ? 'bildschau-titel' : undefined}
      /**
       * Klick auf den Hintergrund schliesst.
       *
       * Der Test ist `ziel === dialog`: das `dialog`-Element füllt das ganze
       * Fenster, sein Inhalt liegt in einem Kind. Ein Klick, dessen Ziel das
       * `dialog` SELBST ist, kann also nur daneben gegangen sein. Über die
       * Mauskoordinaten zu gehen wäre der übliche Weg und ist der schlechtere:
       * er zählt einen Klick, der im Fenster begann und daneben endete
       * (Textauswahl), als Klick daneben.
       */
      onClick={(e) => {
        if (e.target === ref.current) schliessen()
      }}
    >
      {gericht && (
        <div className="bildschau__innen">
          <button
            type="button"
            className="bildschau__zu"
            onClick={schliessen}
            /* Erstes fokussierbares Element im Fenster — `showModal` setzt den
               Fokus dorthin, und „Schliessen" ist die richtige erste Ansage. */
            autoFocus
          >
            <span aria-hidden="true">✕</span>
            <span className="visuell-versteckt">Schliessen</span>
          </button>

          {bild ? (
            <img
              className="bildschau__bild"
              src={bild.quelle}
              alt={bild.alt}
              width={bild.breite}
              height={bild.hoehe}
            />
          ) : (
            /* Sollte nie erscheinen — der Knopf, der hierher führt, gibt es nur
               mit Bild. Steht trotzdem hier: eine Ansicht, die bei fehlenden
               Daten leer aufgeht, ist schlimmer als eine, die sagt, was fehlt. */
            <p className="bildschau__luecke">Von diesem Gericht gibt es noch kein Foto.</p>
          )}

          <div className="bildschau__wort">
            <h2 className="bildschau__titel lebt" id="bildschau-titel">
              {gericht.nr != null && <span className="zeile__nr">{gericht.nr}</span>}
              {gericht.name}
            </h2>
            <p className="bildschau__preis">
              {gericht.preis === null ? (
                <>
                  <span className="visuell-versteckt">Preis folgt</span>
                  {/* Drei Punkte statt eines Gedankenstrichs, wie in der Karte
                      selbst. Beide Stellen zeigen dasselbe „noch kein Wert"
                      und muessen dasselbe Zeichen dafuer nehmen. */}
                  <span aria-hidden="true">…</span>
                </>
              ) : (
                gericht.preis.toFixed(2).replace('.', ',') + ' €'
              )}
            </p>
            <p className="bildschau__text">{gericht.beschreibung}</p>
            <p className="bildschau__allergene">
              <span className="visuell-versteckt">Enthält: </span>
              {gericht.allergene.join(' · ')}
            </p>
          </div>
        </div>
      )}
    </dialog>
  )
}
