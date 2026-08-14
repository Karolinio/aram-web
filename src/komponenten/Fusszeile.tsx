import { ARAM, lueckenVorLive } from '../aram.config.ts'

/**
 * Fuß und Recht.
 *
 * Das Impressum steht am 14.08.2026 noch nicht fest — Rechtsform, ladungsfähige
 * Anschrift und Steuernummer fehlen. Sie stehen hier als sichtbare Lücke, und der
 * Fuß sagt ausdrücklich, dass die Seite in diesem Zustand nicht online gehen darf.
 *
 * Das ist Absicht: ein Impressum mit erfundenen Angaben ist kein Platzhalter, sondern
 * ein Abmahngrund. Und ein leerer Impressumslink ist einer, den niemand bemerkt,
 * bevor die Post kommt.
 */
export default function Fusszeile() {
  const offen = lueckenVorLive()

  return (
    <footer className="fuss">
      <div className="schale">
        {offen.length > 0 && (
          <div className="fuss__warnung glas" role="note">
            <p className="augenbraue">Noch nicht live-fähig</p>
            <p>
              Es fehlen: <strong>{offen.join(' · ')}</strong>
            </p>
            <p className="leise">
              Solange etwas davon fehlt, geht diese Seite nicht online. Ein Impressum mit
              erfundenen Angaben ist kein Platzhalter, sondern ein Abmahngrund.
              Dieser Kasten verschwindet von selbst, sobald die Werte in
              <code> src/aram.config.ts </code> stehen.
            </p>
          </div>
        )}

        <div className="fuss__reihe">
          <div>
            <p className="fuss__marke">{ARAM.name}</p>
            <p className="leise">{ARAM.langname}</p>
          </div>

          <nav className="fuss__nav" aria-label="Rechtliches">
            <a href="/impressum.html">Impressum</a>
            <a href="/datenschutz.html">Datenschutz</a>
          </nav>

          <div className="fuss__kontakt">
            <a href={ARAM.kontakt.telefonHref}>{ARAM.kontakt.telefon}</a>
            <a href={ARAM.kontakt.whatsapp} target="_blank" rel="noreferrer noopener">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
