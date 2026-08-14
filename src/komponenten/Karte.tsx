import Sektion from './ui/Sektion.tsx'
import { inhalt } from '../inhalt.ts'

/**
 * Sektion 4 — Die Karte.
 *
 * Das meistbesuchte Element jeder Gastro-Seite. Deshalb bekommt es hier die grösste
 * handwerkliche Sorgfalt, obwohl es die flachste Sektion ist: Zahlenkolonne bündig,
 * Gerichtname gross, Preis klein und ruhig daneben — von der Speisekarte an der Wand
 * geklaut. Eine Seite, die den Preis grösser setzt als das Essen, verkauft Preise.
 *
 * ═══ Zwei Dinge, die hier NICHT erfunden werden ═══
 *
 * `preis: null` heisst: der Preis fehlt noch, und die Seite ZEIGT das. Ein erfundener
 * Preis auf einer Speisekarte ist keine Lücke, sondern eine Falschangabe — und der
 * Gast steht damit an der Theke.
 *
 * `allergene` ist Pflicht, sobald Preise online stehen (LMIV). Ein leeres Feld ist
 * hier ein Befund, kein Zustand — deshalb steht es sichtbar da und nicht im Fussnoten-
 * Kleingedruckten.
 *
 * Inhalt kommt aus `inhalt/speisekarte.json`, `ziel: inhalt.speisekarte`. Der Kunde
 * pflegt ihn selbst — genau deshalb, weil Preise sich ändern.
 */
export default function Karte() {
  const gruppen = inhalt.speisekarte
  const offen = gruppen.flatMap((g) => g.gerichte).filter((g) => g.preis === null).length

  return (
    <Sektion id="karte" className="karte" aria-labelledby="karte-titel">
      <div className="schale">
        <header className="karte__kopf">
          <p className="augenbraue">Speisekarte</p>
          <h2 id="karte-titel">Was heute im Ofen ist.</h2>
          {offen > 0 && (
            <p className="karte__offen">
              <span className="luecke">{offen} Preise fehlen noch</span>{' '}
              <span className="leise">
                — kommen von Aram, sobald das Foto der Karte da ist.
              </span>
            </p>
          )}
        </header>

        <div className="karte__gruppen">
          {gruppen.map((g) => (
            <section key={g.gruppe} className="karte__gruppe" aria-label={g.gruppe}>
              <div className="karte__gruppenkopf">
                <h3>{g.gruppe}</h3>
                <p className="leise karte__gruppenhinweis">{g.hinweis}</p>
              </div>

              <ul className="karte__liste">
                {g.gerichte.map((gericht) => (
                  <li key={gericht.name} className="karte__zeile">
                    <div className="karte__wort">
                      <span className="karte__gericht">{gericht.name}</span>
                      <span className="leise karte__beschreibung">{gericht.beschreibung}</span>
                      {gericht.allergene.length > 0 && (
                        <span className="karte__allergene">
                          Enthält: {gericht.allergene.join(' · ')}
                        </span>
                      )}
                    </div>
                    <span className="karte__punkte" aria-hidden="true" />
                    {gericht.preis === null ? (
                      <span className="luecke karte__preis">?</span>
                    ) : (
                      <span className="preis karte__preis">
                        {gericht.preis.toFixed(2).replace('.', ',')} €
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="leise karte__fuss">
          Alle Angaben zu Allergenen sind Pflichtangaben nach der
          Lebensmittelinformations-Verordnung. Bei Fragen zu Zusatzstoffen fragt bitte
          im Laden — wir sagen euch genau, was drin ist.
        </p>
      </div>
    </Sektion>
  )
}
