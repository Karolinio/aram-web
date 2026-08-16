import type { ReactNode } from 'react'

import Auftritt from './Auftritt.tsx'

/**
 * Die Bausteine — der Stilbogen als CODE, nicht als Abbildung.
 *
 * ═══ Warum diese Datei existiert ═══
 *
 * Vorher gab es einen Stilbogen unter /stil.html, der zeigte, wie die Seite
 * aussehen SOLL. Die Seite selbst bestand weiter aus rund vierzig einmaligen
 * Klassen — `.karte__kopf`, `.laden__wort`, `.bestellen__wege`,
 * `.prozess__kopf` — die zufällig ähnlich aussahen. Ein Stilbogen daneben ist
 * ein Entwurf; er verhindert keine einzige Abweichung.
 *
 * Jetzt kommt jede Sektion aus DIESEN Bausteinen. Wer den Abstand über einer
 * Überschrift ändern will, ändert ihn hier — einmal, für alle sieben
 * Abschnitte. Und der Stilbogen zeigt nicht mehr eine Nachbildung, sondern
 * genau diese Bauteile.
 *
 * ═══ Die Regel für neue Sektionen ═══
 *
 * Eine neue Sektion darf eigene Klassen für ihre BESONDERHEIT haben — der
 * Schwarm, die klebende Spur, der Allergenfilter. Alles, was mehr als eine
 * Sektion betrifft (Grund, Innenabstand, Etikett, Überschrift, Vorspann,
 * Bildunterschrift, Datenzeile), kommt aus dieser Datei. Wer hier
 * vorbeibaut, baut die Uneinheitlichkeit zurück, die er gerade beseitigt hat.
 */

/**
 * Auf welchem Grund eine Sektion steht. ZWEI, und mehr gibt es nicht.
 *
 * Vorher waren es vier — `papier` für die Karte, `creme` für Hero und Prozess,
 * `creme-tief` für Bestellen und Fuss, dazu ein vollflächiges Orangeband. Vier
 * Gründe auf sieben Abschnitten, und keiner davon war entschieden: jede
 * Sektion hatte ihren eigenen gewählt.
 *
 * Der Typ ist die Durchsetzung. Wer einen dritten Grund will, muss ihn hier
 * eintragen — und dabei merken, dass er einen dritten Grund will.
 *
 * ═══ Und genau das ist am 16.08. passiert ═══
 *
 * `glut` ist der dritte, und er ist eine AUSNAHME, kein dritter Regelfall:
 * ihr Orange als vollflächiger Grund für GENAU EINE Sektion. Er nimmt am
 * Wechsel zwischen Hell und Clay nicht teil, er unterbricht ihn.
 *
 * Zweimal ist Orange auf dieser Seite vorher gescheitert — als Band im Hero,
 * als Kachel im Bestellen. Nicht die Farbe war das Problem, sondern die Dosis:
 * ein kleines gesättigtes Feld auf ruhigem Grund liest als Imbissschild, eine
 * ganze Fläche als Entscheidung.
 *
 * Wer einen ZWEITEN Glutgrund einträgt, macht daraus wieder eine Grundfarbe
 * und nimmt der Ausnahme ihren Sinn.
 */
export type Grund = 'hell' | 'tief' | 'glut'

type SektionProps = {
  id?: string
  grund?: Grund
  /** Zieht die gepunktete Linie an die Oberkante. */
  kante?: boolean
  klasse?: string
  beschriftetVon?: string
  children: ReactNode
}

/**
 * Eine Sektion.
 *
 * Trägt Grund, Innenabstand und — wenn gewünscht — die gepunktete Kante. Diese
 * drei Dinge waren vorher in jeder Sektion einzeln gesetzt, und genau dort
 * entstand die Unruhe: `.karte` hatte eine Linie oben und unten, `.bestellen`
 * nur oben, `.laden` gar keine, und die Innenabstände unterschieden sich um
 * Beträge, die niemand entschieden hatte.
 */
