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
  const wort = useAbgang<HTMLDivElement>('.backstube')
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
          poster="/video/ofen-poster.jpg"
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
          {/* ═══ Warum DIESER Clip, und was die Messung NICHT sagt ═══

              Karol am 10.09.: „wegen qualität und weil das ein unnötiges
              video ist. entweder das vorherige mit dem steinofen oder nur
              hinter der theke von essen ein video."

              Hier lief ein Gang durch den Laden an der Auslage entlang.
              Gemessen war er von allen sechs Kandidaten der SCHAERFSTE
              (Laplace-Varianz 2150 gegen 1293 bei diesem hier). Die Messung
              beantwortet aber nicht die Frage, die er stellt: ein Schwenk
              ueber eine Vitrine sagt nichts, was nicht jede Baeckerei sagen
              koennte. „Unnoetig" ist keine Bildqualitaet, sondern ein Urteil
              ueber den Inhalt, und da hat er recht.

              Was die Messung beitraegt, ist eine andere Zahl: die BEWEGUNG
              zwischen den Bildern. Hinter einer Ueberschrift zaehlt sie mehr
              als Schaerfe — ein ruhiges Bild traegt Text, ein hektisches
              frisst ihn. Ueber die ganze Cliplaenge gemittelt, und daneben
              die ruhigsten acht Sekunden, die jeder Clip zu bieten hat:

                                    Mittel   ruhigste 8 s
                  06 Theke           42,9      31,8  (ab 15,5 s)
                  04 Ofen+Schiffe    46,8      46,8  (ab  0,9 s)  <- gewaehlt
                  02 Ofen (alt)      55,8      45,9  (ab 45,2 s)
                  08 Handwerk        56,6      52,9
                  01 Vitrine         56,7      56,7
                  03 Belegen+Ofen    58,9      60,2

              Die Theke ist also die ruhigste, nicht dieser Clip — eine
              frueher gerechnete Fassung, die nur die ersten zwoelf Sekunden
              jedes Clips ansah, legte das Gegenteil nahe. Es aendert die Wahl
              nicht: die Theke ist aus INHALTLICHEN Gruenden raus, und dagegen
              hilft keine Bewegungszahl. Unter den verbleibenden ist dieser
              der ruhigste, und sein ruhigster Abschnitt liegt gleichauf mit
              dem des alten Ofenclips (46,8 gegen 45,9) — nur zeigt er dabei
              auch das Gebaeck.

              Und er ist beides, was Karol zur Wahl gestellt hat — der
              Steinofen mit der blauen Flamme im Hintergrund UND ein Brett
              voller Kaeseschiffe im Vordergrund, in jedem einzelnen Bild.

              Acht Sekunden statt zwoelf: die Quelle ist neun lang, und ein
              Schleifenschnitt kostet eine davon. Kuerzer ist hier kein
              Verlust — die Kamera steht fast still, es gibt keinen Bogen, den
              man abwarten muesste.

              ═══ Die webm-Quelle bleibt raus ═══
              VP9 schlaegt h264 normalerweise; an diesem koernigen
              Handymaterial nicht (gemessen 4,44 gegen 2,84 MB). Der Browser
              nimmt die erste Quelle, die er kann — er haette immer die
              schwerere geladen. */}
          <source
            key={schmal ? 'k-mp4' : 'g-mp4'}
            src={schmal ? '/video/ofen.mp4' : '/video/ofen-gross.mp4'}
            type="video/mp4"
          />
        </video>
      </div>

      {/* ═══ Der Satz steht wieder auf dem Video — klein ═══

          Karol am 23.08.: „Das Aram-Startseiten-Video soll direkt grossflächig
          flächendeckend sein und nicht unterbrochen von dieser gebrickten
          Sektion darunter … Schreib das in Schwarz oder in Weiss einfach auch
          auf die Startseite, unauffällig, und dann die Sektion rausnehmen."

          Die Runde davor stand der Satz UNTER dem Video auf Clay. Das war
          rechnerisch richtig — 11:1 ohne jeden Trick — und gestalterisch
          falsch: es zerschnitt den Hero in zwei Blöcke, und der zweite sah aus
          wie eine angefangene Sektion.

          Warum es JETZT trägt und bei den drei Fehlversuchen davor nicht: die
          Fehlversuche wollten eine 4-rem-Schlagzeile über das ganze Bild legen.
          Über eine Fläche, die von rgb(59,2,0) bis 230 läuft, geht das nicht —
          jede Farbe fällt auf der einen Hälfte durch. Eine KLEINE Zeile ist ein
          anderer Fall: sie deckt wenige Prozent des Bildes ab, und ein dunkler
          Saum um weisse Schrift ist die Lösung, die jeder Untertitel benutzt.

          Ein DUNKLER Saum, kein heller. „Diesen weissen Schimmer weg" galt dem
          Leuchten, nicht dem Schatten. */}
      <div className="schale backstube__mitte">
        <Ladenschild />

        <div className="backstube__wort" ref={wort}>
          <h1 id="backstube-titel" className="backstube__titel">
            Jeder Teig wird morgens von Hand gerollt
          </h1>
          <p className="backstube__ort">
            {ARAM.ort.strasse} · {ARAM.ort.stadtteil}
          </p>
        </div>

        {/**
          * ═══ Drei Steine statt eines Knopfes ═══
          *
          * Karol am 01.09.: „Machst du drei kleine Steine: bei einem schreibst
          * du zur Karte rein, bei dem anderen die Telefonnummer, bei dem
          * dritten das Insta … iteriere, was am meisten Sinn macht und wie
          * viele wir wirklich brauchen."
          *
          * DREI, und jeder steht für eine Absicht, die ein Gast wirklich hat:
          * nachsehen, anrufen, schreiben. Mehr Knöpfe nebeneinander heissen
          * nicht mehr Wege, sondern eine Wahl, die niemand treffen wollte.
          *
          * Der QR ist NICHT dabei, obwohl Karol ihn erwogen hat. Zwei Gründe,
          * und beide sind hart: am Handy — wo die meisten Gäste sind — kann
          * man den eigenen Schirm nicht scannen, der Stein wäre dort tot. Und
          * am Rechner tut er dasselbe wie „Zur Karte", nur mit einem Gerät
          * mehr dazwischen. Er hat seinen Platz schon, unten bei „Karte aufs
          * Handy", wo die Zeile daneben erklärt, wofür er gut ist.
          *
          * Instagram fehlt, und zwar nicht aus Nachlässigkeit: in
          * aram.config.ts steht dafür `null`, und weder auf ihren beiden
          * Flyern noch auf ihrer eigenen Seite steht ein Handle. Der Stein ist
          * gebaut und erscheint von selbst, sobald einer eingetragen ist —
          * dieselbe Regel wie bei den Lieferdiensten: ein Knopf, der ins Leere
          * führt, ist schlimmer als keiner.
          */}
        <nav className="backstube__steine" aria-label="Schnellwege">
          <a className="stein stein--erst" href="#karte">
            <span className="stein__wort">Zur Karte</span>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M12 4v15m0 0-6-6m6 6 6-6" fill="none" stroke="currentColor"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          <a className="stein" href={ARAM.kontakt.telefonHref}>
            <span className="stein__wort">Anrufen</span>
            <span className="stein__zusatz">{ARAM.kontakt.telefon}</span>
          </a>

          <a className="stein" href={ARAM.kontakt.whatsapp} rel="noopener noreferrer"
            target="_blank">
            <span className="stein__wort">WhatsApp</span>
            <span className="stein__zusatz">Schreib uns</span>
          </a>

          {ARAM.sozial.instagram && (
            <a className="stein" href={ARAM.sozial.instagram} rel="noopener noreferrer"
              target="_blank">
              <span className="stein__wort">Instagram</span>
              <span className="stein__zusatz">Was heute rauskommt</span>
            </a>
          )}
        </nav>
      </div>
    </section>
  )
}
