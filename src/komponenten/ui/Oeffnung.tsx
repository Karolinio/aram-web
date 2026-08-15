import { useEffect, useState } from 'react'

import { status, statusText } from '../../oeffnung.ts'

/**
 * „Jetzt geöffnet · noch 40 Minuten" — live im Browser gerechnet.
 *
 * ═══ Drei Regeln, die hier drinstecken ═══
 *
 * 1. **Sind keine Zeiten hinterlegt, steht hier NICHTS.** Kein „Zeiten auf
 *    Anfrage", kein grauer Punkt, keine Vermutung. Ein Gast, der wegen einer
 *    erfundenen Öffnungszeit vor verschlossener Tür steht, kommt nicht wieder.
 *
 * 2. **Der Punkt ist Terrakotta, nicht Grün.** Grün heisst auf dieser Seite
 *    nichts — die Palette kennt kein Grün, und ein einzelner grüner Punkt wäre
 *    der einzige Fremdkörper im ganzen Farbklang. Bei `prefers-reduced-motion`
 *    pulsiert er nicht.
 *
 * 3. **Es wird nachgerechnet, solange die Seite offen ist.** Wer um 21:58 auf
 *    der Seite steht, soll um 22:01 nicht mehr „Jetzt geöffnet" lesen. Alle
 *    30 Sekunden reicht dafür und kostet nichts.
 */

type Props = {
  /** `kurz` lässt den Zusatz weg — für die Kopfzeile am Handy. */
  form?: 'lang' | 'kurz'
  className?: string
}

export default function Oeffnung({ form = 'lang', className }: Props) {
  const [jetzt, setJetzt] = useState<Date | null>(null)

  /* Erst nach dem ersten Rendern eine Uhrzeit holen. Vorher gäbe es einen
     Zustand, der sich beim Hydrieren ändert — und das ist genau der Sprung
     beim Laden, den der Prüfer misst. */
  useEffect(() => {
    setJetzt(new Date())
    const id = setInterval(() => setJetzt(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  if (!jetzt) return null

  const s = status(jetzt)
  const text = statusText(s)
  if (!text) return null

  const kurz = s.art === 'offen' ? 'Jetzt geöffnet' : 'Geschlossen'

  return (
    <p className={`oeffnung${className ? ' ' + className : ''}`} data-art={s.art}>
      <span className="oeffnung__punkt" aria-hidden="true" />
      {form === 'kurz' ? kurz : text}
    </p>
  )
}
