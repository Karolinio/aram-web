import { useEffect, useState } from 'react'

/**
 * Das Logo als Wasserzeichen, unten rechts.
 *
 * ═══ Was es soll ═══
 *
 * Karol: „wenn man runterscrollt soll es als Wasserzeichen rechts in der Ecke
 * platziert sein, transparent gerne aber schon in der rechten unteren Ecke
 * sichtbar."
 *
 * Das Ladenschild im Hero hebt beim Scrollen ab und ist weg. Danach trägt die
 * Seite ihre Marke nur noch als 3 cm kleines Bild in der Kopfzeile. Das
 * Wasserzeichen füllt genau diese Strecke: es kommt, wenn das Schild geht.
 *
 * ═══ Wann es NICHT da ist, und warum das die halbe Arbeit war ═══
 *
 *   im Hero      dort hängt das Schild gross. Zwei Wortmarken gleichzeitig
 *                sind eine zu viel.
 *   im Fuss      dort steht das Logo schon. Ein Wasserzeichen darüber wäre ein
 *                doppeltes Logo mit zwei verschiedenen Deckkräften.
 *   über der     die Bestellleiste klebt am unteren Rand, sobald etwas
 *   Bestellung   ausgewählt ist. Dann rückt das Wasserzeichen hoch — über
 *                `:has()`, ohne dass die beiden Bauteile voneinander wissen
 *                müssen.
 *
 * ═══ Warum IntersectionObserver und nicht ScrollTrigger ═══
 *
 * GSAP wird auf dieser Seite NACHGELADEN und darf fehlschlagen — im Funkloch
 * gibt es dann keine Parallaxe, und das ist richtig so. Ein Markenzeichen darf
 * aber nicht von einem Nachladevorgang abhängen. IntersectionObserver ist im
 * Browser eingebaut, kostet keinen einzigen Scroll-Handler und meldet nur die
 * vier Male, die zählen.
 */
export default function Wasserzeichen() {
  const [sichtbar, setSichtbar] = useState(false)

  useEffect(() => {
    const hero = document.querySelector('.backstube')
    const fuss = document.querySelector('.fuss')
    if (!hero || !fuss) return

    /* Zwei Beobachter, ein Zustand. Beide schreiben in dieselben zwei Merker,
       damit „Hero weg UND Fuss noch nicht da" an einer Stelle entschieden wird
       statt an zweien, die sich gegenseitig überschreiben. */
    let heroDa = true
    let fussDa = false
    const entscheiden = () => setSichtbar(!heroDa && !fussDa)

    const aufHero = new IntersectionObserver(
      ([e]) => {
        if (!e) return
        heroDa = e.isIntersecting
        entscheiden()
      },
      /* Ein Viertel des Heros reicht, um ihn als „noch da" zu zählen. Bei 0
        erschiene das Wasserzeichen schon, während das Schild noch zu sehen ist. */
      { threshold: 0.25 },
    )

    const aufFuss = new IntersectionObserver(
      ([e]) => {
        if (!e) return
        fussDa = e.isIntersecting
        entscheiden()
      },
      { threshold: 0.12 },
    )

    aufHero.observe(hero)
    aufFuss.observe(fuss)

    return () => {
      aufHero.disconnect()
      aufFuss.disconnect()
    }
  }, [])

  return (
    <div className="wasserzeichen" data-da={sichtbar ? 'ja' : 'nein'} aria-hidden="true">
      <img src="/bilder/echt/logo.webp" alt="" width={1220} height={540} loading="lazy" />
    </div>
  )
}
