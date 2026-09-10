import galerieRoh from '../../inhalt/galerie.json'
import produktRoh from '../../inhalt/produktgalerie.json'
import { pfad } from '../pfad.ts'
import { useZiehband } from '../ziehen.ts'
import { Kopf, Sektion } from './ui/bausteine.tsx'
import Untergrund from './ui/Untergrund.tsx'

type Bild = { nr: number; titel: string; lage: 'hoch' | 'quer'; breite: number; hoehe: number }
const BILDER = galerieRoh as Bild[]

/**
 * ═══ Die zweite Arkade: nur Produkte ═══
 *
 * Karol am 10.09.: „eine Galerie wäre auch, glaube ich, krass: nur mit
 * Produktbildern … so wie bei der Speisekarte, von links nach rechts … und
 * trotzdem können die Speisekarten neben den Produkten bleiben."
 *
 * Der Unterschied zur ersten ist nicht die Form, sondern der INHALT. Die erste
 * zeigt den Betrieb — Bleche, Ofen, die Brüder, ein gedeckter Tisch. Sie
 * beantwortet „wie ist es da". Diese hier zeigt je EIN Gericht, freigestellt
 * vom Rest, und beantwortet „was bekomme ich". Zwei Fragen, zwei Bänder.
 *
 * Sie liest dieselben Dateien wie die Speisekarte (`/bilder/karte/`). Eigene
 * Ausgaben davon waeren anderthalb Megabyte fuer dasselbe Bild.
 */
type Produkt = { datei: string; titel: string; nr: number | null; breite: number; hoehe: number }
const PRODUKTE = produktRoh as Produkt[]

/**
 * Die Galerie — eine Arkade, die der Besucher selbst bewegt.
 *
 * ═══ Die Form: ein waagerechtes Band aus Rundbögen ═══
 *
 * Karol, viermal in Folge unzufrieden: „Will einen ganz anderen Ansatz, von
 * links nach rechts … die Bilder sollen thematisch umrahmt sein, irgendwie in
 * arabischer Rahmen-UI."
 *
 * Zwei Vorfassungen sind gescheitert, beide aus demselben Grund: sie waren
 * SENKRECHT. Erst zwei Spuren, die von unten nach oben flogen, dann ein
 * überlappender Stapel — beide Male scrollte man an Bildern vorbei, statt
 * durch sie hindurchzugehen. MOUTHWASH Studio (Mobbin) führt stattdessen ein
 * waagerechtes Band quer durchs Bild: alle Bilder auf einer Höhe, gleiche
 * Grösse, ruhig, in Leserichtung.
 *
 * Der Rahmen ist ein RUNDBOGEN und kein Ornament. „Arabische Rahmen-UI"
 * liesse sich mit Maschrabiyya-Gittern bedienen — von der Stange und ohne
 * Bezug zu Aram. Ihr Ofen IST ein Bogen, auf Galeriefoto 09 und 12 deutlich zu
 * sehen, und eine Reihe von Rundbögen ist genau das, was eine Arkade ist: die
 * Grundform jedes Basars. Der Rahmen kommt damit aus ihrem Laden, nicht aus
 * einem Musterbuch.
 *
 * Alle Bögen sind GLEICH hoch. Hier standen sieben Höhen im Wechsel, als
 * Rhythmus gedacht; eine Arkade besteht aber definitionsgemäss aus gleichen
 * Bögen. Der Rhythmus kommt aus den sieben Motiven dahinter.
 *
 * ═══ Die Bewegung: die Hand, nicht der Scroll ═══
 *
 * Karol am 26.08.: „Man soll die Bögen selber mit der Maus nach links oder
 * rechts bewegen und nicht durch einfaches Runterscrollen. Sonst kann es
 * passieren, dass Kunden nicht jedes Bild am Ende genießen können."
 *
 * Vorher wanderte das Band mit dem Scrollstand nach links — ein Effekt, der
 * gut aussieht und die Sektion um ihre Aufgabe bringt: wer zügig scrollt,
 * bekommt die letzten Bilder nie zu sehen, und wer eines länger ansehen will,
 * kann es nicht. Eine Galerie ist eine Pause in der Seite, und eine Pause
 * lässt sich nicht an den Scroll hängen.
 *
 * Jetzt ist es ein echter waagerechter Überlauf: ziehen mit der Maus, wischen
 * am Finger, Pfeiltasten, zwei Knöpfe. Die Mechanik steht in src/ziehen.ts.
 * Der senkrechte Scroll bleibt, was er überall sonst ist — er scrollt die
 * Seite weiter.
 */

