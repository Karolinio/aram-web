import type { CSSProperties } from 'react'

import { useBildfolge, useFlug, useMedienabfrageBreit, useOfenwand, useVersatz } from '../bewegung.ts'
import { GEBAECKE, type Gebaeck } from '../gebaecke.ts'
import { Etikett, Kopf, Sektion } from './ui/bausteine.tsx'
import Dampf from './ui/Dampf.tsx'
import Untergrund from './ui/Untergrund.tsx'

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
    quelle: '/bilder/ofenwand/01-mehl.webp',
    alt: 'Bemehlte Holzarbeitsfläche mit Spuren vom Ausrollen',
    breite: 800,
    hoehe: 948,
    /* Die Hoehe folgt dem Motiv, nicht einem Raster — siehe useOfenwand. */
    anteil: 0.86,
  },
  {
    zahl: '02',
    titel: 'Von Hand gerollt',
    text: 'Jede Scheibe einzeln, nicht aus der Kiste.',
    /* ═══ Neu zugeschnitten, und warum ═══

       Karol am 07.09.: „die Bilder sehen irgendwie nicht qualitativ hochwertig
       aus." Bei diesem hier war es messbar: 500 px nativ, dargestellt auf
       1286 Geraetepixeln — eine 2,6-fache Hochrechnung.

       Die alte Fassung zeigte ausserdem zwei Gesichter und ein eingebranntes
       Aram-Wasserzeichen unten rechts. Ein Wasserzeichen auf der eigenen Seite
       ist ein Amateur-Signal, und ein Skalierer haette die beiden Gesichter
       neu gezeichnet — was bei echten Menschen nicht in Frage kommt.

       Der Zuschnitt auf Haende und Teigstapel loest alles drei auf einmal: er
       zeigt genau, was die Zeile daneben behauptet, das Wasserzeichen ist weg,
       und die Gesichter sind es auch. Hochgerechnet wurde die VOLLE Aufnahme
       (mehr Kontext = besseres Ergebnis), beschnitten danach. */
    quelle: '/bilder/ofenwand/02-haende.webp',
    alt: 'Zwei Paar Hände drücken Teigscheiben auf einem Stapel fertiger Fladen',
    breite: 900,
    hoehe: 1240,
    anteil: 1,
  },
  {
    zahl: '03',
    titel: 'Erst dann belegt',
    text: 'Käse, Zaatar, Hackfleisch. Was du bestellst.',
    /* ═══ Neues Motiv am 07.09. ═══

       Karol: „in dem Ofen 03 geht, glaube ich, auch besser."

       Er hat recht, und der Grund ist die Abfolge: hier stand ein Brett, das
       schon IN DEN OFEN fährt — dasselbe Motiv wie Schritt 04. Zwei
       Ofenmäuler hintereinander, und der Unterschied zwischen „belegt" und
       „in der Glut" fiel weg.

       Jetzt ein Tisch voller frisch belegter, ROHER Lahmacun von oben. Das
       ist buchstäblich, was die Zeile sagt, und es trennt den Schritt sauber
       von 04. Aus ihrem eigenen Material; die unteren dreizehn Prozent sind
       weg, weil dort wieder ein eingebranntes Aram-Wasserzeichen sass. */
    quelle: '/bilder/ofenwand/03-belegt.webp',
    alt: 'Ein Tisch voller frisch belegter Lahmacun, roh, dicht an dicht',
    breite: 747,
    hoehe: 1132,
    anteil: 1.1,
  },
  {
    zahl: '04',
    titel: 'In die Glut',
    text: 'Sechs Minuten auf dem Stein, bei offener Flamme.',
    quelle: '/bilder/ofenwand/04-ofen.webp',
    alt: 'Ein Holzschieber schiebt belegte Fladen in den brennenden Steinofen',
    breite: 900,
    hoehe: 1141,
    anteil: 0.92,
  },
] as const


