import type { CSSProperties } from 'react'

import { useBildfolge, useFlug, useMedienabfrageBreit, useVersatz } from '../bewegung.ts'
import { GEBAECKE, type Gebaeck } from '../gebaecke.ts'
import { Etikett, Kopf, Sektion } from './ui/bausteine.tsx'

/**
 * Der Weg zum Fata’er — die Savor-Sequenz.
 *
 * ═══ Was ich beim ersten Bau falsch verstanden hatte ═══
 *
 * Die Direktion nennt Savor als Referenz und beschreibt sie als „Bilder liegen
 * versetzt und überlappend". Daraus hatte ich ein Nebeneinander gebaut: Text
 * links, Bild rechts. Beim Nachsehen der Referenz auf Mobbin zeigt sie etwas
 * anderes — die Bilder stehen FAST SENKRECHT ÜBEREINANDER, jedes anders breit,
 * seitlich versetzt, und sie überlappen sich VERTIKAL. Bei Savor ist es
 * Butter → Butter im Mehl → Butter brutzelt.
 *
 * Das ist kein Layout, das ist ein Prozess. Der Scroll führt durch die Schritte,
 * und weil sie sich überlappen, liest man sie als einen Vorgang statt als drei
 * Bilder. Genau deshalb funktioniert es ohne einen einzigen Rahmen.
 *
 * ═══ Die beiden Rollen ═══
 *
 * Die RECHTECKE liegen rechts und ziehen ungleich schnell hoch — das ist der
 * Savor-Rhythmus. Links fliegt der SCHWARM: fünf freigestellte Gebäcke fallen
 * von oben nach unten durch die Sektion, jedes mit eigener Weite, Drehung und
 * Tiefe. Sie sind die einzigen Elemente der Seite mit Eigenschatten, weil sie
 * als einzige Gegenstände sind und keine Bilder.
 *
 * ═══ Eins davon ist ihr Essen, vier sind es nicht ═══
 *
 * Welche, steht in gebaecke.ts im Feld `echt` — und warum, in
 * public/bilder/erzeugt/LIESMICH.md. Kurz: aus dem Scan ihrer alten Seite gibt
 * es genau EIN Produktfoto, und Karol hat am 15.08.2026 ausdrücklich
 * entschieden, die übrigen vier erzeugen zu lassen.
 */

/**
 * ═══ Drei Schritte, gleich gebaut, in Lesereihenfolge ═══
 *
 * Karol am 26.08.: „Da steht 01, 02, 03 … das ist irgendwie sehr unlogisch.
 * Einfach sehr, sehr unkonsistent."
 *
 * Er hatte recht, und es war schlimmer als unschön: die 03 stand LINKS in einer
 * eigenen klebenden Spalte, die 01 und die 02 rechts in einer Liste. Wer von
 * links nach rechts liest, las die Schritte in der Reihenfolge 3 → 1 → 2. Eine
 * nummerierte Folge, die man nicht der Reihe nach lesen kann, ist keine Folge,
 * sondern Dekoration mit Ziffern.
 *
 * Dazu waren die drei ungleich gebaut: zwei mit Foto in einem Rechteck, einer
 * als blosser Text ohne Bild. Drei Schritte eines Vorgangs müssen dieselbe
 * Form haben, sonst liest man sie als drei verschiedene Dinge.
 *
 * Jetzt: ein Datensatz, drei gleiche Glieder, nebeneinander in der Reihenfolge
 * 01 → 02 → 03. Der dritte trägt einen Freisteller statt eines Fotos — das
 * Bild „belegt und in den Ofen" gibt es von Aram nicht, und ein Foto zu
 * erfinden kommt nicht in Frage. Ein freigestellter Gegenstand ist auf dieser
 * Seite eine eigene, ehrliche Form.
 */
