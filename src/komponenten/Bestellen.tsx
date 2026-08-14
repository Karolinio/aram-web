import Sektion from './ui/Sektion.tsx'
import { ARAM } from '../aram.config.ts'

/**
 * Sektion 6 — Bestellen.
 *
 * ═══ Warum die Lieferdienste als VORSCHAU dastehen ═══
 *
 * Am 14.08.2026 ist nicht bekannt, ob Aram bei Lieferando, Uber Eats oder Wolt ist —
 * die Frage steht in der WhatsApp-Nachricht an den Inhaber. Solange die Antwort fehlt,
 * sind die Kacheln sichtbar aber NICHT anklickbar, mit einem ehrlichen Hinweis darauf.
 *
 * Ein Bestellknopf, der ins Leere führt, kostet keine Klicks — er kostet Bestellungen.
 * Und ein Logo, das behauptet „wir sind bei Lieferando", obwohl es nicht stimmt, ist
 * eine Falschangabe über einen Betrieb.
 *
 * Der Weg, der HEUTE trägt, steht deshalb zuerst und gross: anrufen und WhatsApp.
 * Beides funktioniert seit Jahren, beides kostet keine Provision.
 *
 * ═══ Der Satz, der Karol beim Inhaber helfen wird ═══
 *
 * Lieferando nimmt je nach Modell grob 13 bis um die 30 Prozent. Eine eigene
 * Bestellstrecke kostet Zahlungsgebühren im niedrigen einstelligen Bereich. Deshalb
 * ist die Reihenfolge auf dieser Seite kein Zufall: der eigene Weg steht oben.
 */

type Dienst = { name: string; schluessel: 'lieferando' | 'uberEats' | 'wolt'; farbe: string }

const DIENSTE: Dienst[] = [
  { name: 'Lieferando', schluessel: 'lieferando', farbe: 'oklch(62% 0.19 35)' },
  { name: 'Uber Eats', schluessel: 'uberEats', farbe: 'oklch(72% 0.17 150)' },
  { name: 'Wolt', schluessel: 'wolt', farbe: 'oklch(70% 0.13 230)' },
]

export default function Bestellen() {
  const b = ARAM.bestellen
  const irgendeinerAktiv = DIENSTE.some((d) => b[d.schluessel].aktiv)

  return (
    <Sektion id="bestellen" className="bestellen" aria-labelledby="bestellen-titel">
      <div className="schale">
        <header className="bestellen__kopf">
          <p className="augenbraue">Bestellen</p>
          <h2 id="bestellen-titel">
            Ruf an. Wir backen,
            <br />
            während du kommst.
          </h2>
          <p className="lead leise">
            Alles wird erst belegt, wenn du bestellst. Deshalb dauert es ein paar Minuten —
            und deshalb schmeckt es.
          </p>
        </header>

        {/* Der Weg, der heute traegt. Gross, zuerst, ohne Provision. */}
        <div className="bestellen__direkt">
          <a className="glas bestellen__kachel bestellen__kachel--gross" href={ARAM.kontakt.telefonHref}>
            <span className="augenbraue">Am schnellsten</span>
            <strong className="bestellen__gross hebt-mit">{ARAM.kontakt.telefon}</strong>
            <span className="leise">Anrufen und sagen, was du möchtest.</span>
          </a>

          <a
            className="glas bestellen__kachel"
            href={ARAM.kontakt.whatsapp}
            target="_blank"
            rel="noreferrer noopener">
            <span className="augenbraue">Auch möglich</span>
            <strong className="bestellen__gross hebt-mit">WhatsApp</strong>
            <span className="leise">Schreib uns, wir melden uns zurück.</span>
          </a>
        </div>

        {/* Lieferdienste. Vorschau, solange nichts bestaetigt ist. */}
        <div className="bestellen__dienste">
          <p className="augenbraue">Lieferdienste</p>
          {!irgendeinerAktiv && (
            <p className="bestellen__vorschau">
              <span className="luecke">Vorschau</span>{' '}
              <span className="leise">
                Noch nicht bestätigt, ob Aram hier gelistet ist. Die Kacheln werden
                anklickbar, sobald die Adressen feststehen — vorher führen sie bewusst
                nirgendwohin.
              </span>
            </p>
          )}

          <ul className="bestellen__liste">
            {DIENSTE.map((d) => {
              const eintrag = b[d.schluessel]
              const aktiv = eintrag.aktiv && eintrag.url
              const Inhalt = (
                <>
                  <span className="bestellen__punkt" style={{ background: d.farbe }} aria-hidden="true" />
                  <span className="bestellen__dienstname hebt-mit">{d.name}</span>
                  <span className="leise bestellen__status">
                    {aktiv ? 'Zur Bestellung' : 'noch nicht bestätigt'}
                  </span>
                </>
              )
              return (
                <li key={d.schluessel}>
                  {aktiv ? (
                    <a
                      className="glas bestellen__dienst"
                      href={eintrag.url!}
                      target="_blank"
                      rel="noreferrer noopener">
                      {Inhalt}
                    </a>
                  ) : (
                    <div className="glas bestellen__dienst ist-inaktiv" aria-disabled="true">
                      {Inhalt}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </Sektion>
  )
}
