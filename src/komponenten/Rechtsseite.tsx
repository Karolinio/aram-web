import type { ReactNode } from 'react'

import { ARAM } from '../aram.config.ts'

/**
 * Die Hülle für Impressum und Datenschutz.
 *
 * ═══ Warum eigene Seiten und kein Aufklapper ═══
 *
 * Beides muss von jeder Seite aus mit höchstens zwei Klicks erreichbar und
 * einzeln verlinkbar sein. Ein Aufklapper im Fuss hat keine eigene Adresse —
 * eine Abmahnung zielt genau darauf.
 *
 * ═══ Warum sie ohne Bewegung auskommen ═══
 *
 * Keine Kamerafahrt, kein Auftritt, kein Dampf. Wer hier landet, sucht eine
 * Angabe und will sie sofort lesen. Alles, was diese Seiten von der Startseite
 * übernehmen, ist die Schrift und die zwei Gründe — sie sollen zum Laden
 * gehören, aber sie sind kein Schaufenster.
 */

type Props = {
  titel: string
  /** Steht klein über dem Titel. */
  etikett: string
  children: ReactNode
}

export default function Rechtsseite({ titel, etikett, children }: Props) {
  return (
    <>
      <header className="rechtskopf">
        <div className="schale rechtskopf__zeile">
          <a className="rechtskopf__zurueck" href="/">
            <span aria-hidden="true">←</span> Zurück zu {ARAM.name}
          </a>
          <a className="knopf knopf--leise rechtskopf__anruf" href={ARAM.kontakt.telefonHref}>
            <span aria-hidden="true">☎</span> {ARAM.kontakt.telefon}
          </a>
        </div>
      </header>

      <main className="rechtsseite">
        <div className="schale rechtsseite__satz">
          <span className="etikett">{etikett}</span>
          <h1>{titel}</h1>
          {children}
        </div>
      </main>
    </>
  )
}

/**
 * Ein Wert, der noch fehlt.
 *
 * Auf diesen beiden Seiten ist eine sichtbare Lücke keine Nachlässigkeit,
 * sondern die einzig zulässige Darstellung: ein Impressum mit erfundener
 * Anschrift ist schlimmer als gar keins, weil es die Pflicht als erfüllt
 * ausgibt. Die Startseite blockiert den Livegang, solange eine davon steht —
 * siehe `lueckenVorLive()` in aram.config.ts.
 */
export function Fehlt({ was }: { was: string }) {
  return <span className="luecke">{was} fehlt noch</span>
}
