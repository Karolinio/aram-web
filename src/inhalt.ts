/**
 * Die Verdrahtung des CMS.
 *
 * ═══ Das ist die Stelle, an der ein CMS zur Attrappe wird ═══
 *
 * `inhalt/schema.json` nennt für jeden Bereich ein `ziel` — die Adresse in den Daten
 * der Seite, an der sein Inhalt landet. Hier ist diese Adresse. Steht sie nicht, kann
 * der Kunde speichern, „gespeichert" lesen, und auf seiner Seite passiert nichts.
 *
 *   inhalt/hinweis.json      →  ziel: inhalt.hinweis      →  diese Datei, unten
 *   inhalt/speisekarte.json  →  ziel: inhalt.speisekarte  →  diese Datei, unten
 *
 * Gegengeprüft mit `node engine/inhalt-pruefen.mjs aram` in der Factory. Das Werkzeug
 * misst zusätzlich, ob der gespeicherte Text im gebauten Substrat wirklich vorkommt —
 * eine Behauptung reicht ihm nicht.
 */

import hinweisRoh from '../inhalt/hinweis.json'
import speisekarteRoh from '../inhalt/speisekarte.json'

export type Gericht = {
  name: string
  beschreibung: string
  /** `null` heisst: Preis fehlt noch. Wird als Lücke GEZEIGT, nicht erfunden. */
  preis: number | null
  /** Pflicht, sobald Preise online stehen (LMIV). Leer ist ein Befund, kein Zustand. */
  allergene: string[]
}

export type Gruppe = {
  gruppe: string
  hinweis: string
  gerichte: Gericht[]
}

export type Hinweis = {
  aktiv: boolean
  text: string
  bis: string | null
}

export const inhalt = {
  hinweis: hinweisRoh as Hinweis,
  speisekarte: speisekarteRoh as Gruppe[],
}

/** Ist der Hinweis heute noch gültig? Ein abgelaufener Urlaubshinweis ist schlimmer als keiner. */
export const hinweisGilt = (heute = new Date()): boolean => {
  const h = inhalt.hinweis
  if (!h.aktiv || !h.text.trim()) return false
  if (!h.bis) return true
  return new Date(h.bis) >= heute
}

/** Wie viele Preise fehlen noch? Wird in der Konsole gemeldet, solange welche fehlen. */
export const preiseFehlen = (): number =>
  inhalt.speisekarte.flatMap((g) => g.gerichte).filter((g) => g.preis === null).length
