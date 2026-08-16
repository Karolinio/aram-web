import { ARAM } from './aram.config.ts'
import { ZEITEN } from './oeffnung.ts'

/**
 * Was Google und die Messenger über diesen Laden erfahren.
 *
 * ═══ Warum das der teuerste fehlende Posten war ═══
 *
 * Gäste suchen „Fatayer Bonn", nicht „Aram". Wer bei dieser Suche nicht
 * auftaucht, gewinnt durch keine Animation der Welt einen Gast dazu — und bis
 * zum 17.08.2026 stand in dieser Seite kein einziges strukturiertes Datum:
 * kein Betrieb, keine Öffnungszeiten, keine Küche, keine Karte, kein
 * Vorschaubild.
 *
 * ═══ Die eine Regel, die hier alles entscheidet ═══
 *
 * **Nur eintragen, was belegt ist.** Bei strukturierten Daten ist eine
 * erfundene Angabe schlimmer als eine fehlende: Google zeigt sie im
 * Suchergebnis an, und ein Gast steht dann wegen einer erfundenen
 * Öffnungszeit vor einer verschlossenen Tür. Genau dieselbe Regel gilt schon
 * auf der Seite selbst — hier gilt sie doppelt, weil die Angabe ausserhalb der
 * Seite auftaucht, wo niemand sie mehr richtigstellen kann.
 *
 * Deshalb baut diese Datei den Datensatz STÜCKWEISE aus dem, was in
 * `aram.config.ts` und `inhalt/zeiten.json` tatsächlich steht. Fehlt die
 * Anschrift, fehlt `address` — nicht „Bonn" als Näherung.
 */

type Json = Record<string, unknown>

/** Aus 0–6 (So–Sa) die Schreibweise, die schema.org erwartet. */
const TAGE = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

/**
 * Der Datensatz als Objekt.
 *
 * `FoodEstablishment` und nicht `Restaurant`: sie sind eine Backstube mit
 * Pizzeria, kein Restaurant mit Tischen. Der Untertyp ist keine Kosmetik — er
 * entscheidet, in welchen Ergebnissen Google die Seite überhaupt anbietet.
 */
export function strukturdaten(): Json {
  const d: Json = {
    '@context': 'https://schema.org',
    '@type': 'FoodEstablishment',
    name: ARAM.name,
    alternateName: ARAM.langname,
    description: ARAM.einzeiler,
    telephone: ARAM.kontakt.telefonHref.replace('tel:', ''),
    servesCuisine: ['Syrisch', 'Orientalisch', 'Pizza'],
  }

  if (ARAM.web.domain) {
    d.url = ARAM.web.domain
    d.image = `${ARAM.web.domain}/bilder/echt/team-laden.webp`
    d.logo = `${ARAM.web.domain}/bilder/echt/logo.webp`
  }

  if (ARAM.kontakt.mail) d.email = ARAM.kontakt.mail

  /* Die Anschrift nur GANZ oder gar nicht. Ein `PostalAddress` mit Stadt und
     ohne Strasse ist für eine Kartensuche wertlos und sieht im Ergebnis aus
     wie ein Fehler. */
  if (ARAM.ort.strasse && ARAM.ort.plz) {
    d.address = {
      '@type': 'PostalAddress',
      streetAddress: ARAM.ort.strasse,
      postalCode: ARAM.ort.plz,
      addressLocality: ARAM.ort.stadt,
      addressCountry: 'DE',
    }
  }

  if (ZEITEN.length > 0) {
    d.openingHoursSpecification = ZEITEN.map((z) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${TAGE[z.tag]}`,
      opens: z.von,
      closes: z.bis,
    }))
  }

  const sozial = [ARAM.sozial.instagram, ARAM.sozial.facebook].filter(Boolean)
  if (sozial.length > 0) d.sameAs = sozial

  return d
}

/**
 * Was fehlt, damit der Datensatz vollständig ist.
 *
 * Getrennt von `lueckenVorLive()` in aram.config.ts, weil es zwei
 * verschiedene Fragen sind: dort geht es um „darf die Seite überhaupt online"
 * (Rechtspflicht), hier um „wird sie gefunden" (Wirkung). Beides fehlt gerade,
 * aber nur eines davon ist ein Verbot.
 */
export function luecketStrukturdaten(): string[] {
  const l: string[] = []
  if (!ARAM.web.domain) l.push('Domäne — ohne sie kein Vorschaubild und kein url-Feld')
  if (!ARAM.ort.strasse || !ARAM.ort.plz) l.push('Anschrift — ohne sie keine Kartensuche')
  if (ZEITEN.length === 0) l.push('Öffnungszeiten — ohne sie kein „jetzt geöffnet" bei Google')
  if (!ARAM.kontakt.mail) l.push('E-Mail')
  if (!ARAM.sozial.instagram && !ARAM.sozial.facebook) l.push('Instagram oder Facebook')
  return l
}