function Bogen({ quelle, klein, titel, i, echo }: {
  quelle: string; klein: string; titel: string; i: number; echo?: boolean
}) {
  return (
    /* Die zweite Fassung ist nur da, damit das Band umlaufen kann. Fuer ein
       Vorleseprogramm waeren vierzehn Bilder statt sieben schlicht falsch. */
    <li className="bogen" aria-hidden={echo || undefined}>
      <div className="bogen__rahmen">
        <img
          /* Über `pfad` und nicht als blosse Zeichenkette — siehe src/pfad.ts.
             Genau hier ging es unter einem Unterpfad kaputt. */
          src={pfad(quelle)}
          srcSet={`${pfad(klein)} 520w, ${pfad(quelle)} 900w`}
          sizes="(max-width: 719px) 62vw, 26vw"
          alt={titel}
          loading={!echo && i < 3 ? 'eager' : 'lazy'}
          decoding="async"
        />
      </div>
      {/* Die Bildzeile steht wieder da — anders als beim Stapel. Dort war sie
          falsch, weil ein Stapel Abzüge keine Beschriftung hat; unter einem
          Bogen in einer Arkade ist sie eine Tafel, und die gehört dorthin. */}
      <p className="bogen__wort">{titel}</p>
    </li>
  )
}

type BandBild = { quelle: string; klein: string; titel: string; schluessel: string }

/**
 * Ein Band aus Bogen. Kopf und Inhalt kommen von aussen; die Mechanik —
 * Ziehen, Schweben, Umlaufen, Pfeiltasten — ist fuer beide dieselbe.
 */