function Tor({ s }: { s: (typeof SCHRITTE)[number] }) {
  return (
    <li className="tor" style={{ '--anteil': s.anteil } as CSSProperties}>
      <div className="tor__maul" data-maul>
        <img
          data-fuellung
          src={s.quelle}
          srcSet={`${s.quelle.replace('.webp', '-450.webp')} 450w, ${s.quelle} 900w`}
          sizes="(max-width: 859px) 44vw, 23vw"
          alt={s.alt}
          width={s.breite}
          height={s.hoehe}
          loading="lazy"
          decoding="async"
        />
        {/* Die Hitze auf der Kante der einfahrenden Aufnahme. Sie wandert mit
            ihr hoch — die Lage kommt aus demselben Wert wie die Fuellung. */}
        <span className="tor__glut" data-glut aria-hidden="true" />
      </div>
      {/* Die Beschriftung steht auf der Bank, die `.prozess__wand::after`
          ueber die ganze Breite zieht — die Begruendung mit den gemessenen
          Kontrastwerten steht dort im Stilblatt. */}
      <Etikett klasse="tor__zahl">{s.zahl}</Etikett>
      <h3 className="tor__titel lebt">{s.titel}</h3>
      <p className="tor__text">{s.text}</p>
    </li>
  )
}

/**
 * Vier Maeuler, ein Boden, eine Welle von links nach rechts.
 *
 * Die Begruendung fuer den Umbau vom EINEN grossen Bogen auf VIER kleine steht
 * am Haken `useOfenwand` in bewegung.ts — kurz: der grosse Bogen rechnete zwei
 * der vier Aufnahmen hoch und stand ausserdem genau auf der Flugbahn des
 * Schwarms.
 */
