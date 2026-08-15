/**
 * Ist gerade offen?
 *
 * ═══ Warum das eine eigene Datei ist ═══
 *
 * Weil es die einzige Zahl auf der Seite ist, die falsch sein KANN, ohne dass es
 * jemandem auffällt — bis ein Gast vor der Tür steht. Deshalb steht die Rechnung
 * hier, pur und ohne React, und lässt sich zu jeder beliebigen Uhrzeit prüfen.
 *
 * ═══ Drei Entscheidungen, die nicht offensichtlich sind ═══
 *
 * 1. Gerechnet wird in ORTSZEIT BERLIN, nicht in der Zeit des Besuchers.
 *    Wer aus Wien oder aus dem Urlaub auf die Seite kommt, soll erfahren, ob der
 *    Laden in Bonn offen hat — nicht, ob er es in seiner eigenen Zeitzone hätte.
 *
 * 2. Sind keine Zeiten hinterlegt, ist das Ergebnis `unbekannt` und die Seite
 *    zeigt NICHTS. Nicht „Zeiten auf Anfrage", nicht ein grauer Punkt. Nichts.
 *
 * 3. Über Mitternacht wird richtig gerechnet. `von 18:00 bis 01:00` ist eine
 *    Spanne von sieben Stunden, nicht eine negative.
 */

import zeitenRoh from '../inhalt/zeiten.json'

export type Spanne = {
  /** 0 = Sonntag, 1 = Montag ... 6 = Samstag. Wie `Date.getDay()`. */
  tag: number
  /** "HH:MM" in Ortszeit Berlin. */
  von: string
  bis: string
}

export type Status =
  /** Keine Zeiten hinterlegt. Die Seite zeigt dazu gar nichts. */
  | { art: 'unbekannt' }
  | { art: 'offen'; bis: string; minutenBisZu: number }
  | { art: 'zu'; von: string; tageBis: number; wochentag: string }

export const ZEITEN: Spanne[] = (zeitenRoh as { tage: Spanne[] }).tage

const TAG = 1440
const WOCHE = 7 * TAG

const WOCHENTAGE = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
]

/** "11:00" → 660. Ungültiges gibt NaN und wird von `status` übersprungen. */
export const minuten = (hhmm: string): number => {
  const [h, m] = hhmm.split(':')
  return Number(h) * 60 + Number(m)
}

const KURZTAGE: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
}

const berlin = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Berlin',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/** Wochentag und Minute des Tages in Ortszeit Berlin — unabhängig davon, wo der Besucher sitzt. */
export const berlinerZeit = (jetzt: Date): { tag: number; minute: number } => {
  const teile = berlin.formatToParts(jetzt)
  const hole = (art: string) => teile.find((t) => t.type === art)?.value ?? ''
  const stunde = Number(hole('hour')) % 24 /* 'en-GB' liefert Mitternacht als 24 */
  return {
    tag: KURZTAGE[hole('weekday')] ?? 0,
    minute: stunde * 60 + Number(hole('minute')),
  }
}

/** Eine Spanne als absolutes Minutenfenster in der Woche, plus Verschiebung um ganze Wochen. */
const fenster = (s: Spanne, wochen: number) => {
  const start = s.tag * TAG + minuten(s.von) + wochen * WOCHE
  /* Über Mitternacht: 18:00 → 01:00 sind 420 Minuten, nicht -1020. */
  const dauer = ((minuten(s.bis) - minuten(s.von) + TAG) % TAG) || TAG
  return { start, ende: start + dauer }
}

/**
 * Der Öffnungsstatus zu einem beliebigen Zeitpunkt.
 *
 * `jetzt` ist ein Parameter und keine versteckte `new Date()`, damit sich jede
 * Uhrzeit prüfen lässt, ohne die Systemuhr zu stellen.
 */
export const status = (jetzt: Date, zeiten: Spanne[] = ZEITEN): Status => {
  const gueltig = zeiten.filter(
    (s) =>
      Number.isInteger(s.tag) &&
      s.tag >= 0 &&
      s.tag <= 6 &&
      Number.isFinite(minuten(s.von)) &&
      Number.isFinite(minuten(s.bis)),
  )
  if (gueltig.length === 0) return { art: 'unbekannt' }

  const { tag, minute } = berlinerZeit(jetzt)
  const jetztAbs = tag * TAG + minute

  /* Die Vorwoche muss mit, sonst fällt eine Spanne, die um Mitternacht vom
     Samstag in den Sonntag läuft, durch das Raster. */
  for (const wochen of [-1, 0]) {
    for (const s of gueltig) {
      const f = fenster(s, wochen)
      if (jetztAbs >= f.start && jetztAbs < f.ende) {
        return { art: 'offen', bis: s.bis, minutenBisZu: f.ende - jetztAbs }
      }
    }
  }

  let naechste: { start: number; von: string } | null = null
  for (const wochen of [0, 1]) {
    for (const s of gueltig) {
      const f = fenster(s, wochen)
      if (f.start > jetztAbs && (!naechste || f.start < naechste.start)) {
        naechste = { start: f.start, von: s.von }
      }
    }
  }
  /* Kann nur eintreten, wenn `gueltig` leer wäre — das ist oben abgefangen. */
  if (!naechste) return { art: 'unbekannt' }

  return {
    art: 'zu',
    von: naechste.von,
    tageBis: Math.floor(naechste.start / TAG) - Math.floor(jetztAbs / TAG),
    wochentag: WOCHENTAGE[Math.floor(naechste.start / TAG) % 7],
  }
}

/** Der Satz, der auf der Seite steht. `null` heisst: es steht nichts da. */
export const statusText = (s: Status): string | null => {
  if (s.art === 'unbekannt') return null
  if (s.art === 'offen') {
    /* Die Restzeit nur nennen, wenn sie eine Entscheidung ändert. „Noch
       6 Stunden" ist keine Auskunft, „noch 40 Minuten" ist eine. */
    if (s.minutenBisZu <= 60) {
      return `Jetzt geöffnet · noch ${s.minutenBisZu} ${s.minutenBisZu === 1 ? 'Minute' : 'Minuten'}`
    }
    return `Jetzt geöffnet · bis ${s.bis} Uhr`
  }
  const wann = s.tageBis === 0 ? 'heute' : s.tageBis === 1 ? 'morgen' : s.wochentag
  return `Geschlossen · öffnet ${wann} um ${s.von} Uhr`
}