const SCHRITTE = [
  {
    zahl: '01',
    titel: 'Mehl auf die Fläche',
    text: 'Morgens um sieben, bevor der erste Gast kommt.',
    art: 'foto' as const,
    quelle: '/bilder/textur/mehl-holz.webp',
    alt: 'Bemehlte Holzarbeitsfläche mit Spuren vom Ausrollen',
    breite: 1700,
    hoehe: 949,
    /* Der Versatz ist die Treppe: jeder Schritt liegt etwas tiefer als der
       davor. Daraus entsteht die Leserichtung, ohne dass ein Pfeil nötig wäre. */
    versatz: 0,
    tempo: -0.05,
  },
  {
    zahl: '02',
    titel: 'Von Hand gerollt',
    text: 'Jede Scheibe einzeln, nicht aus der Kiste.',
    art: 'foto' as const,
    quelle: '/bilder/echt/handarbeit.webp',
    alt: 'Zwei Bäcker drücken Teigscheiben auf der bemehlten Arbeitsfläche, daneben ein Stapel fertiger Fladen',
    breite: 500,
    hoehe: 600,
    versatz: 1,
    tempo: 0.04,
  },
  {
    zahl: '03',
    titel: 'Erst dann belegt',
    text: 'Käse, Zaatar, Hackfleisch — was du bestellst.',
    art: 'freisteller' as const,
    /* ═══ Das Spiegelei ist raus ═══
       Karol, zum zweiten Mal: „ohne Ei." In /bilder/reise/ lag die
       adscharische Fassung — Ei und Butterflocke obenauf. Das ist ein anderes
       Gericht als ihres, und es stand ausgerechnet in dem Schritt, der zeigen
       soll, was sie belegen.
       Die eilose Aufnahme lag schon in /bilder/riss/ — dieselbe Kamera,
       derselbe Freisteller, nur ohne Ei. */
    quelle: '/bilder/riss/stufe-3-belegt.webp',
    alt: 'Ein mit Weisskäse belegtes, noch ungebackenes Käseschiffchen',
    breite: 1500,
    hoehe: 603,
    versatz: 2,
    tempo: -0.03,
  },
  {
    /* ═══ Der vierte Schritt war nur ein Satz ═══
       Karol am 26.08.: „Kann man das noch weiterführen mit irgendwelchen
       Bildern, die der Chef mir gegeben hat, oder sind wir da fertig?"

       Wir waren nicht fertig. Das Etikett der Sektion verspricht „Rollen,
       belegen, in den heissen Ofen" — den Ofen gab es nur als Nebensatz unter
       Schritt 03. In rohbilder/eingang liegt dafür genau eine Aufnahme:
       Bild 23, der Schieber fährt ins Feuer. Sie war unbenutzt. */
    zahl: '04',
    titel: 'In die Glut',
    text: 'Sechs Minuten auf dem Stein, bei offener Flamme.',
    art: 'foto' as const,
    quelle: '/bilder/echt/ofenschieber.webp',
    alt: 'Ein Holzschieber schiebt belegte Fladen in den brennenden Steinofen',
    breite: 900,
    hoehe: 675,
    versatz: 3,
    tempo: 0.05,
  },
] as const


function Schritt({ s }: { s: (typeof SCHRITTE)[number] }) {
  const ref = useVersatz<HTMLLIElement>(s.tempo)

  return (
    <li className="schritt" data-art={s.art} style={{ '--stufe': s.versatz } as CSSProperties} ref={ref}>
      <div className="schritt__bild">
        <img
          src={s.quelle}
          alt={s.alt}
          width={s.breite}
          height={s.hoehe}
          loading="lazy"
          decoding="async"
        />
      </div>
      <Etikett klasse="schritt__zahl">{s.zahl}</Etikett>
      <h3 className="schritt__titel lebt">{s.titel}</h3>
      <p className="schritt__text">{s.text}</p>
    </li>
  )
}


/**
 * Ein Gebäck auf seiner Bahn.
 *
 * Jedes bekommt seinen eigenen Trigger-Fortschritt über dieselbe Bühne, aber
 * eigene Weiten, Drehungen und Tiefen. Dass sie sich nicht überholen und nicht
 * überlappen, steckt in den Zahlen in gebaecke.ts — nicht in einer Kollisions-
 * rechnung, die auf jedem Bildschirm etwas anderes ergäbe.
 */