function Arkade({ id, etikett, titel, lead, hinweis, bilder, quer }: {
  id: string; etikett: string; titel: string; lead: string; hinweis: string
  bilder: BandBild[]
  /** Bögen im Querformat statt hochkant — für Gebäcke, die länger als hoch sind. */
  quer?: boolean
}) {
  const { ref: bahn, stand, schieben } = useZiehband<HTMLDivElement>(true, bilder.length)

  return (
    <Sektion id={id} grund="nacht" klasse={`galerie${quer ? ' galerie--quer' : ''}`} beschriftetVon={`${id}-titel`}>
      {/* ═══ Die Überschrift stand AUSSERHALB der Schale ═══
          Karol am 26.08.: „Überschrift muss weiter rechts formatiert."
          Sie klebte am Fensterrand — als einzige Überschrift der Seite. Jede
          andere Sektion legt ihren Kopf in `.schale`; beim Umbau der Galerie
          auf die Arkade ist der Wrapper verlorengegangen. */}
      {/* Auf Schwarz braucht die Folie MEHR Deckung: eine helle Struktur
          auf dunklem Grund schlägt stärker durch als umgekehrt. */}
      <Untergrund ton="nacht" muster="saat" />

      <div className="schale">
        <Kopf id={`${id}-titel`} etikett={etikett} titel={titel} lead={lead} />
      </div>

      {/* ═══ Warum der Hinweis dasteht ═══
          Ein Band, das man ziehen kann, sieht aus wie ein Band, das man nicht
          ziehen kann. Der Zeiger verrät es erst, wenn man schon darüber ist —
          und wer es nicht ausprobiert, sieht vier von sieben Bildern. Ein Satz
          und zwei Pfeile kosten eine Zeile und lösen genau das. */}
      <div className="schale galerie__leiste">
        <p className="galerie__hinweis">{hinweis}</p>
        <div className="galerie__pfeile">
          <button
            type="button"
            className="galerie__pfeil"
            onClick={() => schieben(-1)}
            disabled={!stand.links}
          >
            <span aria-hidden="true">←</span>
            <span className="visuell-versteckt">Ein Bild zurück</span>
          </button>
          <button
            type="button"
            className="galerie__pfeil"
            onClick={() => schieben(1)}
            disabled={!stand.rechts}
          >
            <span aria-hidden="true">→</span>
            <span className="visuell-versteckt">Ein Bild weiter</span>
          </button>
        </div>
      </div>

      {/* `tabIndex` und ein Name machen aus dem Überlauf einen Bereich, den
          die Tabulatortaste erreicht und die Pfeiltasten bewegen. Das ist kein
          Zusatz, sondern die Bedingung dafür, dass ein waagerechter Überlauf
          überhaupt ohne Maus bedienbar ist — der Browser bringt es mit, sobald
          das Element fokussierbar ist und einen Namen hat. */}
      <div
        className="galerie__fahrt"
        ref={bahn}
        tabIndex={0}
        role="group"
        aria-label={`${titel}, ${bilder.length} Bilder, mit den Pfeiltasten bewegen`}
      >
        {/* Eine echte Liste in Leserichtung. Für ein Vorleseprogramm ist der
            Unterschied, ob es „Liste mit sieben Einträgen" ansagt oder gar
            nichts. */}
        {/* ═══ Zweimal dieselbe Reihe ═══
            Damit das Band umlaufen kann, ohne dass man den Sprung sieht:
            sobald es um genau eine Reihenbreite gewandert ist, steht dort
            wieder dasselbe Bild. Die zweite Fassung ist fuer
            Vorleseprogramme versteckt — siehe `aria-hidden` am Bogen. */}
        <ul className="galerie__arkade">
          {bilder.map((b, i) => (
            <Bogen key={b.schluessel} quelle={b.quelle} klein={b.klein} titel={b.titel} i={i} />
          ))}
          {bilder.map((b, i) => (
            <Bogen key={`echo-${b.schluessel}`} quelle={b.quelle} klein={b.klein} titel={b.titel} i={i} echo />
          ))}
        </ul>
      </div>
    </Sektion>
  )
}

export default function Galerie() {
  const ausDemLaden: BandBild[] = BILDER.map((b) => {
    const nr = String(b.nr).padStart(2, '0')
    return { quelle: `bilder/galerie/${nr}.webp`, klein: `bilder/galerie/${nr}-klein.webp`,
             titel: b.titel, schluessel: nr }
  })
  return (
    <Arkade
      id="galerie"
      etikett="Aus dem Laden"
      titel="Was an einem Morgen entsteht"
      lead="Vom Blech über die Glut auf den Tisch."
      hinweis={`Es läuft von allein. Zeiger drauf hält an — oder ziehen. Es sind ${ausDemLaden.length}.`}
      bilder={ausDemLaden}
    />
  )
}

export function Produktgalerie() {
  const produkte: BandBild[] = PRODUKTE.map((p) => ({
    quelle: `bilder/karte/${p.datei}.webp`,
    klein: `bilder/karte/${p.datei}-klein.webp`,
    /* Die Nummer steht mit dabei, weil Gaeste am Telefon die Nummer nennen —
       dieselbe Ueberlegung wie in der Speisekarte. */
    titel: p.nr != null ? `${p.nr} · ${p.titel}` : p.titel,
    schluessel: p.datei,
  }))
  return (
    <Arkade
      id="produkte"
      etikett="Einzeln angesehen"
      titel="Jedes Gebäck für sich"
      lead="Dieselben Aufnahmen wie in der Karte, nur gross genug zum Ansehen."
      hinweis={`Es läuft von allein. Zeiger drauf hält an — oder ziehen. Es sind ${produkte.length}.`}
      bilder={produkte}
      quer
    />
  )
}