function Ofenwand() {
  const strecke = useOfenwand<HTMLDivElement>({
    wandWahl: '.prozess__wand',
    torWahl: '.tor',
  })

  return (
    <div className="prozess__strecke" ref={strecke}>
      <div className="prozess__wand">
        <ol className="prozess__tore">
          {SCHRITTE.map((x) => (
            <Tor key={x.zahl} s={x} />
          ))}
        </ol>
        {/* Der Dampf gehoert ueber die WAND, nicht in ein einzelnes Maul: ein
            Ofen dampft, nicht ein Bild. Schmal und flach — die vorige Leinwand
            mass 655 x 443 und begann 57 px ueber dem Fensterrand, lag also zur
            Haelfte hinter der Kopfzeile und als Nebel ueber allem anderen. */}
        <Dampf ton="ofen" klasse="prozess__dampf" dichte={5} />
      </div>
    </div>
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
/**
 * Wer fliegt — und wie viele.
 *
 * Die hinteren Wiederholungen (`nurBreit`) verdichten das Bild am Schirm. Am
 * Handy bleiben sie weg: jedes Stueck ist ein eigener ScrollTrigger und eine
 * eigene Ebene, und dort ist schon einmal eine lange Aufgabe gemessen worden.
 * Dieselbe Regel wie bei den Koernern — Atmosphaere darf schmaler werden,
 * bevor der Gegenstand es tut.
 */
function Schwarm() {
  const breit = useMedienabfrageBreit()
  const sichtbar = breit ? GEBAECKE : GEBAECKE.filter((g) => !g.nurBreit)
  return (
    <>
      {sichtbar.map((g) => (
        <Gebaeckstueck key={g.id} g={g} />
      ))}
    </>
  )
}

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
    /* Die Drehungen auf das Kind, nicht auf den Rahmen: sonst legt sich der
       Dampf mit dem Gebäck um bis zu 45 Grad auf die Seite. Dampf steigt
       senkrecht, auch über etwas, das sich dreht. */
    drehZiel: '.gebaeck__folge',
  })
  /* Nur am Schirm. Darunter kostet jede zusätzliche Leinwand messbar Frames —
     hier sind schon einmal lange Aufgaben gemessen worden —, und ein Fladen
     ist dort 180 px breit; der Dampf darüber wäre ein Fleck. */
  const breit = useMedienabfrageBreit()
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
          /* Aus dieser einen Zahl leiten sich Unschaerfe, Deckung und
             Schattenweite ab — siehe `tiefe` in gebaecke.ts. */
          '--tiefe': g.tiefe,
        } as CSSProperties
      }
    >
      {/* HINTER dem Gebäck, nicht davor: Dampf vor dem Essen ist Nebel auf
          dem Teller. Die Leinwand ist breiter als das Gebäck und steht
          darüber — Dampf breitet sich aus, während er steigt. */}
      {/* ═══ Wer dampft ═══

          Karol am 07.09.: „die dann auch im Hintergrund jeweils dampfen. Das
          ist ganz wichtig!"

          Die Grenze lag bei tiefe 0,45 und traf damit nur drei Stücke. Jetzt
          0,62: sechs der neun dampfen — alle, die vorne genug fliegen, um es
          zu zeigen. Weiter hinten bleibt es aus, und das ist kein Sparen: bei
          14 % Breite und 2 px Unschärfe ist eine Dampfwolke kein Dampf mehr,
          sondern ein Fleck über einem Fleck.

          Die Dichte ist dafür von 4 auf 3 Schwaden gesunken — als Vorsorge,
          nicht auf Messung gestützt. Sechs Leinwände statt drei sind doppelt
          so viel Rechenarbeit; drei Schwaden auf sechs Stücken ergeben 18
          statt 12 Wolken, also MEHR sichtbaren Dampf bei anderthalbfacher
          statt doppelter Last.

          Belegen liess sich das am 08.09. nicht: die Maschine lief mit einer
          Lastzahl von 21, und die Frame-Messungen stiegen von Lauf zu Lauf
          (20,8 → 27,4 → 29,2 ms Median), ohne dass sich der Code änderte. Wer
          das nachmessen will, muss es auf einer ruhigen Maschine tun.

          Die Wiederholungen ganz hinten (`nurBreit`) tragen ohnehin
          `dampft: false` — zweimal dasselbe Gericht mit zweimal derselben
          Wolke wäre die Wiederholung, die die Tiefe gerade verbirgt. */}
      {g.dampft && breit && g.tiefe < 0.62 ? (
        <Dampf ton="ofen" klasse="gebaeck__dampf" dichte={3} />
      ) : null}
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
        {/* ═══ Das Mehlfoto ist raus ═══

            Karol am 02.09.: „mach da bitte auch die Körner, also kein
            Mehl-Hintergrund, nur noch Körner."

            Es war ein Foto unter einer Folie, und dieselbe Regel gilt hier wie
            damals beim Ladenfoto im Bestellen: ein Foto unter einer Folie
            bleibt ein Foto. Es zeigte dieselbe Mehlfläche, von der Schritt 01
            im Text spricht — die Sache also zweimal, einmal als Bild und
            einmal als Satz.

            Die Saat stellt nichts dar und stört deshalb nicht. Damit trägt
            jede orange Sektion der Seite denselben Grund. */}
        <Untergrund ton="glut" muster="saat" />
        <div className="schale prozess__buehne">
          <Kopf
            id="prozess-titel"
            etikett="Rollen, belegen, in den heissen Ofen"
            titel="Alles entsteht vor deinen Augen"
            klasse="prozess__kopf"
          />

          <Ofenwand />
        </div>

        {/* Der Schwarm liegt jetzt auf SEKTIONSEBENE, nicht mehr in der linken
            Spalte. Dort war er auf deren Breite beschränkt und konnte nie gross
            werden — Karol: „aber schon grösser machen als aktuell". Jetzt
            fliegen die Gerichte über die ganze Sektion, von unten nach oben,
            und ziehen hinter dem Text vorbei. */}
        <div className="schwarm">
          <Schwarm />
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
