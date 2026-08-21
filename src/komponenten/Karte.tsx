import { useMemo, useState } from 'react'

import { inhalt, type Gericht } from '../inhalt.ts'
import { anzahlVon, minus, plus } from '../bestellung.ts'
import { useBestellung } from '../useBestellung.ts'
import { Kopf, Sektion } from './ui/bausteine.tsx'
import Collage from './ui/Collage.tsx'

/**
 * Die Speisekarte — ein Werkzeug, kein Aushang.
 *
 * ═══ Warum der Allergenfilter hier steht und nicht in einer Fussnote ═══
 *
 * Allergene sind Pflicht, sobald Preise online stehen (LMIV) — der häufigste
 * Grund, warum Gastro-Seiten Post vom Ordnungsamt bekommen. Diese Seite macht
 * aus der Pflichtangabe einen Vorteil: für jemanden mit Nussallergie ist der
 * Filter der Grund, hier zu bestellen statt woanders.
 *
 * Kein Dialogfenster, kein Aufklappen. Die Karte bleibt stehen und wird kürzer.
 *
 * ═══ Jedes Gericht hat eine eigene Adresse ═══
 *
 * `#kaeseschiffchen` als Anker, mit `scroll-margin-top`, damit es unter der
 * Kopfzeile nicht abgeschnitten steht. Wer den Link in WhatsApp schickt, landet
 * auf dem Gericht und nicht auf dem Seitenanfang.
 */

/** So werden die Filterknöpfe sortiert. Was nicht vorkommt, wird nicht angeboten. */
const REIHENFOLGE = ['Gluten', 'Milch', 'Ei', 'Sesam', 'Nüsse', 'Soja', 'Senf']