export function Sektion({
  id,
  grund = 'hell',
  kante = false,
  klasse,
  beschriftetVon,
  children,
}: SektionProps) {
  const klassen = ['sektion', `sektion--${grund}`, kante ? 'sektion--kante' : '', klasse ?? '']
    .filter(Boolean)
    .join(' ')

  return (
    <section id={id} className={klassen} aria-labelledby={beschriftetVon}>
      {children}
    </section>
  )
}

/**
 * Das Etikett.
 *
 * Ein kurzer Strich, dann ein Wort. Es gibt genau diese eine Form — vorher
 * waren es fünf Varianten in vier Grössen und drei Farben.
 */
export function Etikett({ children, klasse }: { children: ReactNode; klasse?: string }) {
  return <span className={`etikett${klasse ? ' ' + klasse : ''}`}>{children}</span>
}

type KopfProps = {
  /** Wird zur `id` der Überschrift, damit `aria-labelledby` darauf zeigen kann. */
  id: string
  etikett: string
  titel: string
  /** Der Vorspann darunter. Optional — nicht jede Sektion braucht einen. */
  lead?: ReactNode
  klasse?: string
}

/**
 * Der Sektionskopf: Etikett, Überschrift, Vorspann.
 *
 * Immer in dieser Reihenfolge, immer mit denselben Abständen. Die Überschrift
 * trägt die Achsen-Animation (`lebt`) — auch das war vorher von Hand pro
 * Sektion gesetzt und deshalb einmal vergessen.
 */
export function Kopf({ id, etikett, titel, lead, klasse }: KopfProps) {
  return (
    <header className={`kopfblock${klasse ? ' ' + klasse : ''}`}>
      <Etikett>{etikett}</Etikett>
      {/* JEDE Sektionsüberschrift bekommt den Auftritt — automatisch, weil sie
          alle durch diesen Baustein gehen. Genau dafür gibt es ihn: eine
          Animation, die man pro Sektion von Hand setzen müsste, wird irgendwo
          vergessen, und dann ist sie keine Regel mehr, sondern ein Zufall. */}
      <h2 id={id} className="lebt">
        <Auftritt>{titel}</Auftritt>
      </h2>
      {lead && <p className="lead kopfblock__lead">{lead}</p>}
    </header>
  )
}

type BildProps = {
  quelle: string
  alt: string
  breite: number
  hoehe: number
  /** Bildunterschrift. Steht unter dem Bild, ausser `obenDrueber`. */
  unterschrift?: ReactNode
  /** Für Bilder, die nach unten aus ihrer Sektion herausragen. */
  obenDrueber?: boolean
  eilig?: boolean
  klasse?: string
}

/**
 * Ein Bild mit Unterschrift.
 *
 * Kein Rahmen, kein Schatten, kein Kasten — die Direktion lässt Bilder einfach
 * daliegen. Was hier vereinheitlicht wird, ist die Unterschrift: Grösse, Farbe,
 * Abstand und Textbreite waren vorher an drei Stellen verschieden.
 */
export function Bild({
  quelle,
  alt,
  breite,
  hoehe,
  unterschrift,
  obenDrueber = false,
  eilig = false,
  klasse,
}: BildProps) {
  return (
    <figure className={`bild${obenDrueber ? ' bild--umgedreht' : ''}${klasse ? ' ' + klasse : ''}`}>
      <img
        src={quelle}
        alt={alt}
        width={breite}
        height={hoehe}
        loading={eilig ? 'eager' : 'lazy'}
        decoding={eilig ? 'sync' : 'async'}
        {...(eilig ? { fetchPriority: 'high' as const } : {})}
      />
      {unterschrift && <figcaption>{unterschrift}</figcaption>}
    </figure>
  )
}

/**
 * Eine Datenzeile: Etikett links, Wert rechts, gepunktete Linie darüber.
 *
 * Bisher nur im Laden verwendet — steht trotzdem hier, weil Öffnungszeiten,
 * Anschrift und Kontakt beim nächsten Gastro-Kunden dieselbe Form brauchen.
 */
export function Datenzeile({ was, children }: { was: string; children: ReactNode }) {
  return (
    <div className="datenzeile">
      <dt>
        <Etikett>{was}</Etikett>
      </dt>
      <dd>{children}</dd>
    </div>
  )
}
