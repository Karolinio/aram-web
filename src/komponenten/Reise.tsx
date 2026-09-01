import { useEffect, useRef, useState } from 'react'

import { useMedienabfrage, werkzeugHolen } from '../bewegung.ts'
import Mehlwolke from './ui/Mehlwolke.tsx'
import { Kopf, Sektion } from './ui/bausteine.tsx'
import Untergrund from './ui/Untergrund.tsx'

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
      <Untergrund ton="nacht" muster="saat" />
      <div className="reise__buehne" ref={buehne}>
        {/* ═══ Die Funken sind RAUS ═══

            Karol am 23.08.: „Diese Blasen am Ende, was soll das denn? Ach, das
            ist aus."

            Es waren Ofenfunken — und über einer dunklen Fläche wären sie das
            auch gewesen. Über Clay nicht: ein oranger Punkt auf einem hellen
            warmen Grund hat weder die Helligkeit noch die Bewegung, die einen
            Funken ausmacht. Übrig blieben verstreute Kreise, und niemand, der
            sie sieht, liest daraus Glut.

            Dieselbe Lehre wie bei der Collage und beim Dampf-Ring: was auf
            einem Grund funktioniert, funktioniert auf dem anderen nicht, und
            der Ton entscheidet das, nicht die Bewegung. Funken.tsx bleibt
            liegen — über einem Ofenfoto ist er richtig. */}

        <div className="schale reise__wort">
          <Kopf
            id="reise-titel"
            etikett="Ofenfrisch"
            titel="Und dann bricht es auf"
            /* ═══ Der Vorspann war eine Wiederholung ═══
               Karol am 26.08.: „Bin ich mir nicht sicher, ob das so notwendig
               ist, weil das die Scroll-History einfach doppelt erzählt."

               Er hatte recht: „Zweiundzwanzig Sorten" steht auf dem Zettel im
               Vorhang, „von Hand gerollt" in der Handarbeit, „erst bei deiner
               Bestellung belegt" in beiden. Übrig bleibt der eine Satz, den
               nur diese Sektion sagen kann. */
            lead="Das Käseschiffchen kommt als Letztes aus dem Ofen und hält am längsten warm."
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
