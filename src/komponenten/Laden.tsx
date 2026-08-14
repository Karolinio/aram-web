import Sektion from './ui/Sektion.tsx'
import Gericht from './ui/Gericht.tsx'
import { slot } from '../gerichte.ts'
import { ARAM } from '../aram.config.ts'

/**
 * Sektion 5 — Der Laden.
 *
 * Die Vertrauens-Sektion, und deshalb kurz. Wer wir sind, wo wir sind, wann wir da
 * sind. Das Foto der Ladenfront ist das einzige rechteckige Bild neben dem Ofen —
 * es ist der Beweis, dass es den Laden gibt, und darf deshalb nie erzeugt werden.
 *
 * Adresse und Zeiten fehlen am 14.08.2026 noch. Sie stehen als sichtbare Lücke da.
 * Eine erfundene Öffnungszeit ist kein Platzhalter, sondern ein Gast, der vor einer
 * verschlossenen Tür steht.
 */
export default function Laden() {
  const front = slot('laden-aussen')!

  return (
    <Sektion id="laden" className="laden" aria-labelledby="laden-titel">
      {(f) => (
        <div className="schale laden__gitter">
          <div className="laden__bild">
            <Gericht slot={front} fortschritt={f} />
          </div>

          <div className="laden__wort">
            <p className="augenbraue">Der Laden</p>
            <h2 id="laden-titel">Ein kleiner Laden mit großem Geschmack.</h2>

            <p className="lead">
              Geführt wird er vom Inhaber und seinen Brüdern. Bei Aram dreht sich alles um
              ehrliches, handgemachtes Essen — und darum, dass du dabei zusehen kannst.
            </p>

            <dl className="laden__fakten">
              <div>
                <dt>Wo</dt>
                <dd>
                  {ARAM.ort.strasse ? (
                    <>
                      {ARAM.ort.strasse}
                      <br />
                      {ARAM.ort.plz} {ARAM.ort.stadt}
                    </>
                  ) : (
                    <>
                      <span className="luecke">Anschrift fehlt</span>
                      <br />
                      <span className="leise">{ARAM.ort.stadt}</span>
                    </>
                  )}
                </dd>
              </div>

              <div>
                <dt>Wann</dt>
                <dd>
                  {ARAM.zeiten ? (
                    <ul className="laden__zeiten">
                      {ARAM.zeiten.map((z) => (
                        <li key={z.tag}>
                          <span>{z.tag}</span>
                          <span className="preis">
                            {z.von} – {z.bis}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="luecke">Öffnungszeiten fehlen</span>
                  )}
                </dd>
              </div>

              <div>
                <dt>Telefon</dt>
                <dd>
                  <a href={ARAM.kontakt.telefonHref}>{ARAM.kontakt.telefon}</a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </Sektion>
  )
}
