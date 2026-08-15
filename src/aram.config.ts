/**
 * Alle Werte des Betriebs an EINER Stelle.
 *
 * Nichts davon steht irgendwo sonst im Code. Grund: bei Aram sind Adresse, Zeiten und
 * Impressum am 14.08.2026 noch nicht bekannt — der Inhaber ist im Urlaub. Mit dieser
 * Datei ist das Nachtragen ein Handgriff, ohne sie waere es eine Suchen-und-Ersetzen-
 * Aktion durch die halbe Seite.
 *
 * `null` heisst: fehlt noch, und die Seite ZEIGT das. Ein erfundener Wert waere
 * schlimmer als eine sichtbare Luecke — bei Oeffnungszeiten steht sonst jemand vor
 * einer verschlossenen Tuer.
 */

import { ZEITEN } from './oeffnung.ts'

export type Luecke = null

export const ARAM = {
  name: 'Aram',
  langname: 'Aram — Orientalisches Gebäck & Pizza',
  einzeiler: 'Frisch gebacken, mit Herz gemacht — orientalische Backkunst in Bonn.',

  kontakt: {
    /* Gemessen von der alten Seite. Dort steht sie in der Navigation OHNE fuehrende
       Null — auf dem Handy ruft die niemanden an. Hier korrigiert. */
    telefon: '0177 4637662',
    telefonHref: 'tel:+491774637662',
    /* Die Nummer ist eine Mobilnummer, WhatsApp ist im Fuss der alten Seite verlinkt. */
    whatsapp: 'https://wa.me/491774637662',
    mail: null as string | Luecke,
  },

  ort: {
    strasse: null as string | Luecke,
    plz: null as string | Luecke,
    stadt: 'Bonn-Hardtberg',
    /* Erst setzen, wenn die Adresse steht — eine Karte auf den falschen Punkt ist
       schlimmer als keine Karte. */
    maps: null as string | Luecke,
  },

  /* Die Öffnungszeiten stehen NICHT hier, sondern in `inhalt/zeiten.json`.
     Grund: die Seite rechnet daraus live, ob gerade offen ist, und diese Zahl
     ändert sich häufiger als alles andere auf dieser Seite. Zwei Quellen für
     dieselbe Angabe wären genau die Art von Drift, die einen Gast vor eine
     verschlossene Tür schickt. Siehe src/oeffnung.ts. */

  bestellen: {
    /* Demo-Schalter. Solange `false`, wird der Bereich als VORSCHAU gezeigt und ist
       nicht anklickbar — ein toter Bestellknopf kostet eine Bestellung, nicht einen
       Klick. Sobald Karol die echten Adressen hat: eintragen und auf true. */
    lieferando: { aktiv: false, url: null as string | Luecke },
    uberEats: { aktiv: false, url: null as string | Luecke },
    wolt: { aktiv: false, url: null as string | Luecke },
    /* Der Weg, der HEUTE schon funktioniert. */
    telefon: true,
    whatsapp: true,
  },

  recht: {
    /* Ohne diese vier geht die Seite nicht live. Absichtlich null.

       SPUR, nicht Wahrheit: auf ihrem eigenen Logo steht „Aram Pizzeria &
       gastronomie GmbH". Das ist ein starker Hinweis auf die Rechtsform, aber
       ein Logo ist kein Registereintrag. Bevor das hier eingetragen wird, muss
       jemand ins Handelsregister sehen — ein falscher Firmenname im Impressum
       ist genau der Fehler, den ein Impressum verhindern soll. */
    firma: null as string | Luecke,
    inhaber: null as string | Luecke,
    anschrift: null as string | Luecke,
    steuernummer: null as string | Luecke,
  },

  sozial: {
    instagram: null as string | Luecke,
    facebook: null as string | Luecke,
  },
} as const

/** Fehlt etwas, das vor dem Livegang stehen muss? */
export const lueckenVorLive = (): string[] => {
  const l: string[] = []
  if (!ARAM.ort.strasse) l.push('Anschrift')
  if (ZEITEN.length === 0) l.push('Öffnungszeiten')
  if (!ARAM.recht.firma) l.push('Impressum: Firma')
  if (!ARAM.recht.anschrift) l.push('Impressum: ladungsfähige Anschrift')
  if (!ARAM.kontakt.mail) l.push('E-Mail für Anfragen')
  return l
}
