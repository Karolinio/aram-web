import { useEffect, useRef } from 'react'

import { ARAM } from '../aram.config.ts'
import { useAbgang } from '../bewegung.ts'
import Ladenschild from './Ladenschild.tsx'

/**
 * Die Backstube — der Anfang.
 *
 * ═══ Fassung 4: ein Video, ein Logo, sonst nichts ═══
 *
 * Karol am 21.08.: „Entweder eine Startseite mit einem Video von drinnen oder
 * von draußen, und in der Mitte das Logo. Das Logo hat coole Animationen und
 * wird danach zu Wasserzeichen."
 *
 * Damit fällt weg, was hier drei Fassungen lang gestapelt war: Schlagzeile
 * links, Vorspann, Öffnungszeit, Knöpfe, Bildnachweis, ein schwebendes Gebäck.
 * Der Hero hat jetzt EINEN Gegenstand in der Mitte und einen bewegten Grund.
 *
 * Das ist keine Vereinfachung um der Ruhe willen. Ein Video zieht den Blick
 * von selbst — es braucht keinen zweiten Anziehungspunkt, es braucht einen
 * Ruhepunkt. Das Logo ist dieser Ruhepunkt, und weil sonst nichts danebensteht,
 * darf es gross sein, ohne laut zu wirken.
 *
 * ═══ Was das Video kann und was nicht ═══
 *
 * Es kommt aus WhatsApp und ist deshalb 464×848 — knapp 480p. Auf dem Handy
 * ist das genau richtig: ein Hochformat auf einem Hochformat, nichts wird
 * gestreckt. Am Rechner muss es auf 1440 Breite hochskaliert werden, gut das
 * Dreifache, und das sieht man.
 *
 * Getragen wird es dort vom Schleier: unter einer deckenden dunklen Fläche
 * verschwindet Unschärfe fast vollständig, weil das Auge Kanten braucht, um
 * Schärfe zu beurteilen. Die eigentliche Lösung ist trotzdem eine andere und
 * steht in STAND.md: die Originaldatei vom Handy des Inhabers holen. WhatsApp
 * rechnet jedes Video auf 480p herunter; das Original ist 1080×1920.
 */
export default function Backstube() {
  const titel = useAbgang<HTMLHeadingElement>('.backstube')
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = video.current
    if (!v) return
    /* Wer weniger Bewegung will, bekommt das Standbild — das Poster steht
       ohnehin schon da. Ein Video, das trotz der Einstellung läuft, ist der
       häufigste Verstoss gegen genau diese Einstellung. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    /* `play()` gibt ein Versprechen zurück, das der Browser ablehnt, wenn er
       das Abspielen verweigert. Ohne den Fänger landet das als unbehandelter
       Fehler in der Konsole — und verdeckt echte Fehler. */
    v.play().catch(() => {})
  }, [])

  return (
    <section className="backstube" id="start" aria-labelledby="backstube-titel">
      <div className="backstube__grund" aria-hidden="true">
        <video
          ref={video}
          className="backstube__video"
          poster="/video/kaeseschiffe-poster.jpg"
          /* Alle vier Angaben sind Pflicht, nicht Geschmack:
             `muted` — ohne sie verweigert jeder Browser das Abspielen.
             `playsInline` — ohne sie reisst iOS das Video ins Vollbild.
             `loop` — 12 Sekunden, und dann wäre sonst Schluss.
             `preload="metadata"` — das Poster trägt den ersten Eindruck,
             das Video darf nachkommen. 1,6 MB gehören nicht in die
             erste Sekunde einer Gastro-Seite. */
          muted
          playsInline
          loop
          preload="metadata"
        >
          <source src="/video/kaeseschiffe.webm" type="video/webm" />
          <source src="/video/kaeseschiffe.mp4" type="video/mp4" />
        </video>
        <div className="backstube__schleier" />
      </div>

      <div className="schale backstube__mitte">
        <Ladenschild />

        <h1 id="backstube-titel" className="backstube__titel" ref={titel}>
          Jeder Teig wird morgens von Hand gerollt
        </h1>

        {/* Jetzt echte Angaben statt einer Behauptung — beide stehen auf ihrem
            eigenen Flyer, siehe rohbilder/FUNDE.md. Auf einer Gastro-Seite ist
            „wo" und „wann" die Frage, mit der die meisten kommen. */}
        <p className="backstube__ort">
          {ARAM.ort.strasse} · {ARAM.ort.stadtteil}
        </p>

        <a className="backstube__weiter" href="#karte">
          <span>Zur Karte</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 4v15m0 0-6-6m6 6 6-6" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  )
}