function Gebaeckstueck({ g }: { g: Gebaeck }) {
  const flug = useFlug<HTMLDivElement>({
    y: g.y,
    x: g.x,
    dreh: g.dreh,
    drehY: g.drehY,
    drehX: g.drehX,
    z: g.z,
    skala: g.skala,
    buehne: '.prozess',
    /* 0 = überall. Der Flug ist am Handy derselbe, nur die Bahn liegt anders —
       siehe `liM`/`grM` in gebaecke.ts. */
    abBreite: 0,
  })
  /* Die Ansichten liegen übereinander; der Scroll schaltet durch. Erst dadurch
     dreht sich das Gericht wirklich, statt nur zu kippen. */
  const folge = useBildfolge<HTMLDivElement>(g.bilder.length, '.prozess')

  return (
    <div
      className={g.echt ? 'gebaeck gebaeck--echt' : 'gebaeck'}
      ref={flug}
      /* Zwei Bahnen als Variablen; welche gilt, entscheidet die Medienabfrage
         im Stilblatt. So steht die Zahl an EINER Stelle und nicht zweimal. */
      style={
        {
          top: `${g.ob}%`,
          '--li': `${g.li}%`,
          '--gr': `${g.gr}%`,
          '--li-m': `${g.liM}%`,
          '--gr-m': `${g.grM}%`,
        } as CSSProperties
      }
    >
      <div className="gebaeck__folge" ref={folge}>
        {g.bilder.map((quelle, i) => (
          <img
            key={quelle}
            data-ansicht={i}
            src={quelle}
            /* Am Handy wird das Gericht auf rund 200 px dargestellt — die
               1000er Fassung zu dekodieren kostet dort messbar Frames. Mit
               `srcset` nimmt der Browser die halbe Grösse und entscheidet
               selbst; gemessen fiel der schlechteste Frame dadurch von 67 ms.
               Die Bildmasse bleiben die der grossen Fassung, sonst reserviert
               der Platzhalter die falsche Höhe. */
            srcSet={`${quelle.replace('.webp', '-500.webp')} 500w, ${quelle} 1000w`}
            sizes="(max-width: 1000px) 52vw, 26vw"
            /* Nur die erste Ansicht trägt den Alternativtext — die übrigen sind
               dasselbe Gericht und würden es einem Vorleseprogramm mehrfach
               ansagen. */
            alt={i === 0 ? g.alt : ''}
            aria-hidden={i === 0 ? undefined : true}
            width={g.breite}
            height={g.hoehe}
            loading="lazy"
            decoding="async"
          />
        ))}
      </div>
    </div>
  )
}

export default function Handarbeit() {
  return (
    <>
      {/* ═══ Das Band ist RAUS ═══

          Karol am 23.08.: „Naja, das gehört halt dazu zu diesem Sektion
          Fiasko, ganz direkt unter der Startseite. Das fuckt mich so arsch …
          ‚Du siehst zu, wie dein Fata’er entsteht' — auch rausnehmen." Und zu
          der Collage dahinter: „Ich weiss auch nicht, ob das dir diese Blasen
          darstellen sollen … keine Ahnung, was das sein soll."

          Wenn der Betrachter fragen muss, was etwas darstellen soll, stellt es
          nichts dar. Die Collage waren freigestellte Gebäcke bei 8 % Deckkraft
          — als Textur gedacht, gelesen als Flecken. Beides ersatzlos weg: der
          Hero geht jetzt ohne Zwischenstück in die erste Sektion.

          Auftritt.tsx und Collage.tsx bleiben liegen; sie werden woanders
          gebraucht. */}
      <Sektion grund="hell" klasse="prozess" beschriftetVon="prozess-titel">
        <div className="schale prozess__buehne">
          <Kopf
            id="prozess-titel"
            etikett="Rollen, belegen, in den heissen Ofen"
            titel="Alles entsteht vor deinen Augen"
            klasse="prozess__kopf"
          />

          <ol className="prozess__schritte">
            {SCHRITTE.map((x) => (
              <Schritt key={x.zahl} s={x} />
            ))}
          </ol>
        </div>

        {/* Der Schwarm liegt jetzt auf SEKTIONSEBENE, nicht mehr in der linken
            Spalte. Dort war er auf deren Breite beschränkt und konnte nie gross
            werden — Karol: „aber schon grösser machen als aktuell". Jetzt
            fliegen die Gerichte über die ganze Sektion, von unten nach oben,
            und ziehen hinter dem Text vorbei. */}
        <div className="schwarm">
          {GEBAECKE.map((g) => (
            <Gebaeckstueck key={g.id} g={g} />
          ))}
        </div>

        {/* Vierzehn freigestellte Sesam- und Schwarzkümmelkörner, jedes mit
            eigenem Tempo. Sie liegen hinter dem Schwarm und geben dem Raum eine
            Ausdehnung. Erzeugt — aber Material ohne erkennbaren Ort, und damit
            auf der erlaubten Seite der Grenze. */}
        <Koerner />
      </Sektion>
    </>
  )
}

