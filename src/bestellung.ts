/**
 * Bestellen per WhatsApp, mit fertig getipptem Text.
 *
 * ═══ Warum das die wichtigste Datei der Seite ist ═══
 *
 * Lieferando nimmt je nach Modell grob 13 bis um die 30 Prozent. Dieser Knopf
 * verschiebt Bestellungen auf einen Kanal, der nichts kostet. Das ist der Satz,
 * mit dem der Wert dieser Seite erklärt wird — nicht die Animation.
 *
 * ═══ Was es ausdrücklich NICHT ist ═══
 *
 * Kein Warenkorb im Sinne eines Shops. Keine Zahlung, keine Bestellverwaltung,
 * kein Widerrufsrecht, keine Betriebspflicht. Es entsteht ein Text, und den
 * schickt der Gast selbst ab. Alles darüber hinaus wäre ein Shop, und ein Shop
 * ist ein Betrieb, den hier niemand führen will.
 *
 * ═══ sessionStorage, nicht localStorage ═══
 *
 * Eine Bestellung von gestern, die morgen noch in der Leiste steht, ist ein
 * Fehler und kein Komfort. Mit dem Tab ist die Auswahl weg.
 */

import { ARAM } from './aram.config.ts'

export type Auswahl = { name: string; anzahl: number }[]

const SCHLUESSEL = 'aram.bestellung'
const MAX_PRO_GERICHT = 20

/* Ein winziger Speicher mit Abonnenten. Zwei Stellen der Seite lesen dieselbe
   Auswahl — die Zeilen der Karte und die Leiste unten. Ohne gemeinsame Quelle
   zeigen sie irgendwann Verschiedenes an, und das merkt der Gast erst im
   WhatsApp-Text. */
let auswahl: Auswahl = lesen()
const hoerer = new Set<() => void>()

function lesen(): Auswahl {
  if (typeof sessionStorage === 'undefined') return []
  try {
    const roh = sessionStorage.getItem(SCHLUESSEL)
    if (!roh) return []
    const geparst: unknown = JSON.parse(roh)
    if (!Array.isArray(geparst)) return []
    /* Fremder Inhalt im Speicher wird nicht geglaubt, sondern geprüft. */
    return geparst.flatMap((e): Auswahl => {
      if (typeof e !== 'object' || e === null) return []
      const { name, anzahl } = e as Record<string, unknown>
      if (typeof name !== 'string' || !name.trim()) return []
      if (typeof anzahl !== 'number' || !Number.isFinite(anzahl) || anzahl < 1) return []
      return [{ name, anzahl: Math.min(MAX_PRO_GERICHT, Math.floor(anzahl)) }]
    })
  } catch {
    return []
  }
}

function schreiben(neu: Auswahl) {
  auswahl = neu
  try {
    sessionStorage.setItem(SCHLUESSEL, JSON.stringify(neu))
  } catch {
    /* Privater Modus oder voller Speicher. Die Auswahl lebt dann nur im
       Arbeitsspeicher — das ist schlechter als Speichern, aber besser als ein
       Absturz beim Antippen eines Gerichts. */
  }
  for (const h of hoerer) h()
}

export const abonnieren = (h: () => void) => {
  hoerer.add(h)
  return () => {
    hoerer.delete(h)
  }
}

export const holen = (): Auswahl => auswahl

export const anzahlVon = (name: string): number =>
  auswahl.find((e) => e.name === name)?.anzahl ?? 0

export const plus = (name: string) => {
  const da = auswahl.find((e) => e.name === name)
  if (!da) return schreiben([...auswahl, { name, anzahl: 1 }])
  if (da.anzahl >= MAX_PRO_GERICHT) return
  schreiben(auswahl.map((e) => (e.name === name ? { ...e, anzahl: e.anzahl + 1 } : e)))
}

export const minus = (name: string) => {
  const da = auswahl.find((e) => e.name === name)
  if (!da) return
  if (da.anzahl <= 1) return schreiben(auswahl.filter((e) => e.name !== name))
  schreiben(auswahl.map((e) => (e.name === name ? { ...e, anzahl: e.anzahl - 1 } : e)))
}

export const leeren = () => schreiben([])

export const stueckZahl = (a: Auswahl = auswahl): number =>
  a.reduce((summe, e) => summe + e.anzahl, 0)

/** „Hallo! Ich würde gern bestellen: 2× Fatayer mit Spinat, 1× Lahmacun. Abholung in 20 Minuten?" */
export const nachricht = (a: Auswahl = auswahl): string => {
  const liste = a.map((e) => `${e.anzahl}× ${e.name}`).join(', ')
  return `Hallo! Ich würde gern bestellen: ${liste}. Abholung in 20 Minuten?`
}

/**
 * Der fertige Link. `encodeURIComponent` ist hier keine Formalie: ohne sie
 * bricht der Text am ersten `&` ab, und der Laden bekommt eine halbe Bestellung.
 */
export const whatsappLink = (a: Auswahl = auswahl): string =>
  `${ARAM.kontakt.whatsapp}?text=${encodeURIComponent(nachricht(a))}`
