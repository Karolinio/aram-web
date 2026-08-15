import { useSyncExternalStore } from 'react'

import { abonnieren, holen, type Auswahl } from './bestellung.ts'

/* Eine eingefrorene leere Liste. Gäbe die Funktion jedes Mal ein neues `[]`
   zurück, hielte React den Zustand für verändert und renderte endlos. */
const LEER: Auswahl = []

/**
 * Die aktuelle Bestellauswahl.
 *
 * `useSyncExternalStore` und nicht `useState` + Effekt, weil zwei weit
 * auseinanderliegende Stellen dieselbe Auswahl anzeigen: die Zeilen der
 * Speisekarte und die Leiste am unteren Rand. Mit zwei eigenen Zuständen
 * laufen sie irgendwann auseinander, und der Gast merkt es erst am fertigen
 * WhatsApp-Text.
 */
export const useBestellung = (): Auswahl => useSyncExternalStore(abonnieren, holen, () => LEER)