/** "Fatayer mit Käse" → "fatayer-mit-kaese". Wird zur Adresse des Gerichts. */
export const kennung = (name: string): string =>
  name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export default function Karte() {
  const [versteckt, setVersteckt] = useState<string[]>([])
  useBestellung() /* neu rendern, sobald sich die Auswahl ändert */

  /* Nur Allergene anbieten, die auf dieser Karte wirklich vorkommen. Ein Knopf
     „Nüsse", der nichts ausblendet, weil kein Gericht Nüsse enthält, sieht aus
     wie ein kaputter Filter. */
  const allergene = useMemo(() => {
    const alle = new Set(inhalt.speisekarte.flatMap((g) => g.gerichte).flatMap((g) => g.allergene))
    return [...alle].sort((a, b) => {
      const ia = REIHENFOLGE.indexOf(a)
      const ib = REIHENFOLGE.indexOf(b)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })
  }, [])

  const zeigt = (g: Gericht) => !g.allergene.some((a) => versteckt.includes(a))

  const gruppen = inhalt.speisekarte
    .map((gr) => ({ ...gr, gerichte: gr.gerichte.filter(zeigt) }))
    .filter((gr) => gr.gerichte.length > 0)

  const gesamt = inhalt.speisekarte.reduce((s, g) => s + g.gerichte.length, 0)
  const sichtbar = gruppen.reduce((s, g) => s + g.gerichte.length, 0)
  const ohnePreis = inhalt.speisekarte
    .flatMap((g) => g.gerichte)
    .filter((g) => g.preis === null).length

  const umschalten = (a: string) =>
    setVersteckt((v) => (v.includes(a) ? v.filter((x) => x !== a) : [...v, a]))

  return (
    <Sektion id="karte" grund="hell" kante klasse="karte" beschriftetVon="karte-titel">
      {/* Ihre Gerichte blass im Grund — damit die Fläche hinter der Karte etwas
          trägt, ohne dass man beim Lesen darüber stolpert. */}
      <Collage />
      <div className="schale">
        {/* Überschrift links, Allergenfilter rechts. Vorher stand der Filter
            UNTER dem Kopf, und die rechte Hälfte des Bildschirms blieb über
            eine halbe Bildschirmhöhe leer. Ein Werkzeug gehört neben das, was
            es bedient. */}
        <div className="karte__kopfzeile">
        <Kopf
          id="karte-titel"
          etikett="Speisekarte"
          titel="Was es gibt"
          lead={
            ohnePreis > 0 ? (
              <>
                <span className="luecke">Die Preise tragen wir nach</span> — sie liegen uns
                noch nicht vor. Am Telefon nennen wir sie dir sofort.
              </>
            ) : (
              <>
                Zweiundzwanzig Sorten, jede von Hand gerollt. Die Nummer vor dem Namen ist
                dieselbe wie auf unserer Karte im Laden.
              </>
            )
          }
        />

        <div className="filter">
          <p className="filter__titel" id="filter-titel">
            Enthält etwas, das du nicht verträgst? Tipp es an — dann verschwindet es.
          </p>
          <div className="filter__knoepfe" role="group" aria-labelledby="filter-titel">
            {allergene.map((a) => (
              <button
                key={a}
                type="button"
                className="filter__knopf"
                aria-pressed={versteckt.includes(a)}
                onClick={() => umschalten(a)}
              >
                {versteckt.includes(a) ? 'ohne ' : ''}
                {a}
              </button>
            ))}
            {versteckt.length > 0 && (
              <button
                type="button"
                className="filter__zuruecksetzen"
                onClick={() => setVersteckt([])}
              >
                Alles wieder zeigen
              </button>
            )}
          </div>
          {/* Live gemeldet, damit auch ohne Blick auf die Liste klar ist, was der
              Knopf getan hat. Ein Filter, dessen Wirkung man nicht hört, ist für
              einen Screenreader ein Knopf ohne Funktion. */}
          <p className="filter__stand" role="status">
            {versteckt.length === 0
              ? `${gesamt} Gerichte`
              : `${sichtbar} von ${gesamt} Gerichten · ausgeblendet: ${versteckt.join(', ')}`}
          </p>
        </div>
        </div>

        {sichtbar === 0 ? (
          <p className="karte__leer">
            Mit dieser Auswahl bleibt nichts übrig. Ruf uns an — wir finden trotzdem etwas.
          </p>
        ) : (
          <div className="karte__gruppen">
            {gruppen.map((gr) => (
            <div className="gruppe" key={gr.gruppe}>
              <h3 className="gruppe__titel">{gr.gruppe}</h3>
              {gr.hinweis && <p className="gruppe__hinweis">{gr.hinweis}</p>}

              <ul className="gruppe__liste">
                {gr.gerichte.map((g) => {
                  const id = kennung(g.name)
                  const anzahl = anzahlVon(g.name)
                  return (
                    <li className="zeile" id={id} key={id}>
                      <div className="zeile__wort">
                        {/* Name, Punktlinie, Preis — auf EINER Grundlinie.
                            Bei Monte und Corgi nachgesehen: in einer gesetzten
                            Speisekarte führt eine Punktlinie das Auge vom
                            Gericht zum Preis. Vorher stand der Preis irgendwo
                            rechts in der Zeile und die Punktlinie UNTER allem —
                            sie trennte, statt zu verbinden. */}
                        <div className="zeile__kopf">
                          <p className="zeile__name">
                            {/* Die Nummer von IHRER gedruckten Karte. Gäste
                                nennen am Telefon die Nummer — „einmal die
                                sieben" — und eine Seite, die sie nicht führt,
                                spricht eine andere Sprache als das Blatt an
                                der Wand. */}
                            {g.nr != null && <span className="zeile__nr">{g.nr}</span>}
                            {g.name}
                          </p>
                          <span className="zeile__leiter" aria-hidden="true" />
                          <p className={g.preis === null ? 'preis preis--folgt' : 'preis'}>
                            {g.preis === null ? (
                              <>
                                {/* Neunmal „Preis folgt" untereinander liest
                                    sich als unfertige Seite. Der Gedankenstrich
                                    ist die Konvention für „kein Wert", und den
                                    Grund sagt der Vorspann über der Karte in
                                    einem Satz — einmal statt neunmal. Für
                                    Vorleseprogramme steht er trotzdem hier. */}
                                <span className="visuell-versteckt">Preis folgt</span>
                                <span aria-hidden="true">—</span>
                              </>
                            ) : (
                              g.preis.toFixed(2).replace('.', ',') + ' €'
                            )}
                          </p>
                        </div>
                        <p className="zeile__beschreibung">{g.beschreibung}</p>
                        <p className="zeile__allergene">
                          <span className="visuell-versteckt">Enthält: </span>
                          {g.allergene.join(' · ')}
                        </p>
                      </div>

                      <div className="zaehler">
                        {anzahl > 0 && (
                          <>
                            <button
                              type="button"
                              className="zaehler__knopf"
                              onClick={() => minus(g.name)}
                            >
                              <span aria-hidden="true">−</span>
                              <span className="visuell-versteckt">
                                {g.name}: eins weniger
                              </span>
                            </button>
                            <span className="zaehler__stand" aria-hidden="true">
                              {anzahl}
                            </span>
                          </>
                        )}
                        <button
                          type="button"
                          className="zaehler__knopf zaehler__knopf--plus"
                          onClick={() => plus(g.name)}
                        >
                          <span aria-hidden="true">+</span>
                          <span className="visuell-versteckt">
                            {g.name} zur Bestellung hinzufügen
                            {anzahl > 0 ? `, aktuell ${anzahl}` : ''}
                          </span>
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
            ))}
          </div>
        )}
      </div>
    </Sektion>
  )
}