/**
 * Einzelne Körner statt Klumpen.
 *
 * ═══ Zwei Fehlversuche, und warum der dritte funktioniert ═══
 *
 * 1. Drei Schichten zu 46/30/62 Prozent der Sektionsbreite: auf 1440 px sind
 *    das Körner von zwei Zentimetern. Sie lasen sich als Mandeln.
 * 2. Fünf kleine Schichten: richtig gross, aber jede zeigte dasselbe Blatt
 *    komplett — fünf enge Klumpen statt verstreuter Körner.
 *
 * Jetzt zeigt jedes Teilchen einen AUSSCHNITT des Blattes. `background-size:
 * 380%` bildet das Blatt auf knapp das Vierfache des Teilchens ab, und
 * `background-position` wählt daraus eine Stelle. Vierzehn Teilchen, vierzehn
 * verschiedene Stellen: aus einem Bild werden vierzehn verschiedene Körner,
 * bei einem einzigen Netzabruf.
 *
 * Die Stellen sind von Hand gewählt und liegen im mittleren Bereich des
 * Blattes — an den Rändern ist es leer, und ein leeres Teilchen ist ein Loch.
 */
const KOERNER = [
  { x: 32, y: 24, gr: 44, li: 3, ob: 6, tempo: -0.3, deck: 0.5 },
  { x: 58, y: 30, gr: 26, li: 16, ob: 15, tempo: 0.2, deck: 0.36 },
  { x: 44, y: 52, gr: 34, li: 27, ob: 3, tempo: -0.42, deck: 0.28 },
  { x: 66, y: 44, gr: 20, li: 41, ob: 21, tempo: 0.32, deck: 0.42 },
  { x: 38, y: 70, gr: 40, li: 55, ob: 9, tempo: -0.24, deck: 0.32 },
  { x: 72, y: 62, gr: 28, li: 84, ob: 17, tempo: 0.26, deck: 0.45 },
  { x: 50, y: 38, gr: 22, li: 92, ob: 40, tempo: -0.36, deck: 0.3 },
  { x: 60, y: 70, gr: 36, li: 8, ob: 44, tempo: 0.18, deck: 0.34 },
  { x: 28, y: 46, gr: 24, li: 34, ob: 58, tempo: -0.46, deck: 0.4 },
  { x: 70, y: 26, gr: 46, li: 62, ob: 52, tempo: 0.36, deck: 0.26 },
  { x: 40, y: 60, gr: 18, li: 78, ob: 66, tempo: -0.2, deck: 0.44 },
  { x: 54, y: 22, gr: 32, li: 21, ob: 78, tempo: 0.44, deck: 0.3 },
  { x: 64, y: 54, gr: 26, li: 47, ob: 86, tempo: -0.34, deck: 0.38 },
  { x: 36, y: 34, gr: 38, li: 88, ob: 88, tempo: 0.22, deck: 0.28 },
]

/**
 * Am Handy fliegen sechs Körner statt vierzehn.
 *
 * Gemessen: mit acht grossen Gerichten UND vierzehn Körnern kam das Handy auf
 * eine lange Aufgabe und fünf Frames über 33 ms, schlechtester 167 ms. Jedes
 * Korn ist ein eigener ScrollTrigger und eine eigene Ebene — zweiundzwanzig
 * davon sind auf einem Telefon zu viel.
 *
 * Gestrichen werden die KÖRNER, nicht die Gerichte. Die Gerichte sind das,
 * worum es geht; die Körner sind Atmosphäre, und Atmosphäre darf schmaler
 * werden, bevor der Gegenstand es tut.
 */
function Koerner() {
  const vollBreite = useMedienabfrageBreit()
  const sichtbar = vollBreite ? KOERNER : KOERNER.filter((_, i) => i % 2 === 0).slice(0, 6)

  return (
    <div className="koerner" aria-hidden="true">
      {sichtbar.map((k, i) => (
        <Korn key={i} k={k} />
      ))}
    </div>
  )
}

function Korn({ k }: { k: (typeof KOERNER)[number] }) {
  const ref = useVersatz<HTMLSpanElement>(k.tempo)
  return (
    <span
      ref={ref}
      className="korn"
      style={{
        width: `${k.gr}px`,
        height: `${k.gr}px`,
        left: `${k.li}%`,
        top: `${k.ob}%`,
        opacity: k.deck,
        backgroundPosition: `${k.x}% ${k.y}%`,
      }}
    />
  )
}
