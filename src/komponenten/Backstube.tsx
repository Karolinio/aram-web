import { useEffect, useRef } from 'react'

import { ARAM } from '../aram.config.ts'
import { useAbgang, useMedienabfrage } from '../bewegung.ts'
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
  /**
   * ═══ Zwei Fassungen des Videos, und der Grund ist Arithmetik ═══
   *
   * Die Quelle ist 464x848 — WhatsApp rechnet jedes Video auf unter 480p
   * herunter. Wie schlimm das aussieht, hängt allein davon ab, wie weit es
   * hochskaliert werden muss:
   *
   *   Handy   393 CSS-px bei doppelter Pixeldichte = 786 Gerätepunkte.
   *           464 -> 786 ist Faktor 1,7. Das sieht man kaum.
   *   Rechner 1440 CSS-px. 464 -> 1440 ist Faktor 3,1. Das sieht man sofort.
   *
   * Am Rechner läuft deshalb eine mit Lanczos auf 696 px gerechnete und leicht
   * nachgeschärfte Fassung: der Browser muss dann nur noch 2,07-fach
   * vergrössern statt 3,10-fach. Gemessen an der Varianz des Laplace-Operators
   * auf dem fertigen 1440-px-Bild — dem Standardmass für Bildschärfe:
   *
   *   464 px, wie bisher       3,9
   *   696 px, nachgeschärft    5,3   +37 %
   *   928 px, nachgeschärft    6,2   +61 %  — kostet aber 2,3 MB statt 1,1
   *
   * Die 696er ist zwei Drittel des Gewinns für die halben Bytes. Die 928er
   * wäre die bessere Wahl, wenn die Datei nicht dreimal so gross wäre wie die
   * ganze übrige Seite.
   *
   * Am Handy bleibt die kleine: dort ist der Unterschied kaum sichtbar, und
   * 1,1 MB zusätzlich über Mobilfunk für einen Schmuckhintergrund sind es
   * nicht wert.
   *
   * Hochrechnen fügt KEINE Details hinzu. Es macht Kanten sauberer, mehr
   * nicht. Die eigentliche Lösung steht in ABLICHTUNG.md: die Originaldatei
   * vom Handy des Inhabers, 1080x1920.
   */
  const schmal = useMedienabfrage('(max-width: 719px)')
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
    <>
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
          {/* Der Schlüssel erzwingt ein neues `video`-Element, wenn sich die
              Breite ändert. Ohne ihn behält der Browser die einmal gewählte
              Quelle bei — `<source>` wird nur beim ERSTEN Laden ausgewertet. */}
          <source
            key={schmal ? 'k-webm' : 'g-webm'}
            src={schmal ? '/video/kaeseschiffe.webm' : '/video/kaeseschiffe-gross.webm'}
            type="video/webm"
          />
          <source
            key={schmal ? 'k-mp4' : 'g-mp4'}
            src={schmal ? '/video/kaeseschiffe.mp4' : '/video/kaeseschiffe-gross.mp4'}
            type="video/mp4"
          />
        </video>
        <div className="backstube__schleier" />
      </div>

      {/* ═══ Über dem Video steht NUR das Logo ═══

          Karol, zum dritten Mal an derselben Stelle: „mach diesen hässlichen
          weissen Rauch weg auf der Startseite, diesen weissen Schimmer weg."

          Erst war es ein Schleier über dem ganzen Bild. Dann eine Platte hinter
          dem Text. Beides hat er gesehen und beides wollte er nicht — und er
          hat jedes Mal dasselbe gemeint: über dem Video soll nichts liegen.

          Es lässt sich nicht beides haben, und das ist gemessen: das Video
          läuft von rgb(59,2,0) bis rund 230. Über diese Spanne trägt KEINE
          Schriftfarbe — dunkle Schrift fällt auf den dunklen Stellen durch,
          helle auf den hellen. Ohne Fläche darunter ist Schrift auf diesem
          Video nicht lesbar, egal welche Farbe.

          Also geht die Schrift vom Video herunter. Der Hero zeigt das Video und
          ihr Logo, sonst nichts; die Worte stehen direkt darunter auf Clay, wo
          sie ohne jeden Trick 11:1 haben.

          Das Logo bleibt oben: es ist ein Rasterbild mit eigener Kontur und
          eigenem Schatten und braucht keinen Grund. */}
      <div className="schale backstube__mitte">
        <Ladenschild />

        <a className="backstube__weiter" href="#karte">
          <span>Zur Karte</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 4v15m0 0-6-6m6 6 6-6" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>

      {/* Der Satz steht auf Clay, nicht auf dem Video. Gemessen 11,18:1 — ohne
          Schleier, ohne Platte, ohne Lichthof. */}
      <div className="backstube__wort">
        <div className="schale">
          <h1 id="backstube-titel" className="backstube__titel" ref={titel}>
            Jeder Teig wird morgens von Hand gerollt
          </h1>
          <p className="backstube__ort">
            {ARAM.ort.strasse} · {ARAM.ort.stadtteil}
          </p>
        </div>
      </div>
    </>
  )
}
