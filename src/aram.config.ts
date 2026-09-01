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
  langname: 'Aram Pizzeria & orientalisches Gebäck',
  einzeiler: 'Frisch gebacken, mit Herz gemacht. Orientalische Backkunst in Bonn.',

  kontakt: {
    /* Gemessen von der alten Seite. Dort steht sie in der Navigation OHNE fuehrende
       Null — auf dem Handy ruft die niemanden an. Hier korrigiert. */
    telefon: '0177 4637662',
    telefonHref: 'tel:+491774637662',
    /* Die Nummer ist eine Mobilnummer, WhatsApp ist im Fuss der alten Seite verlinkt. */
    whatsapp: 'https://wa.me/491774637662',

    /**
     * Das Festnetz. Vom Inhaber am 30.08.2026 genannt und unabhaengig davon
     * auf ihrem eigenen Eintrag bestaetigt (Das Oertliche, Restaurantguru).
     * Zwei uebereinstimmende Quellen, also belegt.
     *
     * Es steht NEBEN der Mobilnummer, nicht an ihrer Stelle: die Mobilnummer
     * traegt WhatsApp und ist die, die auf ihrem Flyer steht. Ein Gast, der
     * lieber anruft als schreibt, bekommt trotzdem eine Festnetznummer — das
     * liest sich fuer einen Laden mit 25 Jahren anders als eine Handynummer
     * allein.
     */
    festnetz: '0228 18034488' as string | Luecke,
    festnetzHref: 'tel:+4922818034488',

    /* Vom Inhaber genannt und auf ihrem eigenen Eintrag bestaetigt. */
    mail: 'arampizzeria@gmail.com' as string | Luecke,
  },

  ort: {
    /* Abgelesen vom eigenen Flyer, Bild 7 vom 20.08.2026: „Rochusstraße 246,
       53123 Bonn", zweimal darauf — einmal als Überschrift, einmal im Fussteil.
       Zwei übereinstimmende Stellen auf demselben Druckstück sind ein Beleg,
       eine wäre ein Tippfehlerrisiko. Siehe rohbilder/FUNDE.md. */
    strasse: 'Rochusstraße 246' as string | Luecke,
    plz: '53123' as string | Luecke,
    stadt: 'Bonn',
    /* Der Stadtteil steht getrennt, weil er in die Sprache der Seite gehört
       („in Bonn-Hardtberg"), aber NICHT in eine Postanschrift. */
    stadtteil: 'Bonn-Hardtberg',
    /* Auf die Anschrift gesetzt, nicht auf eine Koordinate: eine Suchabfrage
       trifft auch dann, wenn sich die Hausnummerierung ändert. */
    maps: 'https://www.google.com/maps/search/?api=1&query=Rochusstra%C3%9Fe+246%2C+53123+Bonn' as string | Luecke,
    /* Vom Flyer: „PARKPLATZ IN DER NÄHE? JA! AUF DER URDEL, 53123 BONN" */
    parken: 'Auf der Urdel' as string | Luecke,
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
    /**
     * ═══ Übernommen aus IHREM eigenen Impressum ═══
     *
     * Karol am 01.09.: „Impressum kann man ja wohl das meiste von der
     * bestehenden Aram-Pizzeria-Seite ziehen, oder?" Ja — und ihre eigene
     * Erklärung ist die beste Quelle, die es gibt: sie ist das, wofür der
     * Betrieb selbst geradesteht.
     *
     * Auf sites.google.com/view/arampizzeria/kontakt steht als Anbieter
     * „Arfan Omar", Bäckerei, Rochusstraße 246, 53123 Bonn. Keine Rechtsform,
     * kein Register, keine USt-IdNr.
     *
     * ═══ Und die GmbH, die ich dabei gefunden habe ═══
     *
     * Es GIBT eine „Aram Pizzeria & orientalisches Gebäck GmbH" unter
     * derselben Anschrift, Amtsgericht Bonn HRB 28626. Sie steht hier trotzdem
     * nicht drin, und der Grund ist der wichtigste Fund dieser Recherche: das
     * Register führt sie mit einem LIQUIDATOR, letzte Eintragung 25.03.2024.
     * Eine Gesellschaft in Liquidation ist womöglich nicht mehr die, die den
     * Laden heute betreibt — und ihr eigenes Impressum nennt sie ja auch
     * nicht.
     *
     * Ein Impressum, das die falsche juristische Person nennt, ist genau der
     * Fehler, den ein Impressum verhindern soll. Deshalb steht hier die
     * natürliche Person aus ihrer eigenen Erklärung, und die Frage nach der
     * Rechtsform geht an den Inhaber, bevor die Seite live geht. Sagt er
     * „GmbH", kommen Firmenzusatz, Registergericht, HRB-Nummer und
     * Geschäftsführer dazu.
     */
    firma: 'Arfan Omar' as string | Luecke,
    inhaber: 'Arfan Omar' as string | Luecke,
    anschrift: 'Rochusstraße 246, 53123 Bonn' as string | Luecke,
    /**
     * `keine` ist kein Platzhalter, sondern eine Aussage.
     *
     * § 5 DDG verlangt die USt-IdNr nur, WENN eine vorhanden ist. Ihr eigenes
     * Impressum nennt keine, und ein Kleinbetrieb ohne innergemeinschaftliche
     * Geschäfte hat oft keine. Eine sichtbare Lücke an dieser Stelle würde
     * etwas als fehlend anmahnen, das gar nicht gefordert ist — deshalb der
     * dritte Zustand neben Wert und Lücke.
     */
    steuernummer: null as string | 'keine' | Luecke,
    /* Wer die Seite ausliefert, ist datenschutzrechtlich Auftragsverarbeiter
       und muss in der Erklärung stehen — mit Namen und Sitz. Solange es keinen
       Server gibt, gibt es auch keinen Hoster; die Erklärung sagt das offen,
       statt einen zu erfinden. */
    hoster: null as string | Luecke,
    /* Für Verbraucherstreitbeilegung: § 36 VSBG verlangt eine Aussage, ob man
       teilnimmt. Die übliche Antwort kleiner Betriebe ist „nein" — aber das
       muss der Betrieb sagen, nicht ich. */
    streitbeilegung: null as 'ja' | 'nein' | Luecke,
  },

  sozial: {
    instagram: null as string | Luecke,
    facebook: null as string | Luecke,
  },

  /**
   * Wo die Seite wohnt.
   *
   * ═══ Warum eine einzige Zeile so viel freischaltet ═══
   *
   * Ohne Domäne kann diese Seite drei Dinge NICHT:
   *
   *   1. Vorschaubilder in WhatsApp, Instagram und iMessage. Deren Scraper
   *      führen kein JavaScript aus und akzeptieren keine relativen Pfade —
   *      `og:image` braucht eine vollständige Adresse, sonst wird ein
   *      geteilter Link ein grauer Kasten.
   *   2. Einen kanonischen Verweis, damit nicht Vorschau- und Livefassung als
   *      zwei Seiten gezählt werden.
   *   3. Strukturierte Daten für Google mit einem `url`-Feld.
   *
   * Sobald hier eine Adresse steht, erzeugt das Vite-Plugin in vite.config.ts
   * alles drei beim Bauen. Solange sie fehlt, meldet der Bau es laut und lässt
   * die Angaben weg — eine halbe Angabe ist bei strukturierten Daten
   * schlimmer als keine.
   */
  web: {
    domain: null as string | Luecke,
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
  /* Seit dem 17.08. gibt es Impressum und Datenschutz als eigene Seiten. Damit
     werden zwei weitere Werte zur Livegang-Bedingung: ohne Hoster fehlt in der
     Datenschutzerklärung der Auftragsverarbeiter, ohne die VSBG-Aussage eine
     Pflichtangabe im Impressum. Beide Seiten ZEIGEN die Lücke — aber gezeigt
     heisst nicht erlaubt. */
  if (!ARAM.recht.hoster) l.push('Datenschutz: Name und Sitz des Hosters')
  if (!ARAM.recht.streitbeilegung) l.push('Impressum: Aussage zur Streitbeilegung')
  return l
}
