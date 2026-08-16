import { GEBAECKE } from '../gebaecke.ts'
import { Bild, Datenzeile, Etikett, Kopf } from './ui/bausteine.tsx'

/**
 * Der Stilbogen — die Antwort auf „wie binden wir einen konsistenten Style
 * Guide ein".
 *
 * ═══ Warum ein Dokument nicht reicht ═══
 *
 * `DIRECTION.md` sagt, was gelten SOLL. `tokens.css` sagt, was gilt. Zwischen
 * beiden entsteht die Drift, und niemand sieht sie — weil man dafür sieben
 * Sektionen nebeneinanderhalten müsste, und das tut niemand.
 *
 * Diese Seite hält sie nebeneinander. Sie liest AUS DENSELBEN TOKENS wie die
 * echte Seite; es gibt hier keine einzige eigene Farbe und keine eigene Grösse.
 * Wer einen Wert ändert, sieht ihn hier sofort — und wer hier zwei Etiketten
 * sieht, die verschieden aussehen, hat den Fehler gefunden, bevor der Kunde ihn
 * findet.
 *
 * Erreichbar unter /stil.html, nicht verlinkt. Sie gehört zur Werkstatt, nicht
 * zur Seite.
 *
 * ═══ Und sie zeigt keine NACHBILDUNG ═══
 *
 * Jedes Bauteil hier ist dasselbe `<Kopf>`, dasselbe `<Etikett>`, dieselbe
 * `<Datenzeile>`, die auch die Seite verwendet. Ein Stilbogen, der seine
 * Beispiele selbst nachbaut, driftet von dem ab, was er beschreibt — und dann
 * ist er schlimmer als keiner, weil man ihm glaubt.
 */

const FARBEN = [
  ['--papier', 'Hellste Fläche. Die Speisekarte.'],
  ['--creme', 'Grund. Teig, Mehl, Sonne auf Holz.'],
  ['--creme-tief', 'Zweite Fläche, Sektionswechsel.'],
  ['--glut', 'IHR Orange. NUR Fläche, nie Text.'],
  ['--terra', 'DAS Signal. Nie Fläche.'],
  ['--russ', 'Tinte. 11,93 auf Creme, AAA.'],
  ['--russ-mtl', 'Sekundärtext. 5,74 auf Creme, AA.'],
  ['--tinte-glut', 'Nur auf Glut. 4,73, AA.'],
  ['--linie', 'Haarlinien, immer 1px.'],
]

const GROESSEN = [
  ['--text-hero', 'Schlagzeile'],
  ['--text-band', 'Das Band'],
  ['--text-sektion', 'Sektion'],
  ['--text-gericht', 'Gericht'],
  ['--text-lead', 'Vorspann'],
  ['--text-base', 'Fliesstext'],
  ['--text-meta', 'Neben'],
  ['--text-micro', 'Etikett'],
]

export default function Stilbogen() {
  return (
    <main className="stil">
      <div className="schale">
        <header className="stil__kopf">
          <Etikett>Stilbogen · nicht Teil der Seite</Etikett>
          <h1 className="lebt">Woraus Aram gebaut ist</h1>
          <p className="lead">
            Jeder Wert kommt aus <code>src/stile/tokens.css</code>, jedes Bauteil aus{' '}
            <code>src/komponenten/ui/bausteine.tsx</code> — denselben Dateien, aus denen die
            Seite besteht. Sieht hier etwas falsch aus, ist es auf der Seite auch falsch.
          </p>
        </header>

        <section className="stil__block">
          <h2 className="lebt">Farbe</h2>
          <ul className="stil__farben">
            {FARBEN.map(([wert, zweck]) => (
              <li key={wert}>
                <span className="stil__fleck" style={{ background: `var(${wert})` }} />
                <code>{wert}</code>
                <span className="leise">{zweck}</span>
              </li>
            ))}
          </ul>
          <p className="stil__regel">
            <strong>Die Regel, die am häufigsten gebrochen wird:</strong> <code>--glut</code> ist
            eine Fläche und trägt <em>immer</em> <code>--tinte-glut</code>. Niemals als Text,
            niemals als Linie, niemals mit heller Schrift darauf.
          </p>
        </section>

        <section className="stil__block">
          <h2 className="lebt">Schrift</h2>
          {GROESSEN.map(([wert, name]) => (
            <p
              key={wert}
              className="stil__zeile"
              style={{ fontSize: `var(${wert})`, fontFamily: 'var(--font-display)' }}
            >
              {name} <code className="stil__code">{wert}</code>
            </p>
          ))}
          <p className="stil__regel">
            Display ist <strong>Fraunces</strong> mit hohem <code>SOFT</code> — die fette,
            gerundete Form ihres Logos. Fliesstext ist <strong>Archivo</strong>. Zwei Familien,
            und dabei bleibt es.
          </p>
        </section>

        <section className="stil__block">
          <h2 className="lebt">Die Bauteile</h2>
          <p className="leise stil__hinweis">
            Alles hierunter ist derselbe Code wie auf der Seite — kein Nachbau.
          </p>

          <Kopf
            id="stil-kopfbeispiel"
            etikett="So sieht ein Sektionskopf aus"
            titel="Überschrift mit Achsen-Hover"
            lead="Und der Vorspann darunter. Etikett, Überschrift, Vorspann — immer in dieser Reihenfolge, immer mit denselben Abständen."
          />

          <dl className="stil__daten">
            <Datenzeile was="Datenzeile">Etikett links, Wert rechts, gepunktete Linie oben.</Datenzeile>
            <Datenzeile was="Noch eine">
              <span className="luecke">So sieht eine Lücke aus</span>
            </Datenzeile>
          </dl>

          <div className="stil__knoepfe">
            <span className="knopf">Anrufen</span>
            <span className="knopf knopf--glut">Per WhatsApp</span>
            <span className="knopf knopf--leise">Leise</span>
            <span className="knopf" aria-disabled="true">
              Noch nicht bestätigt
            </span>
          </div>
        </section>

        <section className="stil__block">
          <h2 className="lebt">Was echt ist und was nicht</h2>
          <ul className="stil__gerichte">
            {GEBAECKE.map((g) => (
              <li key={g.id}>
                <Bild quelle={g.bilder[0]} alt="" breite={g.breite} hoehe={g.hoehe} />
                <p className="stil__name">{g.name}</p>
                <p className={g.echt ? 'stil__echt' : 'stil__erzeugt'}>
                  {g.echt ? 'ihr Foto' : 'erzeugt'} · {g.bilder.length}{' '}
                  {g.bilder.length === 1 ? 'Ansicht' : 'Ansichten'}
                </p>
              </li>
            ))}
          </ul>
          <p className="stil__regel">
            Sieben von acht sind erzeugt. Sobald die echten Aufnahmen da sind, wird
            <code> public/bilder/erzeugt/ </code> gelöscht, nicht ergänzt.
          </p>
        </section>
      </div>
    </main>
  )
}
