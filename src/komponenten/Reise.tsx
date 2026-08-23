import { useEffect, useRef, useState } from 'react'

import { useMedienabfrage, werkzeugHolen } from '../bewegung.ts'
import Funken from './ui/Funken.tsx'
import Mehlwolke from './ui/Mehlwolke.tsx'
import { Kopf, Sektion } from './ui/bausteine.tsx'

/**
 * Der Schluss der Reise — hier reisst das Käseschiff auf.
 *
 * ═══ Was von dieser Datei übrig ist, und warum ═══
 *
 * Bis zur dritten Fassung wohnte das Schiff HIER. Es trat in dieser Sektion
 * auf, flog eine Bildschirmhöhe und riss. Karol dazu: „Also, da ist ja nichts
 * an Scroll-Driven … das Käseschiff soll von oben nach unten … über Sektion 2,
 * 3, 4 … und bei 5 ist es vorbei."
 *
 * Ein Gegenstand, der über vier Sektionen reist, kann in keiner davon wohnen.
 * Er liegt jetzt fest im Fenster und wird von Kaeseschiff.tsx geführt.
 *
 * Was BLEIBT, ist die Bühne für den letzten Takt: Höhe, damit der Riss Weg hat,
 * und alles, was heiss ist — Funken aus dem Ofen, eine Mehlwolke beim
 * Eintreten. Der Text steht oben, nicht in der Mitte: in der Mitte reisst es.
 *
 * ═══ Die Worte sind vorläufig ═══
 *
 * Karol: „Wie genau man das nachher wordet, das sagt mir der Aram-Chef. Das
 * entscheide ich nicht selber." Sie stehen deshalb an EINER Stelle und tragen
 * keine Logik.
 */
export default function Reise() {
  const schmal = useMedienabfrage('(max-width: 719px)')
  const buehne = useRef<HTMLDivElement>(null)
  const [mehlstoss, setMehlstoss] = useState(0)

  useEffect(() => {
    const b = buehne.current
    if (!b) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let tot = false
    let abraeumen: (() => void) | undefined

    void werkzeugHolen().then((werkzeug) => {
      if (tot || !werkzeug) return
      /* Der Mehlstoss ist ein EREIGNIS, keine Zeile in einer gescrubbten
         Leiste. Rückwärts abgespielt wäre eine Wolke, die ins Blech
         zurückspringt — deshalb ein Zähler und kein Schalter: ein Schalter
         feuert einmal und auf dem Rückweg nie wieder. */
      const st = werkzeug.ScrollTrigger.create({
        trigger: b,
        start: 'top center',
        end: 'bottom top',
        onEnter: () => setMehlstoss((n) => n + 1),
        onEnterBack: () => setMehlstoss((n) => n + 1),
        invalidateOnRefresh: true,
      })
      abraeumen = () => st.kill()
    })

    return () => {
      tot = true
      abraeumen?.()
    }
  }, [])

  return (
    <Sektion id="reise" grund="tief" klasse="reise" beschriftetVon="reise-titel">
      <div className="reise__buehne" ref={buehne}>
        <Funken klasse="reise__funken" menge={schmal ? 14 : 30} />

        <div className="schale reise__wort">
          <Kopf
            id="reise-titel"
            etikett="Ofenfrisch"
            titel="Und dann bricht es auf"
            lead="Zweiundzwanzig Sorten Fata’er, von Hand gerollt und erst bei deiner Bestellung belegt. Das Käseschiffchen kommt als Letztes aus dem Ofen — und hält am längsten warm."
          />
        </div>

        {/* Die Wolke liegt ÜBER der Bühne und unter dem Schiff: das Schiff ist
            fest im Fenster, die Wolke gehört zur Sektion. Beides zusammen liest
            sich als ein Aufschlag im selben Raum. */}
        <div className="reise__mehl" aria-hidden="true">
          <Mehlwolke stoss={mehlstoss} menge={schmal ? 40 : 90} />
        </div>
      </div>
    </Sektion>
  )
}
